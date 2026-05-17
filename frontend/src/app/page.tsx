'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, loading, logout } = useAuth();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        gap: '1.5rem',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0 }}>
        ⚡ HE-Messenger
      </h1>
      <p style={{ fontSize: '1.25rem', opacity: 0.75, maxWidth: 480 }}>
        Hybrid Ephemeral Messenger — real-time, auto-expiring conversations.
      </p>

      {loading ? (
        <p style={{ opacity: 0.5 }}>Loading auth state...</p>
      ) : user ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontSize: '1.125rem' }}>
            Logged in as <strong>{user.displayName || user.email}</strong>
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/chat"
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                background: '#6c63ff',
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              Go to Chat
            </Link>
            <button
              onClick={() => logout()}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'transparent',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/login"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              background: '#6c63ff',
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            Get Started
          </Link>
          <a
            href="https://github.com"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            View Docs
          </a>
        </div>
      )}
    </main>
  );
}
