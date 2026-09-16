const CHARADES_PROMPTS = [
  "Working from home in pajamas",
  "Trying to unmute while eating lunch",
  "Cat walking across the keyboard",
  "Screen freezing during important demo",
  "Coffee machine breaking down",
  "Typing furiously while on mute",
  "Building a Lego tower",
  "Playing VR video games"
];

export function createCharadesState(players, options = {}) {
  const actor = players[Math.floor(Math.random() * players.length)];
  const prompt = CHARADES_PROMPTS[Math.floor(Math.random() * CHARADES_PROMPTS.length)];

  return {
    status: 'acting', // 'acting', 'scored'
    actorSocketId: actor ? actor.id : null,
    actorName: actor ? actor.name : 'Actor',
    prompt,
    timeLeft: 90
  };
}

export function handleCharadesAction(state, player, action, payload, room) {
  if (action === 'award_points') {
    if (!player.isHost) return null;

    // Award team and actor points
    for (const p of room.players.values()) {
      p.score = (p.score || 0) + 500;
    }

    state.status = 'scored';
    return { type: 'charades_scored', prompt: state.prompt };
  }

  if (action === 'next_prompt') {
    const actor = Array.from(room.players.values())[Math.floor(Math.random() * room.players.size)];
    state.actorSocketId = actor ? actor.id : null;
    state.actorName = actor ? actor.name : 'Actor';
    state.prompt = CHARADES_PROMPTS[Math.floor(Math.random() * CHARADES_PROMPTS.length)];
    state.status = 'acting';
    return { type: 'new_charades_prompt', actorId: state.actorSocketId, actorName: state.actorName };
  }

  return null;
}
