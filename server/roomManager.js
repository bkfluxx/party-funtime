import { createPictionaryState, handlePictionaryAction } from './games/pictionary.js';
import { createTriviaState, handleTriviaAction } from './games/trivia.js';
import { createBombDefusalState, handleBombDefusalAction } from './games/bombDefusal.js';
import { createTwoTruthsState, handleTwoTruthsAction } from './games/twoTruths.js';
import { createGuessCrowdState, handleGuessCrowdAction } from './games/guessCrowd.js';
import { createConnectionsState, handleConnectionsAction } from './games/connections.js';
import { createHigherLowerState, handleHigherLowerAction } from './games/higherLower.js';
import { createCharadesState, handleCharadesAction } from './games/charades.js';
import { createEscapeRoomState, handleEscapeRoomAction } from './games/escapeRoom.js';
import { createWhoSaidThatState, handleWhoSaidThatAction } from './games/whoSaidThat.js';
import { createWordAssociationState, handleWordAssociationAction } from './games/wordAssociation.js';
import { createFamilyFeudState, handleFamilyFeudAction } from './games/familyFeud.js';

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.hostGraceTimers = new Map();
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  generateHostToken() {
    return 'HT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createRoom(hostSocketId, hostName, avatar) {
    const code = this.generateRoomCode();
    const hostToken = this.generateHostToken();

    const hostPlayer = {
      id: hostSocketId,
      name: hostName || 'Host',
      avatar: avatar || '🚀',
      color: '#6366f1',
      score: 0,
      isHost: true,
      connected: true
    };

    const room = {
      code,
      hostId: hostSocketId,
      hostToken,
      created: Date.now(),
      currentGame: null,
      gameState: null,
      players: new Map([[hostSocketId, hostPlayer]]),
      chatMessages: []
    };

    this.rooms.set(code, room);
    return { room, hostToken };
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase());
  }

  reconnectHost(code, newSocketId, hostToken) {
    const room = this.getRoom(code);
    if (!room) return { error: 'Room not found' };

    if (room.hostToken !== hostToken) {
      return { error: 'Invalid Host Security Token' };
    }

    if (this.hostGraceTimers.has(code)) {
      clearTimeout(this.hostGraceTimers.get(code));
      this.hostGraceTimers.delete(code);
    }

    const oldHostId = room.hostId;
    let hostPlayer = room.players.get(oldHostId);

    if (hostPlayer) {
      room.players.delete(oldHostId);
      hostPlayer.id = newSocketId;
      hostPlayer.connected = true;
      hostPlayer.isHost = true;
    } else {
      hostPlayer = {
        id: newSocketId,
        name: 'Host',
        avatar: '🚀',
        color: '#6366f1',
        score: 0,
        isHost: true,
        connected: true
      };
    }

    room.hostId = newSocketId;
    room.players.set(newSocketId, hostPlayer);

    return { room, player: hostPlayer, hostToken: room.hostToken };
  }

  joinRoom(code, socketId, name, avatar, providedHostToken) {
    const room = this.getRoom(code);
    if (!room) return { error: 'Room not found' };

    if (providedHostToken && providedHostToken === room.hostToken) {
      return this.reconnectHost(code, socketId, providedHostToken);
    }

    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'];
    const playerColor = colors[room.players.size % colors.length];

    const player = {
      id: socketId,
      name: name || `Player ${room.players.size + 1}`,
      avatar: avatar || '👾',
      color: playerColor,
      score: 0,
      isHost: room.players.size === 0,
      connected: true
    };

    if (room.players.size === 0) {
      room.hostId = socketId;
    }

    room.players.set(socketId, player);
    return { room, player };
  }

  removePlayer(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      if (room.players.has(socketId)) {
        const player = room.players.get(socketId);

        if (room.hostId === socketId) {
          player.connected = false;

          const timer = setTimeout(() => {
            const currentRoom = this.rooms.get(code);
            if (currentRoom && currentRoom.hostId === socketId) {
              currentRoom.players.delete(socketId);
              const remainingPlayers = Array.from(currentRoom.players.values()).filter(p => p.connected);
              if (remainingPlayers.length > 0) {
                const nextHost = remainingPlayers[0];
                currentRoom.hostId = nextHost.id;
                nextHost.isHost = true;
              }
            }
            this.hostGraceTimers.delete(code);
          }, 180000);

          this.hostGraceTimers.set(code, timer);
          return { room, player, hostDisconnected: true };
        } else {
          room.players.delete(socketId);
        }

        if (room.players.size === 0) {
          setTimeout(() => {
            const currentRoom = this.rooms.get(code);
            if (currentRoom && currentRoom.players.size === 0) {
              this.rooms.delete(code);
            }
          }, 600000);
        }

        return { room, player };
      }
    }
    return null;
  }

  startGame(code, gameType, options = {}) {
    const room = this.getRoom(code);
    if (!room) return null;

    if (!gameType || gameType === 'lobby') {
      room.currentGame = null;
      room.gameState = null;
      return room;
    }

    room.currentGame = gameType;
    const playerArray = Array.from(room.players.values());

    switch (gameType) {
      case 'pictionary':
        room.gameState = createPictionaryState(playerArray, options);
        break;
      case 'trivia':
        room.gameState = createTriviaState(playerArray, options);
        break;
      case 'bombDefusal':
        room.gameState = createBombDefusalState(playerArray, options);
        break;
      case 'twoTruths':
        room.gameState = createTwoTruthsState(playerArray, options);
        break;
      case 'guessCrowd':
        room.gameState = createGuessCrowdState(playerArray, options);
        break;
      case 'connections':
        room.gameState = createConnectionsState(playerArray, options);
        break;
      case 'higherLower':
        room.gameState = createHigherLowerState(playerArray, options);
        break;
      case 'charades':
        room.gameState = createCharadesState(playerArray, options);
        break;
      case 'escapeRoom':
        room.gameState = createEscapeRoomState(playerArray, options);
        break;
      case 'whoSaidThat':
        room.gameState = createWhoSaidThatState(playerArray, options);
        break;
      case 'wordAssociation':
        room.gameState = createWordAssociationState(playerArray, options);
        break;
      case 'familyFeud':
        room.gameState = createFamilyFeudState(playerArray, options);
        break;
      default:
        room.currentGame = null;
        room.gameState = null;
        break;
    }

    return room;
  }

  handleGameAction(code, playerId, action, payload) {
    const room = this.getRoom(code);
    if (!room || !room.gameState) return null;

    const player = room.players.get(playerId);
    if (!player) return null;

    let result = null;
    switch (room.currentGame) {
      case 'pictionary':
        result = handlePictionaryAction(room.gameState, player, action, payload, room);
        break;
      case 'trivia':
        result = handleTriviaAction(room.gameState, player, action, payload, room);
        break;
      case 'bombDefusal':
        result = handleBombDefusalAction(room.gameState, player, action, payload, room);
        break;
      case 'twoTruths':
        result = handleTwoTruthsAction(room.gameState, player, action, payload, room);
        break;
      case 'guessCrowd':
        result = handleGuessCrowdAction(room.gameState, player, action, payload, room);
        break;
      case 'connections':
        result = handleConnectionsAction(room.gameState, player, action, payload, room);
        break;
      case 'higherLower':
        result = handleHigherLowerAction(room.gameState, player, action, payload, room);
        break;
      case 'charades':
        result = handleCharadesAction(room.gameState, player, action, payload, room);
        break;
      case 'escapeRoom':
        result = handleEscapeRoomAction(room.gameState, player, action, payload, room);
        break;
      case 'whoSaidThat':
        result = handleWhoSaidThatAction(room.gameState, player, action, payload, room);
        break;
      case 'wordAssociation':
        result = handleWordAssociationAction(room.gameState, player, action, payload, room);
        break;
      case 'familyFeud':
        result = handleFamilyFeudAction(room.gameState, player, action, payload, room);
        break;
    }

    return result;
  }

  serializeRoom(room) {
    if (!room) return null;
    return {
      code: room.code,
      hostId: room.hostId,
      currentGame: room.currentGame,
      gameState: room.gameState,
      players: Array.from(room.players.values()),
      chatMessages: room.chatMessages.slice(-50)
    };
  }
}

export const roomManager = new RoomManager();
