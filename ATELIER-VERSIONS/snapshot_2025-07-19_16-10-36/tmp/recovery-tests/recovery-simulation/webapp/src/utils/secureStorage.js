/**
 * Secure Storage Utility - Encrypts localStorage data
 * Protects sensitive data in browser storage
 */

import CryptoJS from 'crypto-js';

class SecureStorage {
  constructor() {
    this.encryptionKey = this.generateKey();
    this.keyVersion = '1.0';
  }

  /**
   * Generate encryption key from browser fingerprint
   */
  generateKey() {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      window.location.origin
    ].join('|');
    
    return CryptoJS.SHA256(fingerprint).toString();
  }

  /**
   * Encrypt data before storing
   */
  encrypt(data) {
    try {
      const dataString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(dataString, this.encryptionKey).toString();
      
      return {
        encrypted: encrypted,
        version: this.keyVersion,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data after retrieving
   */
  decrypt(encryptedData) {
    try {
      if (!encryptedData || !encryptedData.encrypted) {
        return null;
      }

      const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, this.encryptionKey);
      const dataString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!dataString) {
        throw new Error('Failed to decrypt data');
      }

      return JSON.parse(dataString);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Store encrypted data in localStorage
   */
  setItem(key, value) {
    try {
      const encrypted = this.encrypt(value);
      localStorage.setItem(key, JSON.stringify(encrypted));
      return true;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  getItem(key) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const encryptedData = JSON.parse(stored);
      return this.decrypt(encryptedData);
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key) {
    localStorage.removeItem(key);
  }

  /**
   * Clear all encrypted storage
   */
  clear() {
    localStorage.clear();
  }

  /**
   * Check if data exists and is valid
   */
  hasItem(key) {
    const data = this.getItem(key);
    return data !== null;
  }

  /**
   * Get storage size and statistics
   */
  getStorageStats() {
    const stats = {
      totalKeys: localStorage.length,
      encryptedKeys: 0,
      totalSize: 0
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      stats.totalSize += value.length;
      
      try {
        const parsed = JSON.parse(value);
        if (parsed.encrypted && parsed.version) {
          stats.encryptedKeys++;
        }
      } catch (e) {
        // Not encrypted data
      }
    }

    return stats;
  }

  /**
   * Migrate existing localStorage data to encrypted format
   */
  migrateToEncrypted(keys) {
    const migrated = [];
    
    for (const key of keys) {
      try {
        const existing = localStorage.getItem(key);
        if (existing) {
          // Check if already encrypted
          try {
            const parsed = JSON.parse(existing);
            if (parsed.encrypted && parsed.version) {
              continue; // Already encrypted
            }
          } catch (e) {
            // Not JSON, treat as raw data
          }
          
          // Migrate to encrypted format
          const data = existing.startsWith('{') ? JSON.parse(existing) : existing;
          this.setItem(key, data);
          migrated.push(key);
        }
      } catch (error) {
        console.error(`Failed to migrate key ${key}:`, error);
      }
    }
    
    return migrated;
  }
}

// Create singleton instance
const secureStorage = new SecureStorage();

export default secureStorage;

// Export individual methods for convenience
export const setSecureItem = (key, value) => secureStorage.setItem(key, value);
export const getSecureItem = (key) => secureStorage.getItem(key);
export const removeSecureItem = (key) => secureStorage.removeItem(key);
export const hasSecureItem = (key) => secureStorage.hasItem(key);
export const clearSecureStorage = () => secureStorage.clear();
export const getSecureStorageStats = () => secureStorage.getStorageStats();
export const migrateToEncrypted = (keys) => secureStorage.migrateToEncrypted(keys);