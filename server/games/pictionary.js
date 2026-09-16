const WORDS = [
  'Mute Button', 'Coffee Mug', 'Standup Meeting', 'Keyboard', 'Cat Meme',
  'Wifi Router', 'Rocket Ship', 'Pizza Slice', 'Deadline', 'Virtual High Five',
  'Spreadsheet', 'Donut', 'Brainstorm', 'Headphones', 'Water Cooler',
  'Team Celebration', 'Trophy', 'Lightbulb', 'Algorithm', 'Sandwich',
  'Sticky Note', 'Coffee Machine', 'Bug Fix', 'Screen Share', 'Paper Airplane'
];

export function createPictionaryState(players, options = {}) {
  const drawerIndex = 0;
  const wordChoices = getRandomWords(3);
  
  return {
    status: 'word_selection', // 'word_selection', 'drawing', 'round_end', 'game_over'
    round: 1,
    maxRounds: options.rounds || (players && players.length > 0 ? players.length : 3),
    currentDrawerId: players && players[drawerIndex] ? players[drawerIndex].id : null,
    drawerIndex,
    currentWord: null,
    wordChoices: wordChoices || [],
    timeLeft: 60,
    canvasData: [],
    correctGuessers: [],
    scores: {}
  };
}

function getRandomWords(count) {
  const shuffled = [...WORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function handlePictionaryAction(state, player, action, payload, room) {
  if (action === 'select_word') {
    if (player.id !== state.currentDrawerId || state.status !== 'word_selection') return null;
    state.currentWord = payload.word;
    state.status = 'drawing';
    state.timeLeft = 60;
    return { type: 'word_selected', word: state.currentWord, drawerId: state.currentDrawerId };
  }

  if (action === 'draw_stroke') {
    if (player.id !== state.currentDrawerId || state.status !== 'drawing') return null;
    state.canvasData.push(payload);
    return { type: 'draw_stroke', stroke: payload };
  }

  if (action === 'clear_canvas') {
    if (player.id !== state.currentDrawerId || state.status !== 'drawing') return null;
    state.canvasData = [];
    return { type: 'canvas_cleared' };
  }

  if (action === 'tick_timer') {
    if (state.status !== 'drawing') return null;
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.status = 'round_end';
      return { type: 'time_up' };
    }
    return { type: 'timer_tick', timeLeft: state.timeLeft };
  }

  if (action === 'guess_chat') {
    if (state.status !== 'drawing' || player.id === state.currentDrawerId) return null;
    const guess = payload.text ? payload.text.trim().toLowerCase() : '';
    const target = state.currentWord ? state.currentWord.toLowerCase() : '';

    if (guess === target && !state.correctGuessers.includes(player.id)) {
      state.correctGuessers.push(player.id);
      
      // Award points based on speed
      const points = Math.max(100, Math.floor(state.timeLeft * 15));
      player.score = (player.score || 0) + points;

      // Drawer also gets points
      const drawer = room.players.get(state.currentDrawerId);
      if (drawer) {
        drawer.score = (drawer.score || 0) + 50;
      }

      // Check if all non-drawers guessed
      const nonDrawers = Array.from(room.players.values()).filter(p => p.id !== state.currentDrawerId);
      const allGuessed = state.correctGuessers.length >= nonDrawers.length;

      if (allGuessed) {
        state.status = 'round_end';
      }

      return {
        type: 'correct_guess',
        guesserId: player.id,
        guesserName: player.name,
        points,
        allGuessed
      };
    }
    return { type: 'chat_message', player: player.name, color: player.color, text: payload.text };
  }

  if (action === 'next_round') {
    const players = Array.from(room.players.values());
    state.drawerIndex = (state.drawerIndex + 1) % players.length;
    state.currentDrawerId = players[state.drawerIndex]?.id;
    state.round += 1;

    if (state.round > state.maxRounds) {
      state.status = 'game_over';
      return { type: 'game_over' };
    } else {
      state.status = 'word_selection';
      state.wordChoices = getRandomWords(3);
      state.currentWord = null;
      state.canvasData = [];
      state.correctGuessers = [];
      state.timeLeft = 60;
      return { type: 'new_round', drawerId: state.currentDrawerId };
    }
  }

  return null;
}
