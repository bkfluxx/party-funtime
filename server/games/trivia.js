const TRIVIA_QUESTIONS = [
  {
    question: "What does HTTP stand for?",
    options: ["HyperText Transfer Protocol", "High-Tech Text Processor", "Hyperlink Text Test Process", "Hyper Terminal Tool Program"],
    correctIndex: 0,
    category: "Tech & Coding"
  },
  {
    question: "Which planet in our solar system is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Saturn"],
    correctIndex: 2,
    category: "Science"
  },
  {
    question: "What year was the original iPhone released by Apple?",
    options: ["2005", "2007", "2009", "2010"],
    correctIndex: 1,
    category: "Tech & Pop Culture"
  },
  {
    question: "In remote work lore, what is the most commonly forgotten action?",
    options: ["Turning on camera", "Unmuting microphone", "Sharing screen", "Sending meeting link"],
    correctIndex: 1,
    category: "Office Culture"
  },
  {
    question: "Which programming language was created by Brendan Eich in just 10 days?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correctIndex: 2,
    category: "Tech & Coding"
  },
  {
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correctIndex: 2,
    category: "Geography"
  },
  {
    question: "Which company originally developed the Git version control system?",
    options: ["Linus Torvalds for Linux development", "Microsoft", "Google", "GitHub"],
    correctIndex: 0,
    category: "Tech & Coding"
  },
  {
    question: "What is the highest-grossing film of all time (unadjusted for inflation)?",
    options: ["Titanic", "Avengers: Endgame", "Avatar", "Star Wars: The Force Awakens"],
    correctIndex: 2,
    category: "Pop Culture"
  }
];

export function createTriviaState(players, options = {}) {
  const shuffled = [...TRIVIA_QUESTIONS].sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, options.questionCount || 5);

  return {
    status: 'question', // 'question', 'reveal', 'game_over'
    currentQuestionIndex: 0,
    questions: selectedQuestions,
    answers: {}, // { playerId: { optionIndex, timeSpentSec } }
    timeLeft: 15,
    maxRounds: selectedQuestions.length
  };
}

export function handleTriviaAction(state, player, action, payload, room) {
  if (action === 'submit_answer') {
    if (state.status !== 'question') return null;
    
    state.answers[player.id] = {
      optionIndex: payload.optionIndex,
      timeSpentSec: payload.timeSpentSec || 10
    };

    const totalPlayers = room.players.size;
    const answeredCount = Object.keys(state.answers).length;

    // Check if everyone answered
    if (answeredCount >= totalPlayers) {
      return revealQuestionResults(state, room);
    }

    return { type: 'answer_received', playerId: player.id };
  }

  if (action === 'time_up') {
    if (state.status !== 'question') return null;
    return revealQuestionResults(state, room);
  }

  if (action === 'next_question') {
    state.currentQuestionIndex += 1;
    if (state.currentQuestionIndex >= state.questions.length) {
      state.status = 'game_over';
      return { type: 'game_over' };
    } else {
      state.status = 'question';
      state.answers = {};
      state.timeLeft = 15;
      return { type: 'new_question', questionIndex: state.currentQuestionIndex };
    }
  }

  return null;
}

function revealQuestionResults(state, room) {
  state.status = 'reveal';
  const currentQ = state.questions[state.currentQuestionIndex];
  const results = {};

  for (const [playerId, player] of room.players.entries()) {
    const playerAns = state.answers[playerId];
    let points = 0;
    let isCorrect = false;

    if (playerAns && playerAns.optionIndex === currentQ.correctIndex) {
      isCorrect = true;
      // Speed multiplier: max 1000 points, minimum 500 for correct answer
      const speedFactor = Math.max(0, (15 - playerAns.timeSpentSec) / 15);
      points = Math.floor(500 + (speedFactor * 500));
      player.score = (player.score || 0) + points;
    }

    results[playerId] = {
      optionIndex: playerAns ? playerAns.optionIndex : null,
      isCorrect,
      pointsEarned: points,
      totalScore: player.score
    };
  }

  return {
    type: 'reveal_results',
    correctIndex: currentQ.correctIndex,
    results
  };
}
