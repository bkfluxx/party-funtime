import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Crown } from 'lucide-react';
import { sfx } from '../utils/sfx';

export function Scoreboard({ room, playerId, onReturnLobby }) {
  const players = room.players ? [...room.players].sort((a, b) => (b.score || 0) - (a.score || 0)) : [];
  const isHost = room.hostId === playerId;

  useEffect(() => {
    sfx.playSuccess();
    // Confetti explosion
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
          width: '70px',
          height: '70px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)'
        }}>
          <Trophy size={40} color="white" />
        </div>

        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, #ffffff, #fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Game Over - Leaderboard!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Congratulations to the team! Here are the final scores.
        </p>

        {/* Podium Top 3 */}
        {players.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '3rem' }}>
            {/* 2nd Place */}
            {players[1] && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{players[1].avatar}</div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>{players[1].name}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{players[1].score} pts</span>
                <div style={{ height: '80px', width: '90px', background: 'rgba(148, 163, 184, 0.2)', border: '1px solid #94a3b8', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                  2
                </div>
              </div>
            )}

            {/* 1st Place */}
            {players[0] && (
              <div style={{ textAlign: 'center' }}>
                <Crown size={28} color="#fcd34d" style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{players[0].avatar}</div>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#fcd34d' }}>{players[0].name}</strong>
                <span style={{ fontSize: '0.95rem', color: '#fcd34d', fontWeight: 'bold' }}>{players[0].score} pts</span>
                <div style={{ height: '120px', width: '100px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(236, 72, 153, 0.4))', border: '2px solid #fcd34d', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2rem', color: '#fcd34d', marginTop: '0.5rem' }}>
                  1
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {players[2] && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{players[2].avatar}</div>
                <strong style={{ display: 'block', fontSize: '1rem' }}>{players[2].name}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{players[2].score} pts</span>
                <div style={{ height: '60px', width: '90px', background: 'rgba(217, 119, 6, 0.2)', border: '1px solid #b45309', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', color: '#f59e0b', marginTop: '0.5rem' }}>
                  3
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Player List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          {players.map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.25rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-glass)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 'bold', width: '20px', color: 'var(--text-muted)' }}>#{idx + 1}</span>
                <span style={{ fontSize: '1.3rem' }}>{p.avatar}</span>
                <span>{p.name}</span>
              </div>
              <strong style={{ color: '#a5b4fc' }}>{p.score || 0} pts</strong>
            </div>
          ))}
        </div>

        {/* Host Return to Lobby Button */}
        {isHost && (
          <button
            onClick={() => { sfx.playClick(); onReturnLobby(); }}
            className="btn btn-primary"
            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
          >
            <RotateCcw size={20} /> Back to Game Lobby
          </button>
        )}
      </div>
    </div>
  );
}
