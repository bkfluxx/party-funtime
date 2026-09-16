import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function WordAssociationGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState || {};
  const [wordInput, setWordInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!wordInput.trim()) return;
    sfx.playClick();
    onGameAction('submit_word', { word: wordInput });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>🔤 Word Association</span>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '2rem', lineHeight: '1.4' }}>
          "{gameState.prompt}"
        </h2>

        {gameState.status === 'submitting' && (
          <div>
            {!gameState.submissions?.[playerId] ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="First word that comes to mind..."
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Submit</button>
              </form>
            ) : (
              <div style={{ color: '#6ee7b7' }}>
                <CheckCircle2 size={36} style={{ marginBottom: '0.5rem' }} />
                <h3>Word submitted! Waiting for team matches...</h3>
              </div>
            )}
          </div>
        )}

        {gameState.status === 'reveal' && (
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#a5b4fc', marginBottom: '1.5rem' }}>Team Word Responses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
              {room.players.map((p) => {
                const res = gameState.actionResult?.results?.[p.id];
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1.25rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>{p.avatar}</span>
                      <strong>{p.name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <strong style={{ color: '#fcd34d', fontSize: '1.1rem', textTransform: 'uppercase' }}>"{res?.word || ''}"</strong>
                      {res?.matchCount > 1 && (
                        <span className="badge badge-emerald">MATCH x{res.matchCount} (+{res.points} pts)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
