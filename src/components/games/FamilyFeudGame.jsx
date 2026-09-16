import React, { useState } from 'react';
import { Award, Flame, CheckCircle2, X } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function FamilyFeudGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState || {};
  const [guessInput, setGuessInput] = useState('');

  const handleGuess = (e) => {
    e.preventDefault();
    if (!guessInput.trim()) return;
    sfx.playClick();
    onGameAction('guess_survey_answer', { guess: guessInput });
    setGuessInput('');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>🏆 Family Feud Style</span>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '2rem', lineHeight: '1.4' }}>
          "{gameState.prompt}"
        </h2>

        {/* Strikes & Total Score */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>STRIKES:</span>
            {[1, 2, 3].map((s) => (
              <span key={s} style={{ fontSize: '1.4rem', color: s <= (gameState.strikes || 0) ? '#ef4444' : '#475569' }}>
                ✖
              </span>
            ))}
          </div>

          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fcd34d' }}>
            BOARD TOTAL: {gameState.totalScore || 0} PTS
          </div>
        </div>

        {/* Revealed Board Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {gameState.answers?.map((ans, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                background: ans.revealed ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.3))' : 'rgba(30, 41, 59, 0.7)',
                border: ans.revealed ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.1)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem'
                }}>
                  {idx + 1}
                </span>
                <span>{ans.revealed ? ans.text : '••••••••••••••••••••'}</span>
              </div>

              <div>{ans.revealed ? `${ans.points} pts` : ''}</div>
            </div>
          ))}
        </div>

        {/* Guess Form */}
        {gameState.status === 'playing' && (
          <form onSubmit={handleGuess} style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Guess a top survey answer..."
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
              Guess Answer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
