import React from 'react';
import { Eye, Award, CheckCircle2, RotateCw } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function CharadesGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState;
  const isActor = gameState.actorSocketId === playerId;
  const isHost = room.hostId === playerId;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <span className="badge badge-pink" style={{ marginBottom: '0.5rem' }}>🎭 Charades Assistant</span>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>
          Current Actor: <strong style={{ color: '#f472b6' }}>{gameState.actorName}</strong>
        </h2>

        {/* Actor Secret Display */}
        {isActor ? (
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', border: '2px dashed #ec4899', padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>YOUR SECRET ACTING PROMPT (DON'T SHOW YOUR SCREEN!)</span>
            <strong style={{ fontSize: '2rem', color: '#f472b6' }}>"{gameState.prompt}"</strong>
          </div>
        ) : (
          <div style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <Eye size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              Watch {gameState.actorName} act out the secret prompt over Teams and guess out loud!
            </p>
          </div>
        )}

        {/* Host controls */}
        {isHost && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => { sfx.playSuccess(); onGameAction('award_points'); }}
              className="btn btn-primary"
              style={{ padding: '0.9rem 2rem' }}
            >
              <CheckCircle2 size={18} /> Team Guessed Correctly! (+500 pts)
            </button>
            <button
              onClick={() => { sfx.playClick(); onGameAction('next_prompt'); }}
              className="btn btn-outline"
              style={{ padding: '0.9rem 1.5rem' }}
            >
              <RotateCw size={18} /> Next Actor / Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
