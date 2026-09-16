const ESCAPE_PUZZLES = [
  {
    id: 1,
    title: "Stage 1: The Cryptographic Keypad",
    clue: "Decrypt the 4-digit code. The code is the year JavaScript was created minus 1990, followed by the number of letters in 'TEAM'.",
    answer: "519954", // 1995 - 1990 = 5, TEAM = 4 -> "54"
    codeLength: 2
  },
  {
    id: 2,
    title: "Stage 2: The Anagram Lock",
    clue: "Unscramble these letters to reveal the secret word: 'S Y N E R G Y'",
    answer: "SYNERGY"
  },
  {
    id: 3,
    title: "Stage 3: The Pattern Matrix",
    clue: "Complete the sequence: 2, 4, 8, 16, 32, __?",
    answer: "64"
  }
];

export function createEscapeRoomState(players, options = {}) {
  return {
    status: 'playing', // 'playing', 'escaped', 'failed'
    currentStageIndex: 0,
    puzzles: ESCAPE_PUZZLES,
    attempts: 0,
    maxAttempts: 10,
    timeLeft: 300, // 5 minutes team clock
    solvedStages: []
  };
}

export function handleEscapeRoomAction(state, player, action, payload, room) {
  if (state.status !== 'playing') return null;

  if (action === 'submit_puzzle_answer') {
    const currentPuzzle = state.puzzles[state.currentStageIndex];
    if (!currentPuzzle) return null;

    const inputAns = payload.answer ? payload.answer.trim().toUpperCase() : '';
    const targetAns = currentPuzzle.answer.toUpperCase();

    if (inputAns === targetAns) {
      state.solvedStages.push(currentPuzzle.id);
      state.currentStageIndex += 1;

      // Point rewards for team
      for (const p of room.players.values()) {
        p.score = (p.score || 0) + 400;
      }

      if (state.currentStageIndex >= state.puzzles.length) {
        state.status = 'escaped';
        // Big escape bonus!
        const bonus = 1000 + Math.max(0, state.timeLeft * 5);
        for (const p of room.players.values()) {
          p.score = (p.score || 0) + bonus;
        }
        return { type: 'stage_solved', allEscaped: true };
      }

      return { type: 'stage_solved', allEscaped: false, nextStage: state.currentStageIndex };
    } else {
      state.attempts += 1;
      if (state.attempts >= state.maxAttempts) {
        state.status = 'failed';
      }
      return { type: 'wrong_answer', attempts: state.attempts, status: state.status };
    }
  }

  if (action === 'tick_timer') {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.status = 'failed';
      return { type: 'time_up' };
    }
    return { type: 'timer_tick', timeLeft: state.timeLeft };
  }

  return null;
}
