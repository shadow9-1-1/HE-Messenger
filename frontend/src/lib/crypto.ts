import CryptoJS from 'crypto-js';

/**
 * Generates a deterministic shared key based on two UIDs.
 * Because 1-on-1 chats are bidirectional, both sender and recipient
 * can independently generate this identical key without transmitting it.
 */
function getSharedKey(uid1: string, uid2: string): string {
  const [sorted1, sorted2] = [uid1, uid2].sort();
  return `${sorted1}_${sorted2}_HE_SECRET`;
}

/**
 * Encrypts a plaintext message.
 * @param plaintext The message to encrypt
 * @param senderUid The UID of the person sending
 * @param recipientUid The UID of the person receiving
 * @returns The ciphertext
 */
export function encryptMessage(plaintext: string, senderUid: string, recipientUid: string): string {
  const key = getSharedKey(senderUid, recipientUid);
  return CryptoJS.AES.encrypt(plaintext, key).toString();
}

/**
 * Decrypts a ciphertext message.
 * @param ciphertext The encrypted string received from the backend
 * @param senderUid The UID of the person who sent it
 * @param recipientUid The UID of the person receiving it
 * @returns The decrypted plaintext, or a fallback error string if decryption fails
 */
export function decryptMessage(ciphertext: string, senderUid: string, recipientUid: string): string {
  const key = getSharedKey(senderUid, recipientUid);
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext || '[DECRYPTION FAILED]';
  } catch (error) {
    return '[DECRYPTION FAILED]';
  }
}
