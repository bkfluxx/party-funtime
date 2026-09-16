import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, Award, AlertCircle } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function TwoTruthsGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState;
  const [stmt1, setStmt1] = useState('');
  const [stmt2, setStmt2] = useState('');
  const [stmt3, setStmt3] = useState('');
  const [lieIndex, setLieIndex] = useState(0);

  const [selectedVote, setSelectedVote] = useState(null);

  const isSubmittingPhase = gameState.status === 'submitting';
  const hasSubmitted = !!gameState.playerSubmissions[playerId];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stmt1.trim() || !stmt2.trim() || !stmt3.trim()) return;

    sfx.playClick();
    onGameAction('submit_statements', { stmt1, stmt2, stmt3, lieIndex });
  };

  const handleVote = (idx) => {
    if (selectedVote !== null || gameState.status !== 'voting') return;
    sfx.playClick();
    setSelectedVote(idx);
    onGameAction('vote_lie', { statementIndex: idx });
  };

  const subjectPlayer = gameState.currentSubjectId ? room.players.find(p => p.id === gameState.currentSubjectId) : null;
  const subjectSubmissions = gameState.currentSubjectId ? gameState.playerSubmissions[gameState.currentSubjectId] : null;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Submitting Phase */}
      {isSubmittingPhase && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>🤥 Two Truths & A Lie</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Write 3 statements about yourself (2 true, 1 lie) and select which one is the lie!
          </p>

          {!hasSubmitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[0, 1, 2].map((idx) => {
                const val = idx === 0 ? stmt1 : idx === 1 ? stmt2 : stmt3;
                const setVal = idx === 0 ? setStmt1 : idx === 1 ? setStmt2 : setStmt3;
                return (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="lieSelection"
                      checked={lieIndex === idx}
                      onChange={() => setLieIndex(idx)}
                      style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="input-field"
                      placeholder={`Statement ${idx + 1}... ${lieIndex === idx ? '(MARK AS LIE)' : '(TRUE)'}`}
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                    />
                  </div>
                );
              })}

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.9rem' }}>
                Submit Statements ➔
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6ee7b7' }}>
              <CheckCircle2 size={40} style={{ marginBottom: '0.5rem' }} />
              <h3>Statements Submitted! Waiting for coworkers...</h3>
            </div>
          )}
        </div>
      )}

      {/* Voting Phase */}
      {gameState.status === 'voting' && subjectSubmissions && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>Voting Round</span>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>
            Which statement from <strong style={{ color: '#a5b4fc' }}>{subjectPlayer?.name}</strong> is the LIE?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {subjectSubmissions.statements.map((stmt, idx) => (
              <button
                key={idx}
                onClick={() => handleVote(idx)}
                disabled={playerId === gameState.currentSubjectId || selectedVote !== null}
                className={`btn ${selectedVote === idx ? 'btn-secondary' : 'btn-outline'}`}
                style={{ padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{idx + 1}.</span> {stmt}
              </button>
            ))}
          </div>

          {playerId === gameState.currentSubjectId && (
            <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>
              (You are the subject of this round! Sit back and see if you fool your team.)
            </p>
          )}
        </div>
      )}

      {/* Reveal Phase */}
      {gameState.status === 'reveal' && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#6ee7b7', marginBottom: '1rem' }}>
            The Lie Was Statement #{subjectSubmissions.lieIndex + 1}!
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontStyle: 'italic', color: '#fca5a5' }}>
            "{subjectSubmissions.statements[subjectSubmissions.lieIndex]}"
          </p>

          {room.hostId === playerId && (
            <button
              onClick={() => { sfx.playClick(); onGameAction('next_round'); }}
              className="btn btn-primary"
              style={{ padding: '0.9rem 2rem' }}
            >
              Next Coworker Round ➔
            </button>
          )}
        </div>
      )}
    </div>
  );
}
