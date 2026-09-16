import React, { useState } from 'react';
import { UserCheck, CheckCircle2 } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function WhoSaidThatGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState || {};
  const [answerInput, setAnswerInput] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  const isHost = room.hostId === playerId;
  const currentAnswerItem = gameState.shuffledAnswers ? gameState.shuffledAnswers[gameState.currentAnswerIndex] : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerInput.trim()) return;
    sfx.playClick();
    onGameAction('submit_answer', { answer: answerInput });
  };

  const handleVoteAuthor = (authorId) => {
    if (selectedAuthor !== null || gameState.status !== 'voting') return;
    sfx.playClick();
    setSelectedAuthor(authorId);
    onGameAction('vote_author', { guessedAuthorId: authorId });
  };

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>🕵️ Who Said That?</span>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: '1.4' }}>
          "{gameState.prompt}"
        </h2>

        {/* Phase 1: Anonymous submission */}
        {gameState.status === 'submitting' && (
          <div>
            {!gameState.submissions?.[playerId] ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your anonymous response..."
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Submit</button>
              </form>
            ) : (
              <div style={{ color: '#6ee7b7' }}>
                <CheckCircle2 size={36} style={{ marginBottom: '0.5rem' }} />
                <h3>Anonymous response saved! Waiting for coworkers...</h3>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Voting on who wrote the answer */}
        {gameState.status === 'voting' && currentAnswerItem && (
          <div>
            <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(30, 41, 59, 0.9)', border: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>ANONYMOUS STATEMENT</span>
              <h3 style={{ fontSize: '1.6rem', color: '#a5b4fc', fontStyle: 'italic' }}>
                "{currentAnswerItem.text}"
              </h3>
            </div>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              Who on your team wrote this response?
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {room.players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleVoteAuthor(p.id)}
                  disabled={selectedAuthor !== null || p.id === currentAnswerItem.authorId}
                  className={`btn ${selectedAuthor === p.id ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ padding: '0.9rem', fontSize: '1rem', justifyContent: 'flex-start' }}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>{p.avatar}</span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3: Author reveal */}
        {gameState.status === 'reveal' && currentAnswerItem && (
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#6ee7b7', marginBottom: '1rem' }}>
              It Was Written By <strong style={{ color: 'white' }}>{room.players.find(p => p.id === currentAnswerItem.authorId)?.name}</strong>!
            </h2>

            {isHost && (
              <button
                onClick={() => { sfx.playClick(); onGameAction('next_answer'); }}
                className="btn btn-primary"
                style={{ padding: '0.8rem 2rem', marginTop: '1rem' }}
              >
                Next Anonymous Answer ➔
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
