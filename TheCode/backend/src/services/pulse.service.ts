import { getIO } from '../config/socket';

export type PulseCategory = 'AUTH' | 'SOCKET' | 'REDIS' | 'GHOST';

/**
 * Emits a standardized System Pulse log to a specific user's frontend.
 * This powers the internal diagnostic flow visible on the UI.
 * 
 * @param uid The target user's UID
 * @param category The event category tag
 * @param message The detailed log message
 */
export function emitSystemPulse(uid: string, category: PulseCategory, message: string): void {
  try {
    const io = getIO();
    
    // Only emit if the Socket.IO instance exists (prevents crashes during boot-up routes)
    if (io) {
      io.to(uid).emit('system_pulse', {
        category,
        message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    // Gracefully catch if getIO() throws "Socket.IO not initialized" during early API calls
    console.debug(`[PULSE IGN] Socket not ready yet. Missed ${category} for ${uid}`);
  }
}
