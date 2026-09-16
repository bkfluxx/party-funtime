import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { QRModal } from './components/QRModal';
import { Scoreboard } from './components/Scoreboard';
import { HostControlPanel } from './components/HostControlPanel';
import { PictionaryGame } from './components/games/PictionaryGame';
import { TriviaGame } from './components/games/TriviaGame';
import { BombDefusalGame } from './components/games/BombDefusalGame';
import { TwoTruthsGame } from './components/games/TwoTruthsGame';
import { GuessCrowdGame } from './components/games/GuessCrowdGame';
import { ConnectionsGame } from './components/games/ConnectionsGame';
import { HigherLowerGame } from './components/games/HigherLowerGame';
import { CharadesGame } from './components/games/CharadesGame';
import { EscapeRoomGame } from './components/games/EscapeRoomGame';
import { WhoSaidThatGame } from './components/games/WhoSaidThatGame';
import { WordAssociationGame } from './components/games/WordAssociationGame';
import { FamilyFeudGame } from './components/games/FamilyFeudGame';
import { sfx } from './utils/sfx';

export function App() {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [hostToken, setHostToken] = useState(null);

  const [showQR, setShowQR] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const socketUri = window.location.origin;
    const newSocket = io(socketUri, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setPlayerId(newSocket.id);

      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      const hostKeyParam = params.get('hostKey');

      if (roomParam) {
        const storedHostToken = hostKeyParam || localStorage.getItem(`party_funtime_host_token_${roomParam.toUpperCase()}`);
        if (storedHostToken) {
          newSocket.emit('reconnect_host', { code: roomParam, hostToken: storedHostToken });
        }
      }
    });

    newSocket.on('room_joined', ({ room, playerId, hostToken: token }) => {
      setRoom(room);
      setPlayerId(playerId);
      setErrorMessage(null);

      if (token) {
        setHostToken(token);
        localStorage.setItem(`party_funtime_host_token_${room.code}`, token);
      }
    });

    newSocket.on('host_reconnected', ({ hostName }) => {
      setNotification(`👑 Host (${hostName}) reconnected to the room!`);
      sfx.playSuccess();
      setTimeout(() => setNotification(null), 4000);
    });

    newSocket.on('room_updated', ({ room }) => {
      setRoom(room);
    });

    newSocket.on('game_started', ({ room }) => {
      setRoom(room);
      sfx.playSuccess();
    });

    newSocket.on('game_state_updated', ({ room }) => {
      setRoom(room);
    });

    newSocket.on('error_message', ({ message }) => {
      setErrorMessage(message);
      sfx.playError();
    });

    return () => newSocket.close();
  }, []);

  const handleCreateRoom = (name, avatar) => {
    if (!socket) return;
    socket.emit('create_room', { name, avatar });
  };

  const handleJoinRoom = (code, name, avatar) => {
    if (!socket) return;
    const cleanCode = code ? code.toUpperCase() : '';
    const savedToken = localStorage.getItem(`party_funtime_host_token_${cleanCode}`);
    socket.emit('join_room', { code: cleanCode, name, avatar, hostToken: savedToken });
  };

  const handleStartGame = (gameType, options = {}) => {
    if (!socket || !room) return;
    socket.emit('start_game', { code: room.code, gameType, options });
  };

  const handleGameAction = (action, payload = {}) => {
    if (!socket || !room) return;
    socket.emit('game_action', { code: room.code, action, payload });
  };

  const handleReturnLobby = () => {
    if (!socket || !room) return;
    socket.emit('start_game', { code: room.code, gameType: null });
  };

  const handleSkipRound = () => {
    if (!socket || !room) return;
    socket.emit('game_action', { code: room.code, action: 'next_round' });
  };

  const handleEndGame = () => {
    if (!socket || !room) return;
    socket.emit('start_game', { code: room.code, gameType: null });
  };

  const toggleMute = () => {
    const muted = sfx.toggleMute();
    setIsMuted(muted);
  };

  const isHost = room && room.hostId === playerId;
  const isGameOver = room?.gameState?.status === 'game_over';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        room={room}
        onOpenQR={() => setShowQR(true)}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {notification && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.9)',
          color: 'white',
          textAlign: 'center',
          padding: '0.75rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
        }}>
          {notification}
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          textAlign: 'center',
          padding: '0.75rem',
          fontWeight: 'bold'
        }}>
          {errorMessage}
        </div>
      )}

      {/* Main View Switcher for All 12 Games */}
      <main style={{ flex: 1 }}>
        {!room || !room.currentGame ? (
          <Lobby
            room={room}
            playerId={playerId}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartGame={handleStartGame}
          />
        ) : isGameOver ? (
          <Scoreboard
            room={room}
            playerId={playerId}
            onReturnLobby={handleReturnLobby}
          />
        ) : (
          <>
            {room.currentGame === 'pictionary' && (
              <PictionaryGame room={room} playerId={playerId} socket={socket} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'trivia' && (
              <TriviaGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'bombDefusal' && (
              <BombDefusalGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'twoTruths' && (
              <TwoTruthsGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'guessCrowd' && (
              <GuessCrowdGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'connections' && (
              <ConnectionsGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'higherLower' && (
              <HigherLowerGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'charades' && (
              <CharadesGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'escapeRoom' && (
              <EscapeRoomGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'whoSaidThat' && (
              <WhoSaidThatGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'wordAssociation' && (
              <WordAssociationGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
            {room.currentGame === 'familyFeud' && (
              <FamilyFeudGame room={room} playerId={playerId} onGameAction={handleGameAction} />
            )}
          </>
        )}
      </main>

      {/* Isolated Host Control Panel */}
      {isHost && (
        <HostControlPanel
          room={room}
          hostToken={hostToken}
          onReturnLobby={handleReturnLobby}
          onSkipRound={handleSkipRound}
          onEndGame={handleEndGame}
        />
      )}

      {/* QR Code Modal */}
      {showQR && room && (
        <QRModal code={room.code} onClose={() => setShowQR(false)} />
      )}
    </div>
  );
}
