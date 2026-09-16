export function createBombDefusalState(players, options = {}) {
  const defuserIndex = Math.floor(Math.random() * players.length);
  const defuser = players[defuserIndex];

  // Randomly generate bomb puzzle configuration
  const wires = [
    { color: 'red', cut: false },
    { color: 'blue', cut: false },
    { color: 'yellow', cut: false },
    { color: 'red', cut: false },
    { color: 'green', cut: false }
  ].sort(() => 0.5 - Math.random());

  // Target wire rule: Cut the 3rd wire if first wire is red, otherwise cut the 4th wire
  const correctWireIndex = wires[0].color === 'red' ? 2 : 3;

  // Keypad module: 4-digit code generated
  const passCode = `${Math.floor(1000 + Math.random() * 9000)}`;

  // Button module
  const buttonColors = ['RED', 'BLUE', 'YELLOW', 'GREEN'];
  const targetColor = buttonColors[Math.floor(Math.random() * buttonColors.length)];

  return {
    status: 'active', // 'active', 'defused', 'exploded'
    defuserSocketId: defuser ? defuser.id : null,
    defuserName: defuser ? defuser.name : 'Defuser',
    timeLeft: 120, // 2 minutes
    strikes: 0,
    maxStrikes: 3,
    modules: {
      wires: {
        wires,
        correctWireIndex,
        solved: false
      },
      keypad: {
        passCode,
        currentInput: '',
        solved: false
      },
      colorButton: {
        targetColor,
        pressed: false,
        solved: false
      }
    }
  };
}

export function handleBombDefusalAction(state, player, action, payload, room) {
  if (state.status !== 'active') return null;

  if (action === 'cut_wire') {
    if (player.id !== state.defuserSocketId) return null;
    const wireIdx = payload.wireIndex;
    const module = state.modules.wires;
    if (module.solved || module.wires[wireIdx].cut) return null;

    module.wires[wireIdx].cut = true;

    if (wireIdx === module.correctWireIndex) {
      module.solved = true;
      checkAllSolved(state, room);
      return { type: 'wire_success', wireIndex: wireIdx, allSolved: state.status === 'defused' };
    } else {
      state.strikes += 1;
      if (state.strikes >= state.maxStrikes) {
        state.status = 'exploded';
      }
      return { type: 'strike', strikes: state.strikes, status: state.status };
    }
  }

  if (action === 'submit_passcode') {
    if (player.id !== state.defuserSocketId) return null;
    const module = state.modules.keypad;
    if (module.solved) return null;

    if (payload.passcode === module.passCode) {
      module.solved = true;
      checkAllSolved(state, room);
      return { type: 'keypad_success', allSolved: state.status === 'defused' };
    } else {
      state.strikes += 1;
      if (state.strikes >= state.maxStrikes) {
        state.status = 'exploded';
      }
      return { type: 'strike', strikes: state.strikes, status: state.status };
    }
  }

  if (action === 'press_color_button') {
    if (player.id !== state.defuserSocketId) return null;
    const module = state.modules.colorButton;
    if (module.solved) return null;

    if (payload.color === module.targetColor) {
      module.solved = true;
      checkAllSolved(state, room);
      return { type: 'button_success', allSolved: state.status === 'defused' };
    } else {
      state.strikes += 1;
      if (state.strikes >= state.maxStrikes) {
        state.status = 'exploded';
      }
      return { type: 'strike', strikes: state.strikes, status: state.status };
    }
  }

  if (action === 'tick_timer') {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.status = 'exploded';
      return { type: 'exploded_time' };
    }
    return { type: 'timer_tick', timeLeft: state.timeLeft };
  }

  return null;
}

function checkAllSolved(state, room) {
  const { wires, keypad, colorButton } = state.modules;
  if (wires.solved && keypad.solved && colorButton.solved) {
    state.status = 'defused';
    // Award team bonus points!
    const points = 1000 + Math.max(0, state.timeLeft * 10);
    for (const p of room.players.values()) {
      p.score = (p.score || 0) + points;
    }
  }
}
