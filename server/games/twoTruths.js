export function createTwoTruthsState(players, options = {}) {
  return {
    status: 'submitting', // 'submitting', 'voting', 'reveal', 'game_over'
    currentPlayerIndex: 0,
    playerSubmissions: {}, // { playerId: [stmt1, stmt2, stmt3], lieIndex: number }
    votes: {}, // { voterId: selectedIndex }
    currentSubjectId: null
  };
}

export function handleTwoTruthsAction(state, player, action, payload, room) {
  if (action === 'submit_statements') {
    if (state.status !== 'submitting') return null;
    
    state.playerSubmissions[player.id] = {
      statements: [payload.stmt1, payload.stmt2, payload.stmt3],
      lieIndex: parseInt(payload.lieIndex, 10) // 0, 1, or 2
    };

    const submittedCount = Object.keys(state.playerSubmissions).length;
    if (submittedCount >= room.players.size) {
      // Start voting rounds
      state.status = 'voting';
      const players = Array.from(room.players.values());
      state.currentPlayerIndex = 0;
      state.currentSubjectId = players[0]?.id;
      state.votes = {};
      return { type: 'voting_started', subjectId: state.currentSubjectId };
    }

    return { type: 'submission_received', playerId: player.id };
  }

  if (action === 'vote_lie') {
    if (state.status !== 'voting' || player.id === state.currentSubjectId) return null;

    state.votes[player.id] = payload.statementIndex;

    const nonSubjectCount = room.players.size - 1;
    const voteCount = Object.keys(state.votes).length;

    if (voteCount >= nonSubjectCount) {
      return revealLieResults(state, room);
    }

    return { type: 'vote_registered', voterId: player.id };
  }

  if (action === 'next_round') {
    const players = Array.from(room.players.values());
    state.currentPlayerIndex += 1;

    if (state.currentPlayerIndex >= players.length) {
      state.status = 'game_over';
      return { type: 'game_over' };
    } else {
      state.status = 'voting';
      state.currentSubjectId = players[state.currentPlayerIndex]?.id;
      state.votes = {};
      return { type: 'new_voting_round', subjectId: state.currentSubjectId };
    }
  }

  return null;
}

function revealLieResults(state, room) {
  state.status = 'reveal';
  const submission = state.playerSubmissions[state.currentSubjectId];
  const lieIndex = submission.lieIndex;
  const results = {};

  let trickedCount = 0;

  for (const [playerId, player] of room.players.entries()) {
    if (playerId === state.currentSubjectId) continue;

    const vote = state.votes[playerId];
    const isCorrect = vote === lieIndex;
    let points = 0;

    if (isCorrect) {
      points = 500;
      player.score = (player.score || 0) + points;
    } else {
      trickedCount += 1;
    }

    results[playerId] = {
      vote,
      isCorrect,
      points
    };
  }

  // Subject gets points for every player they fooled!
  const subjectPlayer = room.players.get(state.currentSubjectId);
  if (subjectPlayer) {
    const subjectBonus = trickedCount * 300;
    subjectPlayer.score = (subjectPlayer.score || 0) + subjectBonus;
  }

  return {
    type: 'reveal_lie_results',
    lieIndex,
    results,
    subjectId: state.currentSubjectId
  };
}
