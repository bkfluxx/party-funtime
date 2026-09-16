const ANONYMOUS_PROMPTS = [
  "What is the strangest item currently on your desk?",
  "If you could eliminate one word from business jargon forever, what would it be?",
  "What is your secret productivity hack when working from home?",
  "What was your very first job growing up?"
];

export function createWhoSaidThatState(players, options = {}) {
  const prompt = ANONYMOUS_PROMPTS[Math.floor(Math.random() * ANONYMOUS_PROMPTS.length)];
  return {
    status: 'submitting', // 'submitting', 'voting', 'reveal', 'game_over'
    prompt,
    submissions: {}, // { playerId: answerText }
    shuffledAnswers: [],
    currentAnswerIndex: 0,
    votes: {}, // { voterId: guessedPlayerId }
  };
}

export function handleWhoSaidThatAction(state, player, action, payload, room) {
  if (action === 'submit_answer') {
    if (state.status !== 'submitting') return null;
    state.submissions[player.id] = payload.answer ? payload.answer.trim() : '';

    if (Object.keys(state.submissions).length >= room.players.size) {
      state.status = 'voting';
      const answers = Object.entries(state.submissions).map(([authorId, text]) => ({
        authorId,
        text
      })).sort(() => 0.5 - Math.random());

      state.shuffledAnswers = answers;
      state.currentAnswerIndex = 0;
      state.votes = {};

      return { type: 'voting_started', answer: answers[0] };
    }

    return { type: 'submission_received', playerId: player.id };
  }

  if (action === 'vote_author') {
    if (state.status !== 'voting') return null;
    state.votes[player.id] = payload.guessedAuthorId;

    const nonAuthorCount = room.players.size - 1;
    if (Object.keys(state.votes).length >= nonAuthorCount) {
      return revealWhoSaidThatResults(state, room);
    }

    return { type: 'vote_registered', voterId: player.id };
  }

  if (action === 'next_answer') {
    state.currentAnswerIndex += 1;
    if (state.currentAnswerIndex >= state.shuffledAnswers.length) {
      state.status = 'game_over';
      return { type: 'game_over' };
    } else {
      state.status = 'voting';
      state.votes = {};
      return { type: 'new_answer_voting', answer: state.shuffledAnswers[state.currentAnswerIndex] };
    }
  }

  return null;
}

function revealWhoSaidThatResults(state, room) {
  state.status = 'reveal';
  const currentItem = state.shuffledAnswers[state.currentAnswerIndex];
  const actualAuthorId = currentItem.authorId;
  const results = {};

  let fooledCount = 0;

  for (const [playerId, player] of room.players.entries()) {
    if (playerId === actualAuthorId) continue;
    const vote = state.votes[playerId];
    const isCorrect = vote === actualAuthorId;
    let points = 0;

    if (isCorrect) {
      points = 500;
      player.score = (player.score || 0) + points;
    } else {
      fooledCount += 1;
    }

    results[playerId] = {
      vote,
      isCorrect,
      points
    };
  }

  // Author gets bonus for fooling team
  const authorPlayer = room.players.get(actualAuthorId);
  if (authorPlayer) {
    const bonus = fooledCount * 250;
    authorPlayer.score = (authorPlayer.score || 0) + bonus;
  }

  return {
    type: 'reveal_author_results',
    actualAuthorId,
    results
  };
}
