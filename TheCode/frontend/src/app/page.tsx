import Link from 'next/link';

export default function HomePage() {
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
    </main>
  );
}
