import React, { useState } from 'react';
import { Grid, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function ConnectionsGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState;
  const [selectedWords, setSelectedWords] = useState([]);

  const toggleSelect = (wordText) => {
    if (gameState.status !== 'playing') return;
    sfx.playClick();
    if (selectedWords.includes(wordText)) {
      setSelectedWords(selectedWords.filter(w => w !== wordText));
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, wordText]);
    }
  };

  const handleSubmit = () => {
    if (selectedWords.length !== 4) return;
    onGameAction('submit_group', { selectedItems: selectedWords });
    setSelectedWords([]);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>🧩 Connections</span>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Create 4 groups of 4 words that share a common connection!
        </h2>

        {/* Found categories banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {gameState.foundCategories.map((cat, idx) => (
            <div
              key={idx}
              style={{
                background: cat.color === 'yellow' ? 'rgba(245, 158, 11, 0.25)' :
                            cat.color === 'green' ? 'rgba(16, 185, 129, 0.25)' :
                            cat.color === 'blue' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(236, 72, 153, 0.25)',
                border: '1px solid var(--border-glass)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <strong style={{ fontSize: '1.1rem', display: 'block', textTransform: 'uppercase' }}>{cat.name}</strong>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{cat.items.join(', ')}</span>
            </div>
          ))}
        </div>

        {/* 4x4 Item Grid */}
        {gameState.status === 'playing' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {gameState.items.map((item) => {
                const isSelected = selectedWords.includes(item.text);
                return (
                  <button
                    key={item.text}
                    onClick={() => toggleSelect(item.text)}
                    style={{
                      padding: '1.25rem 0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>

            {/* Mistakes & Submit */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mistakes remaining:</span>
                {[...Array(gameState.mistakesRemaining)].map((_, i) => (
                  <span key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }}></span>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={selectedWords.length !== 4}
                className="btn btn-primary"
                style={{ padding: '0.8rem 2rem' }}
              >
                Submit Group ({selectedWords.length}/4)
              </button>
            </div>
          </div>
        )}

        {gameState.status === 'solved' && (
          <div style={{ color: '#6ee7b7', marginTop: '1rem' }}>
            <CheckCircle2 size={40} style={{ marginBottom: '0.5rem' }} />
            <h2>SOLVED! AMAZING WORDPLAY!</h2>
          </div>
        )}
      </div>
    </div>
  );
}
