'use client';

import { useEffect, useState, useRef, KeyboardEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  senderUid: string;
  recipientUid: string;
  content: string;
  createdAt: string;
}

interface PulseEvent {
  category: string;
  message: string;
  timestamp: string;
}

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
}

export default function ChatPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [lines, setLines] = useState<{ id: string; text: string; color?: string; isBurn?: boolean; burnId?: string }[]>([]);
  const [pulseLogs, setPulseLogs] = useState<{ id: string; category: string; text: string; color: string }[]>([]);
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [onlineUids, setOnlineUids] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [recipientUid, setRecipientUid] = useState<string | null>(null);
  const [ttl, setTtl] = useState<number | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const pulseEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Auto-scroll pulse monitor
  useEffect(() => {
    pulseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pulseLogs]);

  // Keep input focused
  useEffect(() => {
    const handleGlobalClick = () => {
      // Don't steal focus if they are explicitly trying to select text
      if (window.getSelection()?.toString()) return;
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const printLine = (text: string, color: string = '#0f0', isBurn?: boolean, burnId?: string) => {
    setLines((prev) => [...prev, { id: Math.random().toString(36).substr(2, 9), text, color, isBurn, burnId }]);
  };

  const printPulse = (category: string, text: string, color: string = '#888') => {
    setPulseLogs((prev) => [...prev, { id: Math.random().toString(36).substr(2, 9), category, text, color }]);
  };

  const clearScreen = () => {
    setLines([]);
    printLine('Ghost Chat UI Initialized. Select a contact or type /help.', '#0ff');
  };

  // Auth Redirect & Socket Init
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    printLine(`Authenticating as ${user.uid}...`, '#888');

    const initializeData = async () => {
      try {
        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // Fetch Contacts
        const usersRes = await fetch(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (usersRes.ok) {
          const { users } = await usersRes.json();
          setContacts(users);
        }

        // Fetch Presence Hydration
        const presenceRes = await fetch(`${apiUrl}/presence`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (presenceRes.ok) {
          const { onlineUids } = await presenceRes.json();
          setOnlineUids(new Set(onlineUids));
        }

        // Init Socket
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
        const newSocket = io(socketUrl, { auth: { token } });

        newSocket.on('connect', () => {
          printLine(`[SYSTEM]: Connected to secure socket.`, '#ff0');
          printPulse('SOCKET', 'TCP Handshake established', '#ff0');
        });

        newSocket.on('disconnect', (reason) => {
          printLine(`[SYSTEM]: Socket disconnected (${reason}).`, '#f00');
          printPulse('SOCKET', `Disconnected: ${reason}`, '#f00');
        });

        newSocket.on('system_pulse', (log: PulseEvent | any) => {
          const category = log.category || log.type?.toUpperCase() || 'SYSTEM';
          let color = '#888';
          if (category === 'AUTH') color = '#0ff';
          if (category === 'SOCKET') color = '#ff0';
          if (category === 'REDIS') color = '#a020f0';
          if (category === 'GHOST') color = '#f00';
          printPulse(category, log.message, color);
        });

        newSocket.on('presence_update', (data: { uid: string; status: string }) => {
          setOnlineUids(prev => {
            const next = new Set(prev);
            if (data.status === 'online') next.add(data.uid);
            else next.delete(data.uid);
            return next;
          });
          printPulse('PRESENCE', `User ${data.uid} is now ${data.status}`, data.status === 'online' ? '#0f0' : '#f00');
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('Initialization failed', error);
      }
    };

    initializeData();

    return () => {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
    };
  }, [user, loading, router]);

  // Setup Chat specific socket listeners that depend on recipientUid
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      if (
        (msg.senderUid === user?.uid && msg.recipientUid === recipientUid) ||
        (msg.senderUid === recipientUid && msg.recipientUid === user?.uid)
      ) {
        printLine(`[${msg.senderUid}]: ${msg.content}`, msg.senderUid === user?.uid ? '#0f0' : '#fff');
      }
    };

    const handleChatWiped = (data: { conversationKey: string; counterpartUid: string }) => {
      if (data.counterpartUid === recipientUid) {
        setLines([]);
        printLine(`[GHOST WIPE]: Secure erase triggered. Memory zeroed.`, '#f00');
        printLine(`Connection to ${recipientUid} dropped.`, '#888');
        setRecipientUid(null);
        setTtl(null);
      }
    };

    const handleReceiveBurnNotice = (data: { burnId: string; senderUid: string; timestamp: string }) => {
      // Only display if we are actively talking to this sender
      if (data.senderUid === recipientUid) {
        printLine(`[SYSTEM]: Incoming Burn Message from ${data.senderUid}. Click to reveal.`, '#ff0', true, data.burnId);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('chat_wiped', handleChatWiped);
    socket.on('receive_burn_notice', handleReceiveBurnNotice);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('chat_wiped', handleChatWiped);
      socket.off('receive_burn_notice', handleReceiveBurnNotice);
    };
  }, [socket, recipientUid, user]);

  const fetchHistory = async (targetUid: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/messages/${targetUid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch history');
      
      const data = await res.json();
      setTtl(data.ttl);

      clearScreen();
      printLine(`Connected to ${targetUid}. Ephemeral memory active.`, '#0ff');
      if (data.ttl > 0) {
        printLine(`[SYSTEM]: Conversation will self-destruct in ${data.ttl}s`, '#f00');
      }

      data.messages.forEach((msg: Message) => {
        printLine(`[${msg.senderUid}]: ${msg.content}`, msg.senderUid === user?.uid ? '#0f0' : '#fff');
      });

    } catch (err) {
      printLine(`[ERROR]: Failed to connect to ${targetUid}`, '#f00');
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !recipientUid) return;
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientUid, content }),
      });
      if (!res.ok) throw new Error('Failed to send message');
    } catch (err) {
      printLine(`[ERROR]: Message delivery failed`, '#f00');
    }
  };

  const revealBurnMessage = async (burnId: string, lineId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const res = await fetch(`${apiUrl}/messages/burn/${burnId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        setLines(prev => prev.map(line => line.id === lineId ? { ...line, text: '[BURN MESSAGE DESTROYED OR EXPIRED]', color: '#f00', isBurn: false } : line));
        return;
      }
      
      const data = await res.json();
      setLines(prev => prev.map(line => line.id === lineId ? { ...line, text: `[${data.message.senderUid}]: ${data.message.content}`, color: '#ff0', isBurn: false } : line));
    } catch (err) {
      setLines(prev => prev.map(line => line.id === lineId ? { ...line, text: '[BURN MESSAGE ERROR]', color: '#f00', isBurn: false } : line));
    }
  };

  const processCommand = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    printLine(`> ${trimmed}`, '#888');

    if (trimmed.startsWith('/')) {
      const parts = trimmed.split(' ');
      const cmd = parts[0].toLowerCase();
      const arg = parts[1];

      switch (cmd) {
        case '/help':
          printLine('AVAILABLE COMMANDS:', '#ff0');
          printLine('  /connect <uid>   - Initiate secure channel with user', '#ff0');
          printLine('  /burn <msg>      - Send a read-once atomic message', '#ff0');
          printLine('  /clear           - Clear terminal display locally', '#ff0');
          printLine('  /logout          - Terminate identity session', '#ff0');
          printLine('  /whoami          - Display current UID', '#ff0');
          break;
        case '/burn':
          if (!recipientUid) {
            printLine('[ERROR]: No active connection. Use /connect <uid>', '#f00');
          } else if (!arg) {
            printLine('[ERROR]: /burn requires a message payload', '#f00');
          } else {
            const payload = parts.slice(1).join(' ');
            try {
              const token = await user?.getIdToken();
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
              const res = await fetch(`${apiUrl}/messages/burn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ recipientUid, content: payload }),
              });
              if (!res.ok) throw new Error();
              printLine(`[SYSTEM]: Burn message dispatched to ${recipientUid}`, '#0ff');
            } catch {
              printLine(`[ERROR]: Burn message delivery failed`, '#f00');
            }
          }
          break;
        case '/connect':
          if (!arg) {
            printLine('[ERROR]: /connect requires a target UID', '#f00');
          } else {
            printLine(`Initiating secure handshake with ${arg}...`, '#888');
            setRecipientUid(arg);
            await fetchHistory(arg);
          }
          break;
        case '/clear':
          clearScreen();
          break;
        case '/logout':
          printLine('Terminating session...', '#f00');
          logout();
          break;
        case '/whoami':
          printLine(`IDENTITY: ${user?.uid}`, '#0ff');
          break;
        default:
          printLine(`[ERROR]: Command not found: ${cmd}`, '#f00');
      }
    } else {
      // It's a standard message
      if (!recipientUid) {
        printLine(`[ERROR]: No active connection. Use /connect <uid>`, '#f00');
      } else {
        await sendMessage(trimmed);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(inputValue);
      setInputValue('');
    }
  };

  if (loading || !user) {
    return (
      <div style={{ backgroundColor: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#0f0', fontFamily: 'monospace' }}>Booting terminal...</p>
      </div>
    );
  }

  return (
    <div
      className="terminal-layout"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Contact List Pane (Left) */}
      <div className="contact-pane">
        <div style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#888', fontWeight: 'bold' }}>
          <span>/// DIRECTORIES</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
          {contacts.length === 0 && <span style={{ color: '#555' }}>Scanning network...</span>}
          {contacts.map((contact) => {
            const isOnline = onlineUids.has(contact.uid);
            const isSelected = recipientUid === contact.uid;
            return (
              <div
                key={contact.uid}
                onClick={async () => {
                  setRecipientUid(contact.uid);
                  await fetchHistory(contact.uid);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  backgroundColor: isSelected ? '#1a1a1a' : 'transparent',
                  border: isSelected ? '1px solid #333' : '1px solid transparent',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isSelected ? '#1a1a1a' : '#111')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = isSelected ? '#1a1a1a' : 'transparent')}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#333',
                    backgroundImage: contact.photoURL ? `url(${contact.photoURL})` : 'none',
                    backgroundSize: 'cover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {!contact.photoURL && contact.displayName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {contact.displayName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: isOnline ? '#0f0' : '#555' }}>
                    {isOnline ? '[ONLINE]' : '[OFFLINE]'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ghost Chat Pane (Middle) */}
      <div className="ghost-pane">
        <div style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>HE-OS v1.0.0 [Terminal Mode]</span>
          <span>{recipientUid ? `[CONNECTED: ${recipientUid}]` : '[STANDBY]'}</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingRight: '1rem' }}>
          {lines.length === 0 && <span style={{ color: '#888' }}>Initializing...</span>}
          {lines.map((line) => (
            <div 
              key={line.id} 
              style={{ 
                color: line.color, 
                wordWrap: 'break-word', 
                whiteSpace: 'pre-wrap',
                cursor: line.isBurn ? 'pointer' : 'default',
                textDecoration: line.isBurn ? 'underline' : 'none'
              }}
              onClick={() => {
                if (line.isBurn && line.burnId) {
                  revealBurnMessage(line.burnId, line.id);
                }
              }}
            >
              {line.text}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <span style={{ color: '#0f0', fontWeight: 'bold' }}>{recipientUid ? `${recipientUid}>` : '>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#0f0',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '1rem',
              outline: 'none',
            }}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>

      {/* System Pulse Monitor Pane (Right) */}
      <div className="pulse-pane">
        <div style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#888', fontWeight: 'bold' }}>
          <span>/// SYSTEM PULSE MONITOR</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem', fontSize: '0.85rem' }}>
          {pulseLogs.length === 0 && <span style={{ color: '#555' }}>Awaiting events...</span>}
          {pulseLogs.map((log) => (
            <div key={log.id} style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
              <span style={{ color: '#555' }}>[{new Date().toLocaleTimeString()}]</span>{' '}
              <span style={{ color: log.color, fontWeight: 'bold' }}>[{log.category}]</span>{' '}
              <span style={{ color: '#ccc' }}>{log.text}</span>
            </div>
          ))}
          <div ref={pulseEndRef} />
        </div>
      </div>
    </div>
  );
}
