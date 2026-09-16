import React, { useState } from 'react';
import { Volume2, VolumeX, QrCode, Copy, Check, Users, Sparkles } from 'lucide-react';
import { sfx } from '../utils/sfx';

export function Navbar({ room, onOpenQR, isMuted, onToggleMute }) {
  const [copied, setCopied] = useState(false);

  const copyRoomLink = () => {
    sfx.playClick();
    const url = window.location.origin + '?room=' + (room ? room.code : '');
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: 0, background: 'linear-gradient(90deg, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Party Funtime
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Team Meeting Social Deck</span>
        </div>
      </div>

      {/* Room Details & Actions */}
      {room && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Room Code Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid var(--border-glass)',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ROOM:</span>
            <strong style={{ fontSize: '1.1rem', letterSpacing: '0.1em', color: '#a5b4fc' }}>{room.code}</strong>
            
            <button
              onClick={copyRoomLink}
              title="Copy Room Link"
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>

            <button
              onClick={() => { sfx.playClick(); onOpenQR(); }}
              title="Show QR Code"
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.5rem' }}
            >
              <QrCode size={14} />
            </button>
          </div>

          {/* Players count */}
          <div className="badge badge-purple" style={{ padding: '0.5rem 0.8rem' }}>
            <Users size={14} />
            <span>{room.players ? room.players.length : 0} Players</span>
          </div>

          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="#10b981" />}
          </button>
        </div>
      )}
    </nav>
  );
}
