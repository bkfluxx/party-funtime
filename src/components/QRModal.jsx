import React, { useEffect, useState } from 'react';
import { X, QrCode } from 'lucide-react';

export function QRModal({ code, onClose }) {
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/qr/${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.qrDataUrl) {
          setQrUrl(data.qrDataUrl);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [code]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #ec4899)',
          width: '50px',
          height: '50px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <QrCode size={28} color="white" />
        </div>

        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Join Room {code}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Scan with your phone camera to join the party directly!
        </p>

        {loading ? (
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Generating QR Code...</div>
        ) : qrUrl ? (
          <div style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '16px',
            display: 'inline-block',
            boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
          }}>
            <img src={qrUrl} alt="Room QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
          </div>
        ) : (
          <div style={{ color: '#ef4444' }}>Could not load QR code</div>
        )}
      </div>
    </div>
  );
}
