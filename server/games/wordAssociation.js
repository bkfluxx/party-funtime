const ASSOCIATION_PROMPTS = [
  "Name something you bring to a beach",
  "Name a popular breakfast food",
  "Name a coding language",
  "Name a superhero",
  "Name an office supply"
];

export function createWordAssociationState(players, options = {}) {
  const prompt = ASSOCIATION_PROMPTS[Math.floor(Math.random() * ASSOCIATION_PROMPTS.length)];
  return {
    status: 'submitting', // 'submitting', 'reveal', 'game_over'
    prompt,
    submissions: {}, // { playerId: wordText }
    matches: []
  };
}

export function handleWordAssociationAction(state, player, action, payload, room) {
  if (action === 'submit_word') {
    if (state.status !== 'submitting') return null;
    state.submissions[player.id] = payload.word ? payload.word.trim().toLowerCase() : '';

    if (Object.keys(state.submissions).length >= room.players.size) {
      return revealAssociationResults(state, room);
    }
    return { type: 'word_submitted', playerId: player.id };
  }

  return null;
}

function revealAssociationResults(state, room) {
  state.status = 'reveal';

  // Group matching words
  const wordCounts = {};
  for (const word of Object.values(state.submissions)) {
    if (!word) continue;
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  const results = {};
  for (const [playerId, player] of room.players.entries()) {
    const userWord = state.submissions[playerId] || '';
    const matchCount = wordCounts[userWord] || 0;
    
    // Points multiplier for team matching
    let points = 0;
    if (matchCount > 1) {
      points = matchCount * 300;
      player.score = (player.score || 0) + points;
    }

    results[playerId] = {
      word: userWord,
      matchCount,
      points
    };
  }

  return {
    type: 'reveal_association_results',
    wordCounts,
    results
  };
}
