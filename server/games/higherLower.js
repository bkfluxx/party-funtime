const ITEMS = [
  { name: "Average Cups of Coffee Consumed per Developer per Day", value: 3.2, unit: "cups" },
  { name: "Global Internet Users", value: 5.4, unit: "billion people" },
  { name: "Number of Keys on a Standard Full Keyboard", value: 104, unit: "keys" },
  { name: "Average Unread Emails in an Inbox", value: 1250, unit: "emails" },
  { name: "Pixels in 4K Ultra HD Resolution Width", value: 3840, unit: "pixels" },
  { name: "Height of Mount Everest", value: 8849, unit: "meters" }
];

export function createHigherLowerState(players, options = {}) {
  const shuffled = [...ITEMS].sort(() => 0.5 - Math.random());
  return {
    status: 'playing', // 'playing', 'game_over'
    items: shuffled,
    currentIndex: 0,
    streak: 0,
    bestStreak: 0
  };
}

export function handleHigherLowerAction(state, player, action, payload, room) {
  if (state.status !== 'playing') return null;

  if (action === 'guess') {
    const current = state.items[state.currentIndex];
    const next = state.items[state.currentIndex + 1];

    if (!next) {
      state.status = 'game_over';
      return { type: 'game_over', win: true };
    }

    const isHigher = next.value >= current.value;
    const userGuessHigher = payload.guess === 'higher';
    const isCorrect = (userGuessHigher && isHigher) || (!userGuessHigher && !isHigher);

    if (isCorrect) {
      state.streak += 1;
      state.currentIndex += 1;

      for (const p of room.players.values()) {
        p.score = (p.score || 0) + 300;
      }

      return {
        type: 'guess_result',
        isCorrect: true,
        item: next,
        streak: state.streak
      };
    } else {
      state.status = 'game_over';
      return {
        type: 'guess_result',
        isCorrect: false,
        item: next,
        streak: state.streak
      };
    }
  }

  return null;
}
