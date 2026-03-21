import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts text using a master key
 * @param {string} text Plain text to encrypt
 * @param {string} masterKey 32-byte hex string
 * @returns {string} Encrypted string in format enc:iv:encryptedData
 */
export const encrypt = (text, masterKey) => {
  if (!text) return text;
  if (!masterKey || masterKey.length !== 64) {
    throw new Error('Invalid master key. Must be a 32-byte hex string (64 characters).');
  }

  const iv = crypto.randomBytes(16);
  const key = Buffer.from(masterKey, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `enc:${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts text using a master key
 * @param {string} encryptedText Encrypted string in format enc:iv:encryptedData
 * @param {string} masterKey 32-byte hex string
 * @returns {string} Decrypted plain text
 */
export const decrypt = (encryptedText, masterKey) => {
  if (!encryptedText || !encryptedText.startsWith('enc:')) return encryptedText;
  if (!masterKey || masterKey.length !== 64) {
    throw new Error('Invalid master key for decryption.');
  }

  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];
    const key = Buffer.from(masterKey, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return encryptedText; // Return original if decryption fails (fallback for unencrypted)
  }
};
