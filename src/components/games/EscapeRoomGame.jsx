import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Clock, Flame } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function EscapeRoomGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState || {};
  const [answerInput, setAnswerInput] = useState('');
  const isHost = room.hostId === playerId;

  const currentPuzzle = gameState.puzzles ? gameState.puzzles[gameState.currentStageIndex] : null;

  // Timer effect
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    const interval = setInterval(() => {
      if (isHost) {
        onGameAction('tick_timer');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.status, isHost]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerInput.trim()) return;
    sfx.playClick();
    onGameAction('submit_puzzle_answer', { answer: answerInput });
    setAnswerInput('');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>🔐 Escape Room</span>

        {/* Header Clock & Stage Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div className="badge badge-amber">
            Stage {gameState.currentStageIndex + 1} / {gameState.puzzles ? gameState.puzzles.length : 3}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', fontFamily: 'monospace' }}>
            <Clock size={20} />
            {Math.floor((gameState.timeLeft || 300) / 60)}:{((gameState.timeLeft || 300) % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Escape Status Banners */}
        {gameState.status === 'escaped' && (
          <div style={{ color: '#6ee7b7', padding: '2rem' }}>
            <CheckCircle2 size={48} style={{ marginBottom: '0.5rem' }} />
            <h2 style={{ fontSize: '2.2rem' }}>YOU ESCAPED THE ROOM!</h2>
            <p style={{ color: 'var(--text-muted)' }}>All puzzle stages solved before time ran out!</p>
          </div>
        )}

        {gameState.status === 'failed' && (
          <div style={{ color: '#fca5a5', padding: '2rem' }}>
            <ShieldAlert size={48} style={{ marginBottom: '0.5rem' }} />
            <h2 style={{ fontSize: '2.2rem' }}>TRAPPED! TIME EXPIRED</h2>
            <p style={{ color: 'var(--text-muted)' }}>Too many attempts or time ran out.</p>
          </div>
        )}

        {/* Active Stage Puzzle */}
        {gameState.status === 'playing' && currentPuzzle && (
          <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(30, 41, 59, 0.95)', border: '1.5px solid var(--primary)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#a5b4fc' }}>
              {currentPuzzle.title}
            </h3>

            <p style={{ fontSize: '1.15rem', lineHeight: '1.6', marginBottom: '2rem', fontStyle: 'italic', background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              "{currentPuzzle.clue}"
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Enter stage solution code..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
                <KeyRound size={18} /> Unlock
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
