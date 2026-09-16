import React, { useState, useEffect } from 'react';
import { Play, Plus, LogIn, Users, Crown, Sparkles, Gamepad2, Rocket } from 'lucide-react';
import { sfx } from '../utils/sfx';

const AVATARS = ['🚀', '👾', '🎨', '🧠', '💣', '🕵️', '🎭', '🏆', '⚡', '🥑', '🦊', '🦄'];

const GAME_CARDS = [
  {
    id: 'pictionary',
    title: '🎨 Pictionary',
    desc: 'One person draws live; everyone guesses in real time.',
    difficulty: 'Medium',
    interaction: '⭐⭐⭐⭐⭐'
  },
  {
    id: 'trivia',
    title: '🧠 Trivia',
    desc: 'Multiple-choice timed questions with live speed scoring.',
    difficulty: 'Easy',
    interaction: '⭐⭐⭐⭐'
  },
  {
    id: 'bombDefusal',
    title: '💣 Bomb Defusal',
    desc: 'Co-op! 1 defuser operates the bomb; team reads manual instructions over Teams.',
    difficulty: 'Medium',
    interaction: '⭐⭐⭐⭐⭐'
  },
  {
    id: 'escapeRoom',
    title: '🔐 Escape Room',
    desc: 'Team solves a sequence of interactive room puzzles together.',
    difficulty: 'Medium',
    interaction: '⭐⭐⭐⭐⭐'
  },
  {
    id: 'twoTruths',
    title: '🤥 Two Truths & a Lie',
    desc: 'Submit 3 statements, then vote on which coworker statement is a lie.',
    difficulty: 'Easy',
    interaction: '⭐⭐⭐⭐'
  },
  {
    id: 'guessCrowd',
    title: '📊 Guess the Crowd',
    desc: 'Answer prompts secretly, then predict the group consensus.',
    difficulty: 'Easy',
    interaction: '⭐⭐⭐⭐⭐'
  },
  {
    id: 'whoSaidThat',
    title: '🕵️ Who Said That?',
    desc: 'Anonymous answers appear and everyone guesses who wrote each one.',
    difficulty: 'Easy',
    interaction: '⭐⭐⭐⭐⭐'
  },
  {
    id: 'wordAssociation',
    title: '🔤 Word Association',
    desc: 'Team tries to independently choose matching words from a prompt.',
    difficulty: 'Easy',
    interaction: '⭐⭐⭐⭐'
  },
  {
    id: 'familyFeud',
    title: '🏆 Family Feud-style',
    desc: 'Teams guess the most popular survey answers on the board.',
    difficulty: 'Medium',
    interaction: '⭐⭐⭐⭐⭐'
  },
  {
    id: 'charades',
    title: '🎭 Charades',
    desc: 'Generates secret prompts for the actor; coworkers guess over Teams.',
    difficulty: 'Very easy',
    interaction: '⭐⭐⭐⭐'
  },
  {
    id: 'connections',
    title: '🧩 Connections',
    desc: 'Find relationships between groups of 4 words in a grid.',
    difficulty: 'Easy',
    interaction: '⭐⭐⭐⭐'
  },
  {
    id: 'higherLower',
    title: '📈 Higher or Lower',
    desc: 'Guess whether the next statistic is higher or lower.',
    difficulty: 'Very easy',
    interaction: '⭐⭐⭐'
  }
];

export function Lobby({ room, playerId, onCreateRoom, onJoinRoom, onStartGame }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🚀');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('room');
    if (codeParam) {
      setRoomCodeInput(codeParam.toUpperCase());
    }
  }, []);

  const isHost = room && room.hostId === playerId;

  if (!room) {
    return (
      <div style={{
        maxWidth: '900px',
        margin: '3rem auto',
        padding: '0 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem'
      }}>
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles color="var(--primary)" /> Player Profile
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your Name / Nickname</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Alex (Engineering)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Choose Avatar</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => { sfx.playClick(); setAvatar(av); }}
                  style={{
                    fontSize: '1.5rem',
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    border: avatar === av ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                    background: avatar === av ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Join / Create Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gamepad2 color="var(--secondary)" /> Join or Host
          </h2>

          {/* Create Room Button */}
          <button
            onClick={() => { sfx.playClick(); onCreateRoom(name || 'Host', avatar); }}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '1.5rem' }}
          >
            <Plus size={20} /> Create New Room
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0 1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR JOIN EXISTING</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="4-Letter Room Code"
              maxLength={4}
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold' }}
            />
            <button
              onClick={() => {
                if (roomCodeInput.length === 4) {
                  sfx.playClick();
                  onJoinRoom(roomCodeInput, name || 'Player', avatar);
                }
              }}
              className="btn btn-secondary"
              style={{ padding: '0 1.5rem' }}
            >
              <LogIn size={18} /> Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Room Lobby View
  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        {/* Main Game Selector Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: 'white' }}>Select a Game Mode ({GAME_CARDS.length} Available)</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {isHost ? 'Click any game tile to reveal its Launch button!' : 'Waiting for Host to choose a game...'}
              </p>
            </div>
          </div>

          {/* Game Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {GAME_CARDS.map((game) => {
              const isSelected = selectedGame === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => {
                    if (isHost) {
                      sfx.playClick();
                      setSelectedGame(game.id);
                    }
                  }}
                  className={`glass-panel glass-panel-interactive`}
                  style={{
                    padding: '1.5rem',
                    cursor: isHost ? 'pointer' : 'default',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                    boxShadow: isSelected ? '0 0 25px rgba(99, 102, 241, 0.4)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{game.title}</h3>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '40px' }}>
                      {game.desc}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: isSelected ? '1rem' : 0 }}>
                      <span className="badge badge-purple">{game.difficulty}</span>
                      <span style={{ color: '#fcd34d' }}>{game.interaction}</span>
                    </div>
                  </div>

                  {/* Embedded Launch Button on Selected Tile */}
                  {isSelected && (
                    <div style={{ marginTop: '0.5rem' }}>
                      {isHost ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sfx.playSuccess();
                            onStartGame(game.id);
                          }}
                          className="btn btn-primary pulse-animation"
                          style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.5)' }}
                        >
                          <Rocket size={18} /> Launch Game ➔
                        </button>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          padding: '0.5rem',
                          background: 'rgba(99, 102, 241, 0.2)',
                          border: '1px solid var(--primary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          color: '#a5b4fc',
                          fontWeight: 'bold'
                        }}>
                          Selected by Host
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Players Roster Sidebar */}
        <div>
          <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--primary)" /> Team Members ({room.players.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {room.players.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{p.avatar}</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score: {p.score || 0}</span>
                    </div>
                  </div>

                  {p.isHost && (
                    <span className="badge badge-amber" title="Room Host">
                      <Crown size={12} /> Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
