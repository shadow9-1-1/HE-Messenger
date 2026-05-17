import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'HE-Messenger | Hybrid Ephemeral Messenger',
  description:
    'A real-time, ephemeral messaging app with Firebase Authentication, Socket.IO, and auto-expiring messages.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
