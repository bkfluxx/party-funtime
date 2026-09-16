import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, CheckCircle2, XCircle, Award } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function TriviaGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState;
  const currentQ = gameState.questions[gameState.currentQuestionIndex];
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    setSelectedOption(null);
    setTimeSpent(0);
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.currentQuestionIndex]);

  const handleSelect = (idx) => {
    if (selectedOption !== null || gameState.status !== 'question') return;
    sfx.playClick();
    setSelectedOption(idx);
    onGameAction('submit_answer', { optionIndex: idx, timeSpentSec: timeSpent });
  };

  const isHost = room.hostId === playerId;
  const playerResult = gameState.status === 'reveal' && gameState.results ? gameState.results[playerId] : null;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge badge-purple" style={{ marginRight: '0.5rem' }}>Question {gameState.currentQuestionIndex + 1} / {gameState.maxRounds}</span>
          <span className="badge badge-amber">{currentQ.category}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', color: '#fcd34d' }}>
          <Clock size={18} /> {gameState.status === 'question' ? `${15 - timeSpent}s` : 'Revealed'}
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '2rem', lineHeight: '1.4' }}>
          {currentQ.question}
        </h2>

        {/* Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {currentQ.options.map((opt, idx) => {
            let btnStyle = 'btn-outline';
            if (gameState.status === 'reveal') {
              if (idx === currentQ.correctIndex) {
                btnStyle = 'btn-primary'; // Correct option highlight
              } else if (selectedOption === idx) {
                btnStyle = 'btn-danger';
              }
            } else if (selectedOption === idx) {
              btnStyle = 'btn-secondary';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={gameState.status !== 'question' || selectedOption !== null}
                className={`btn ${btnStyle}`}
                style={{
                  padding: '1.25rem',
                  fontSize: '1.05rem',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.5rem',
                  fontSize: '0.85rem'
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Answer Result Banner */}
      {gameState.status === 'reveal' && playerResult && (
        <div className="glass-panel" style={{
          padding: '1.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          background: playerResult.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          borderColor: playerResult.isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
        }}>
          {playerResult.isCorrect ? (
            <div style={{ color: '#6ee7b7' }}>
              <CheckCircle2 size={36} style={{ marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.4rem' }}>Correct! +{playerResult.pointsEarned} pts</h3>
            </div>
          ) : (
            <div style={{ color: '#fca5a5' }}>
              <XCircle size={36} style={{ marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.4rem' }}>Incorrect! +0 pts</h3>
            </div>
          )}
        </div>
      )}

      {/* Host Controls */}
      {isHost && gameState.status === 'reveal' && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => { sfx.playClick(); onGameAction('next_question'); }}
            className="btn btn-primary"
            style={{ padding: '0.9rem 2rem', fontSize: '1.1rem' }}
          >
            Next Question ➔
          </button>
        </div>
      )}
    </div>
  );
}
