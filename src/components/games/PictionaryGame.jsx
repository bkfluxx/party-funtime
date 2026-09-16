import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Send, Clock, Award, CheckCircle2, Sparkles, User, Palette, RotateCw } from 'lucide-react';
import { sfx } from '../../utils/sfx';

const COLORS = [
  '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#06b6d4',
  '#6366f1', '#ec4899', '#8b5cf6', '#a855f7', '#000000'
];
const BRUSH_SIZES = [2, 5, 10, 18, 28];

export function PictionaryGame({ room, playerId, socket, onGameAction }) {
  const gameState = room.gameState || {};
  const isDrawer = gameState.currentDrawerId === playerId;
  const isHost = room.hostId === playerId;

  const canvasRef = useRef(null);
  const chatBottomRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const drawerPlayer = room.players ? room.players.find(p => p.id === gameState.currentDrawerId) : null;
  const wordChoices = gameState.wordChoices || [];
  const correctGuessers = gameState.correctGuessers || [];

  // Setup Canvas & Background
  const initCanvasBg = (ctx, canvas) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle studio dot grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 20; x < canvas.width; x += 25) {
      for (let y = 20; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    initCanvasBg(ctx, canvas);

    if (gameState.canvasData && gameState.canvasData.length > 0) {
      gameState.canvasData.forEach(stroke => {
        drawStrokeOnCanvas(ctx, stroke);
      });
    }
  }, [gameState.round, gameState.status]);

  // Host timer interval driver
  useEffect(() => {
    if (gameState.status !== 'drawing') return;
    const interval = setInterval(() => {
      if (isHost) {
        onGameAction('tick_timer');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.status, isHost]);

  // Listen for socket draw and clear events
  useEffect(() => {
    if (!socket) return;

    const handleRemoteDraw = (stroke) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      drawStrokeOnCanvas(ctx, stroke);
    };

    socket.on('draw_event_broadcast', handleRemoteDraw);
    return () => socket.off('draw_event_broadcast', handleRemoteDraw);
  }, [socket]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, correctGuessers]);

  const drawStrokeOnCanvas = (ctx, stroke) => {
    const { prevX, prevY, currX, currY, color, size } = stroke;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.stroke();
    ctx.closePath();
  };

  const startDrawing = (e) => {
    if (!isDrawer || gameState.status !== 'drawing') return;
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawer || gameState.status !== 'drawing') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);

    const stroke = {
      prevX: canvas.lastX,
      prevY: canvas.lastY,
      currX: x,
      currY: y,
      color: isEraser ? '#0f172a' : color,
      size: brushSize
    };

    drawStrokeOnCanvas(ctx, stroke);
    canvas.lastX = x;
    canvas.lastY = y;

    if (socket) {
      socket.emit('draw_event', { code: room.code, drawData: stroke });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    sfx.playClick();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    initCanvasBg(ctx, canvas);
    onGameAction('clear_canvas');
  };

  const sendGuess = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    onGameAction('guess_chat', { text: chatInput });

    // Append to local chat logs preview
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), text: chatInput, sender: 'You', color: '#6366f1' }
    ]);
    setChatInput('');
  };

  const sendEmojiReaction = (emoji) => {
    sfx.playClick();
    onGameAction('guess_chat', { text: emoji });
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), text: emoji, sender: 'You', color: '#6366f1' }
    ]);
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '1rem auto', padding: '0 1rem' }}>
      
      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>
            Round {gameState.round} of {gameState.maxRounds}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{drawerPlayer?.avatar || '✏️'}</span>
            <div>
              <strong style={{ fontSize: '1.1rem', display: 'block', lineHeight: 1.2 }}>
                {isDrawer ? '🎨 You are drawing!' : `${drawerPlayer?.name || 'Coworker'} is drawing`}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isDrawer ? 'Draw clearly so your team can guess!' : 'Type your guesses in the chat box'}
              </span>
            </div>
          </div>
        </div>

        {/* Word Display or Secret Hint */}
        <div style={{ textAlign: 'center' }}>
          {isDrawer && gameState.currentWord ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(236, 72, 153, 0.25))',
              border: '1.5px solid var(--primary)',
              padding: '0.5rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Secret Word</span>
              <strong style={{ fontSize: '1.5rem', color: '#ffffff', letterSpacing: '0.05em' }}>{gameState.currentWord}</strong>
            </div>
          ) : !isDrawer && gameState.currentWord ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ letterSpacing: '0.35em', fontSize: '1.6rem', fontWeight: 'bold', color: '#a5b4fc', fontFamily: 'monospace' }}>
                {gameState.currentWord.replace(/[a-zA-Z]/g, '_ ')}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({gameState.currentWord.length} letters)
              </span>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
              Selecting word...
            </div>
          )}
        </div>

        {/* Dynamic Timer Countdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: gameState.timeLeft <= 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.8)',
          border: gameState.timeLeft <= 10 ? '1px solid #ef4444' : '1px solid var(--border-glass)',
          color: gameState.timeLeft <= 10 ? '#ef4444' : '#fcd34d',
          fontWeight: 'bold',
          fontSize: '1.3rem'
        }}>
          <Clock size={20} className={gameState.timeLeft <= 10 ? 'pulse-animation' : ''} />
          <span>{gameState.timeLeft || 60}s</span>
        </div>
      </div>

      {/* Drawer Word Selection Overlay Banner */}
      {gameState.status === 'word_selection' && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1rem', border: '2px solid var(--primary)', background: 'rgba(30, 41, 59, 0.95)' }}>
          {isDrawer ? (
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#ffffff' }}>Choose a Word to Draw!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Select any of the 3 choices below to start the timer:</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {wordChoices.map((w) => (
                  <button
                    key={w}
                    onClick={() => { sfx.playSuccess(); onGameAction('select_word', { word: w }); }}
                    className="btn btn-primary"
                    style={{ padding: '0.9rem 2rem', fontSize: '1.15rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}
                  >
                    🎨 {w}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
              <h3 style={{ fontSize: '1.4rem', color: '#a5b4fc', marginBottom: '0.25rem' }}>
                Waiting for {drawerPlayer?.name || 'the Drawer'} to select a word...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Get ready to type your guesses in the live chat!</p>
            </div>
          )}
        </div>
      )}

      {/* Round End Reveal Banner */}
      {gameState.status === 'round_end' && (
        <div className="glass-panel" style={{ padding: '1.5rem 2rem', textAlign: 'center', marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#6ee7b7', marginBottom: '0.5rem' }}>
            🎉 Round Over! The word was <strong style={{ color: 'white', textDecoration: 'underline' }}>{gameState.currentWord}</strong>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {correctGuessers.length} team member(s) guessed correctly this round!
          </p>
          {isHost && (
            <button
              onClick={() => { sfx.playClick(); onGameAction('next_round'); }}
              className="btn btn-primary"
              style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}
            >
              Next Round ➔
            </button>
          )}
        </div>
      )}

      {/* Main Studio Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem' }}>
        
        {/* Studio Canvas Column */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '750px' }}>
            <canvas
              ref={canvasRef}
              width={750}
              height={480}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                width: '100%',
                maxHeight: '480px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-glass)',
                cursor: isDrawer && gameState.status === 'drawing' ? 'crosshair' : 'default',
                touchAction: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
              }}
            />
          </div>

          {/* Drawer Control Palette */}
          {isDrawer && gameState.status === 'drawing' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '750px',
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              {/* Color Swatches */}
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <Palette size={16} color="var(--text-muted)" style={{ marginRight: '4px' }} />
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setIsEraser(false); setColor(c); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: color === c && !isEraser ? '3px solid #6366f1' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      transform: color === c && !isEraser ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>

              {/* Brush Thickness */}
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {BRUSH_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setBrushSize(s)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: brushSize === s ? 'rgba(99, 102, 241, 0.35)' : 'rgba(30, 41, 59, 0.6)',
                      border: brushSize === s ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: `${Math.min(s, 16)}px`, height: `${Math.min(s, 16)}px`, borderRadius: '50%', background: 'white' }}></div>
                  </button>
                ))}
              </div>

              {/* Eraser & Clear */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsEraser(!isEraser)}
                  className={`btn ${isEraser ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <Eraser size={14} /> Eraser
                </button>
                <button
                  onClick={clearCanvas}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <Trash2 size={14} /> Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Guessing Chat Box Sidebar */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '550px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Live Guess Chat</h3>
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
              {correctGuessers.length} Guessed
            </span>
          </div>

          {/* Chat Stream */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '0.25rem' }}>
            {correctGuessers.length > 0 && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.6rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#6ee7b7', textAlign: 'center' }}>
                <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                <strong>{correctGuessers.length}</strong> player(s) solved the word!
              </div>
            )}

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: msg.isSystem ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-glass)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem'
                }}
              >
                <strong style={{ color: msg.color || '#a5b4fc', marginRight: '0.4rem' }}>{msg.sender}:</strong>
                <span>{msg.text}</span>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Reaction Emojis */}
          <div style={{ display: 'flex', gap: '0.35rem', margin: '0.5rem 0', justifyContent: 'center' }}>
            {['👏', '😂', '🔥', '💡', '💯', '🤔'].map((em) => (
              <button
                key={em}
                onClick={() => sendEmojiReaction(em)}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.25rem 0.4rem',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {em}
              </button>
            ))}
          </div>

          {/* Guess Input Form */}
          {!isDrawer && gameState.status === 'drawing' && (
            <form onSubmit={sendGuess} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Type your word guess..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
                <Send size={16} />
              </button>
            </form>
          )}

          {/* Host Force Next Round */}
          {isHost && (
            <button
              onClick={() => { sfx.playClick(); onGameAction('next_round'); }}
              className="btn btn-outline"
              style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.85rem' }}
            >
              <RotateCw size={14} /> Skip / Next Round
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
