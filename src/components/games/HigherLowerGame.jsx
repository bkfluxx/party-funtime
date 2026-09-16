import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Flame } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function HigherLowerGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState;
  const current = gameState.items[gameState.currentIndex];
  const next = gameState.items[gameState.currentIndex + 1];

  const handleGuess = (guess) => {
    sfx.playClick();
    onGameAction('guess', { guess });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>📈 Higher or Lower</span>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.2rem', color: '#f59e0b' }}>
          <Flame size={22} /> Streak: <strong>{gameState.streak}</strong>
        </div>

        {current && next && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: '1rem', alignItems: 'center' }}>
            {/* Current item card */}
            <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(30, 41, 59, 0.9)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>{current.name}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a5b4fc' }}>
                {current.value} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{current.unit}</span>
              </div>
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              VS
            </div>

            {/* Target guess card */}
            <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(30, 41, 59, 0.9)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>{next.name}</h3>

              {gameState.status === 'playing' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleGuess('higher')}
                    className="btn btn-primary"
                    style={{ padding: '0.8rem', fontSize: '1.1rem' }}
                  >
                    <ArrowUpCircle size={20} /> HIGHER ➔
                  </button>
                  <button
                    onClick={() => handleGuess('lower')}
                    className="btn btn-secondary"
                    style={{ padding: '0.8rem', fontSize: '1.1rem' }}
                  >
                    <ArrowDownCircle size={20} /> LOWER ➔
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#6ee7b7' }}>
                  {next.value} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{next.unit}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
