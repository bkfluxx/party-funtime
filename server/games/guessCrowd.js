const PROMPTS = [
  "What is the most popular excuse for being 2 minutes late to a Teams call?",
  "What is the best item to order for a team lunch?",
  "Which superpower would be most useful in an office environment?",
  "What is the ultimate Friday afternoon activity?",
  "Which tab on your web browser do you open first every morning?"
];

export function createGuessCrowdState(players, options = {}) {
  const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  return {
    status: 'submitting', // 'submitting', 'predicting', 'reveal', 'game_over'
    prompt,
    answers: {}, // { playerId: answerText }
    predictions: {} // { playerId: guessedTopAnswer }
  };
}

export function handleGuessCrowdAction(state, player, action, payload, room) {
  if (action === 'submit_answer') {
    if (state.status !== 'submitting') return null;
    state.answers[player.id] = payload.answer ? payload.answer.trim() : '';

    if (Object.keys(state.answers).length >= room.players.size) {
      state.status = 'predicting';
      return { type: 'predicting_started', allAnswers: Object.values(state.answers) };
    }
    return { type: 'answer_submitted', playerId: player.id };
  }

  if (action === 'submit_prediction') {
    if (state.status !== 'predicting') return null;
    state.predictions[player.id] = payload.prediction;

    if (Object.keys(state.predictions).length >= room.players.size) {
      return revealCrowdResults(state, room);
    }
    return { type: 'prediction_submitted', playerId: player.id };
  }

  return null;
}

function revealCrowdResults(state, room) {
  state.status = 'reveal';

  // Count answer frequencies
  const counts = {};
  for (const ans of Object.values(state.answers)) {
    const key = ans.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  }

  // Find top answer
  let topAnswer = '';
  let maxCount = 0;
  for (const [ans, cnt] of Object.entries(counts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      topAnswer = ans;
    }
  }

  const results = {};
  for (const [playerId, player] of room.players.entries()) {
    const pred = state.predictions[playerId] ? state.predictions[playerId].toLowerCase() : '';
    const isCorrect = pred === topAnswer;
    const points = isCorrect ? 750 : 0;
    player.score = (player.score || 0) + points;

    results[playerId] = {
      userAnswer: state.answers[playerId],
      prediction: state.predictions[playerId],
      isCorrect,
      points
    };
  }

  return {
    type: 'reveal_crowd_results',
    topAnswer,
    counts,
    results
  };
}
