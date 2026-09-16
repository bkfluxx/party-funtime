import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Flame, BookOpen, Clock } from 'lucide-react';
import { sfx } from '../../utils/sfx';

export function BombDefusalGame({ room, playerId, onGameAction }) {
  const gameState = room.gameState;
  const isDefuser = gameState.defuserSocketId === playerId;
  const [activeTab, setActiveTab] = useState(isDefuser ? 'bomb' : 'manual');
  const [keypadInput, setKeypadInput] = useState('');

  // Bomb ticking timer effect
  useEffect(() => {
    if (gameState.status !== 'active') return;
    const interval = setInterval(() => {
      sfx.playBombTick();
      if (room.hostId === playerId) {
        onGameAction('tick_timer');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.status, playerId]);

  const handleKeypadPress = (num) => {
    if (keypadInput.length < 4) {
      const next = keypadInput + num;
      setKeypadInput(next);
      if (next.length === 4) {
        sfx.playClick();
        onGameAction('submit_passcode', { passcode: next });
        setKeypadInput('');
      }
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '1.5rem auto', padding: '0 1rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge badge-amber" style={{ marginBottom: '0.25rem' }}>💣 Co-Op Bomb Defusal</span>
          <h2 style={{ fontSize: '1.4rem' }}>
            Defuser: <strong style={{ color: '#a5b4fc' }}>{gameState.defuserName}</strong>
          </h2>
        </div>

        {/* Strikes & Countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>STRIKES:</span>
            {[1, 2, 3].map((s) => (
              <span key={s} style={{
                fontSize: '1.2rem',
                color: s <= gameState.strikes ? '#ef4444' : '#475569'
              }}>
                ✖
              </span>
            ))}
          </div>

          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#ef4444', fontFamily: 'monospace' }}>
            <Clock size={20} style={{ display: 'inline', marginRight: '6px' }} />
            {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {isDefuser && (
          <button
            onClick={() => setActiveTab('bomb')}
            className={`btn ${activeTab === 'bomb' ? 'btn-primary' : 'btn-outline'}`}
          >
            💣 Defuser Device Panel
          </button>
        )}
        <button
          onClick={() => setActiveTab('manual')}
          className={`btn ${activeTab === 'manual' ? 'btn-primary' : 'btn-outline'}`}
        >
          <BookOpen size={18} /> Teammates Defusal Manual
        </button>
      </div>

      {/* Bomb Outcome Banner */}
      {gameState.status === 'defused' && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.5)', marginBottom: '1.5rem' }}>
          <ShieldCheck size={48} color="#6ee7b7" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '2rem', color: '#6ee7b7' }}>BOMB DEFUSED! GREAT TEAMWORK!</h2>
          <p style={{ color: 'var(--text-muted)' }}>All modules solved with time to spare.</p>
        </div>
      )}

      {gameState.status === 'exploded' && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)', marginBottom: '1.5rem' }}>
          <Flame size={48} color="#fca5a5" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '2rem', color: '#fca5a5' }}>BOOM! BOMB EXPLODED!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Too many strikes or time ran out.</p>
        </div>
      )}

      {/* View 1: Active Bomb Panel */}
      {activeTab === 'bomb' && gameState.status === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Module 1: Wires */}
          <div className="glass-panel" style={{ padding: '1.5rem', border: gameState.modules.wires.solved ? '2px solid #10b981' : '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Module 1: Wires</span>
              {gameState.modules.wires.solved && <span className="badge badge-emerald">SOLVED</span>}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {gameState.modules.wires.wires.map((w, idx) => (
                <button
                  key={idx}
                  disabled={w.cut || gameState.modules.wires.solved}
                  onClick={() => { sfx.playClick(); onGameAction('cut_wire', { wireIndex: idx }); }}
                  style={{
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: w.color,
                    border: 'none',
                    cursor: w.cut ? 'default' : 'pointer',
                    opacity: w.cut ? 0.2 : 1,
                    position: 'relative'
                  }}
                >
                  {w.cut && <span style={{ color: 'white', fontWeight: 'bold' }}>CUT</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Module 2: Keypad */}
          <div className="glass-panel" style={{ padding: '1.5rem', border: gameState.modules.keypad.solved ? '2px solid #10b981' : '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Module 2: Passcode</span>
              {gameState.modules.keypad.solved && <span className="badge badge-emerald">SOLVED</span>}
            </h3>
            <div style={{ background: '#0f172a', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', marginBottom: '1rem', height: '45px' }}>
              {keypadInput.padEnd(4, '_')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  disabled={gameState.modules.keypad.solved}
                  onClick={() => handleKeypadPress(num.toString())}
                  className="btn btn-outline"
                  style={{ padding: '0.6rem' }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Module 3: Color Button */}
          <div className="glass-panel" style={{ padding: '1.5rem', border: gameState.modules.colorButton.solved ? '2px solid #10b981' : '1px solid var(--border-glass)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Module 3: Action Button</span>
              {gameState.modules.colorButton.solved && <span className="badge badge-emerald">SOLVED</span>}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {['RED', 'BLUE', 'YELLOW', 'GREEN'].map((col) => (
                <button
                  key={col}
                  disabled={gameState.modules.colorButton.solved}
                  onClick={() => { sfx.playClick(); onGameAction('press_color_button', { color: col }); }}
                  className="btn"
                  style={{
                    backgroundColor: col.toLowerCase(),
                    color: col === 'YELLOW' ? '#0f172a' : 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Teammates Manual */}
      {activeTab === 'manual' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen color="var(--primary)" /> Bomb Defusal Instruction Manual
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Read these instructions aloud over Teams to guide the Defuser!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ color: '#a5b4fc', marginBottom: '0.5rem' }}>SECTION 1: WIRE CUTTING RULES</h3>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                <li>Look at the very first wire on the left.</li>
                <li>If the first wire is <strong>RED</strong>, instruct the Defuser to cut the <strong>3rd wire</strong>.</li>
                <li>Otherwise, instruct the Defuser to cut the <strong>4th wire</strong>.</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ color: '#a5b4fc', marginBottom: '0.5rem' }}>SECTION 2: PASSCODE KEYPAD</h3>
              <p style={{ lineHeight: '1.6' }}>
                The keypad passcode is: <strong style={{ color: '#fcd34d', fontSize: '1.2rem', letterSpacing: '0.1em' }}>{gameState.modules.keypad.passCode}</strong>. Read this code clearly to the defuser!
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ color: '#a5b4fc', marginBottom: '0.5rem' }}>SECTION 3: ACTION BUTTON</h3>
              <p style={{ lineHeight: '1.6' }}>
                Instruct the Defuser to press the <strong style={{ color: '#6ee7b7', fontSize: '1.1rem' }}>{gameState.modules.colorButton.targetColor}</strong> button.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
