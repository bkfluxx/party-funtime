import React, { useState } from 'react';
import { Crown, Key, Copy, Check, RotateCcw, SkipForward, Users, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { sfx } from '../utils/sfx';

export function HostControlPanel({ room, hostToken, onReturnLobby, onSkipRound, onEndGame }) {
  const [collapsed, setCollapsed] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!room) return null;

  const hostReconnectLink = `${window.location.origin}/?room=${room.code}&hostKey=${hostToken}`;

  const copyHostKey = () => {
    sfx.playClick();
    navigator.clipboard.writeText(hostToken);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyHostLink = () => {
    sfx.playClick();
    navigator.clipboard.writeText(hostReconnectLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      zIndex: 999,
      maxWidth: '380px',
      width: 'calc(100% - 2rem)'
    }}>
      <div className="glass-panel" style={{
        padding: '1rem',
        border: '1.5px solid var(--primary)',
        boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
        background: 'rgba(15, 23, 42, 0.95)'
      }}>
        {/* Panel Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          paddingBottom: collapsed ? 0 : '0.5rem',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-glass)'
        }}
        onClick={() => setCollapsed(!collapsed)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
              padding: '0.35rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Crown size={16} color="white" />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#fcd34d', display: 'block' }}>Isolated Host Controls</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room {room.code}</span>
            </div>
          </div>

          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            {collapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Collapsible Body */}
        {!collapsed && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* Host Security Token Box */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              padding: '0.6rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-glass)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Key size={12} color="#f59e0b" /> Host Security Token:
                </span>
                <strong style={{ fontSize: '0.85rem', color: '#a5b4fc', fontFamily: 'monospace' }}>{hostToken || 'SECURE'}</strong>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={copyHostKey}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1 }}
                  title="Copy Host Security Token"
                >
                  {copiedKey ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Copy Host Key
                </button>
                <button
                  onClick={copyHostLink}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1 }}
                  title="Copy Host Reconnect Link with Token embedded"
                >
                  {copiedLink ? <Check size={12} color="#10b981" /> : <Copy size={12} />} Reconnect Link
                </button>
              </div>
            </div>

            {/* Quick Host Command Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                onClick={() => { sfx.playClick(); onSkipRound(); }}
                className="btn btn-outline"
                style={{ padding: '0.5rem', fontSize: '0.8rem' }}
              >
                <SkipForward size={14} /> Skip Round
              </button>

              <button
                onClick={() => { sfx.playClick(); onReturnLobby(); }}
                className="btn btn-outline"
                style={{ padding: '0.5rem', fontSize: '0.8rem' }}
              >
                <RotateCcw size={14} /> Back to Lobby
              </button>
            </div>

            {/* End Game Session Button */}
            <button
              onClick={() => { sfx.playError(); onEndGame(); }}
              className="btn btn-danger"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: '100%' }}
            >
              <ShieldAlert size={14} /> End Game Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
