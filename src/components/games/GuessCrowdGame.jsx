import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function GuessCrowdGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState;
  const [myAnswer, setMyAnswer] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState('');

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!myAnswer.trim()) return;
    sfx.playClick();
    onGameAction('submit_answer', { answer: myAnswer });
  };

  const handlePredictSubmit = (ans) => {
    sfx.playClick();
    setSelectedPrediction(ans);
    onGameAction('submit_prediction', { prediction: ans });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>📊 Guess The Crowd</span>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '2rem', lineHeight: '1.4' }}>
          "{gameState.prompt}"
        </h2>

        {/* Phase 1: Answer secret prompt */}
        {gameState.status === 'submitting' && (
          <div>
            {!gameState.answers[playerId] ? (
              <form onSubmit={handleAnswerSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your honest answer..."
                  value={myAnswer}
                  onChange={(e) => setMyAnswer(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Submit</button>
              </form>
            ) : (
              <div style={{ color: '#6ee7b7' }}>
                <CheckCircle2 size={36} style={{ marginBottom: '0.5rem' }} />
                <h3>Answer recorded! Waiting for others...</h3>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Predict Group Consensus */}
        {gameState.status === 'predicting' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#a5b4fc' }}>
              Predict which answer will be the MOST POPULAR among your team:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
              {Array.from(new Set(Object.values(gameState.answers))).map((ans, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePredictSubmit(ans)}
                  disabled={selectedPrediction !== ''}
                  className={`btn ${selectedPrediction === ans ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ padding: '1rem', fontSize: '1.1rem' }}
                >
                  {ans}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3: Results reveal */}
        {gameState.status === 'reveal' && (
          <div>
            <h3 style={{ fontSize: '1.8rem', color: '#fcd34d', marginBottom: '1rem' }}>
              Top Group Answer: "{gameState.actionResult?.topAnswer || ''}"
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>Great consensus predictions!</p>
          </div>
        )}
      </div>
    </div>
  );
}
