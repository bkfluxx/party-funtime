const FEUD_SURVEYS = [
  {
    prompt: "Name something people complain about during virtual meetings",
    answers: [
      { text: "Background Noise / Dog barking", points: 38 },
      { text: "Bad Wifi / Connection dropping", points: 26 },
      { text: "Forgetting to Unmute", points: 18 },
      { text: "Meeting running over time", points: 12 },
      { text: "Camera awkwardness", points: 6 }
    ]
  },
  {
    prompt: "Name a beverage developers drink while writing code",
    answers: [
      { text: "Coffee / Espresso", points: 45 },
      { text: "Water", points: 25 },
      { text: "Energy Drink", points: 15 },
      { text: "Tea", points: 10 },
      { text: "Soda / Sparkling Water", points: 5 }
    ]
  }
];

export function createFamilyFeudState(players, options = {}) {
  const survey = FEUD_SURVEYS[Math.floor(Math.random() * FEUD_SURVEYS.length)];
  return {
    status: 'playing', // 'playing', 'game_over'
    prompt: survey.prompt,
    answers: survey.answers.map(a => ({ ...a, revealed: false })),
    strikes: 0,
    maxStrikes: 3,
    totalScore: 0
  };
}

export function handleFamilyFeudAction(state, player, action, payload, room) {
  if (state.status !== 'playing') return null;

  if (action === 'guess_survey_answer') {
    const guess = payload.guess ? payload.guess.trim().toLowerCase() : '';
    
    // Find matching unrevealed answer
    const matchIndex = state.answers.findIndex(a => !a.revealed && a.text.toLowerCase().includes(guess));

    if (matchIndex !== -1) {
      const match = state.answers[matchIndex];
      match.revealed = true;
      state.totalScore += match.points;

      // Award points to player and team
      player.score = (player.score || 0) + (match.points * 10);

      const allRevealed = state.answers.every(a => a.revealed);
      if (allRevealed) {
        state.status = 'game_over';
      }

      return { type: 'answer_hit', index: matchIndex, answer: match, allRevealed };
    } else {
      state.strikes += 1;
      if (state.strikes >= state.maxStrikes) {
        state.status = 'game_over';
      }
      return { type: 'strike', strikes: state.strikes, status: state.status };
    }
  }

  return null;
}
