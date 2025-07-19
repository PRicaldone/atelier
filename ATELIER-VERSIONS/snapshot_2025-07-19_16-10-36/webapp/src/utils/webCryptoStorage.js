/**
 * Web Crypto API Storage - Modern browser-native encryption
 * Enhanced security with native Web Crypto API implementation
 */

import { createModuleLogger } from '../modules/shared/monitoring/ModuleLogger';
import alertSystem, { AlertSeverity, AlertCategory } from './alertSystem';

const logger = createModuleLogger('WebCryptoStorage');

class WebCryptoStorage {
  constructor() {
    this.keyCache = new Map();
    this.keyVersion = '2.0';
    this.algorithm = {
      name: 'AES-GCM',
      length: 256
    };
    this.derivationAlgorithm = {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: 100000
    };
    this.isSupported = this.checkSupport();
    
    if (!this.isSupported) {
      logger.warning('Web Crypto API not supported, falling back to CryptoJS');
      alertSystem.createAlert({
        severity: AlertSeverity.WARNING,
        category: AlertCategory.SECURITY,
        title: 'Web Crypto API Not Supported',
        message: 'Falling back to CryptoJS implementation',
        details: { userAgent: navigator.userAgent }
      });
    }
  }

  /**
   * Check if Web Crypto API is supported
   */
  checkSupport() {
    return (
      typeof window !== 'undefined' &&
      window.crypto &&
      window.crypto.subtle &&
      typeof window.crypto.subtle.encrypt === 'function' &&
      typeof window.crypto.subtle.decrypt === 'function' &&
      typeof window.crypto.subtle.importKey === 'function' &&
      typeof window.crypto.subtle.deriveKey === 'function'
    );
  }

  /**
   * Generate browser fingerprint for key derivation
   */
  generateFingerprint() {
    const components = [
      navigator.userAgent || '',
      navigator.language || '',
      screen.width?.toString() || '',
      screen.height?.toString() || '',
      new Date().getTimezoneOffset()?.toString() || '',
      window.location.origin || '',
      navigator.hardwareConcurrency?.toString() || '',
      navigator.deviceMemory?.toString() || '',
      navigator.platform || ''
    ];
    
    return components.join('|');
  }

  /**
   * Derive encryption key from fingerprint using PBKDF2
   */
  async deriveKey(fingerprint, salt) {
    try {
      // Import the fingerprint as key material
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(fingerprint),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      // Derive the actual encryption key
      const key = await window.crypto.subtle.deriveKey(
        {
          ...this.derivationAlgorithm,
          salt: salt
        },
        keyMaterial,
        this.algorithm,
        false,
        ['encrypt', 'decrypt']
      );

      return key;
    } catch (error) {
      logger.error(error, 'Key derivation failed');
      throw new Error('Failed to derive encryption key');
    }
  }

  /**
   * Get or create encryption key for a specific context
   */
  async getEncryptionKey(context = 'default') {
    const cacheKey = `${context}_${this.keyVersion}`;
    
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey);
    }

    try {
      const fingerprint = this.generateFingerprint();
      
      // Use context as part of salt for key isolation
      const saltData = new TextEncoder().encode(`atelier_${context}_${this.keyVersion}`);
      const salt = await window.crypto.subtle.digest('SHA-256', saltData);
      
      const key = await this.deriveKey(fingerprint, new Uint8Array(salt));
      
      // Cache the key for performance
      this.keyCache.set(cacheKey, key);
      
      logger.info(`Encryption key generated for context: ${context}`);
      return key;
    } catch (error) {
      logger.error(error, `Failed to get encryption key for context: ${context}`);
      throw error;
    }
  }

  /**
   * Encrypt data using Web Crypto API
   */
  async encrypt(data, context = 'default') {
    if (!this.isSupported) {
      throw new Error('Web Crypto API not supported');
    }

    try {
      const key = await this.getEncryptionKey(context);
      
      // Generate random IV for each encryption
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
      
      // Convert data to string and then to bytes
      const dataString = JSON.stringify(data);
      const dataBytes = new TextEncoder().encode(dataString);
      
      // Encrypt the data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        dataBytes
      );
      
      // Combine IV and encrypted data
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);
      
      // Convert to base64 for storage
      const base64 = btoa(String.fromCharCode(...combined));
      
      return {
        encrypted: base64,
        version: this.keyVersion,
        timestamp: Date.now(),
        context: context,
        algorithm: 'AES-GCM-256'
      };
    } catch (error) {
      logger.error(error, 'Web Crypto encryption failed', { context });
      throw new Error('Failed to encrypt data with Web Crypto API');
    }
  }

  /**
   * Decrypt data using Web Crypto API
   */
  async decrypt(encryptedData, context = 'default') {
    if (!this.isSupported) {
      throw new Error('Web Crypto API not supported');
    }

    try {
      if (!encryptedData.encrypted || !encryptedData.version) {
        throw new Error('Invalid encrypted data format');
      }

      const key = await this.getEncryptionKey(context);
      
      // Convert base64 back to bytes
      const combined = new Uint8Array(
        atob(encryptedData.encrypted)
          .split('')
          .map(char => char.charCodeAt(0))
      );
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12); // 96-bit IV
      const encryptedBytes = combined.slice(12);
      
      // Decrypt the data
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encryptedBytes
      );
      
      // Convert back to string and parse JSON
      const decryptedString = new TextDecoder().decode(decryptedBuffer);
      const decryptedData = JSON.parse(decryptedString);
      
      return decryptedData;
    } catch (error) {
      logger.error(error, 'Web Crypto decryption failed', { context });
      throw new Error('Failed to decrypt data with Web Crypto API');
    }
  }

  /**
   * Set item in localStorage with encryption
   */
  async setItem(key, value, context = 'default') {
    try {
      const encrypted = await this.encrypt(value, context);
      const storageKey = `ATELIER_WEBCRYPTO_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(encrypted));
      
      logger.info(`Encrypted item stored: ${key} (context: ${context})`);
      return true;
    } catch (error) {
      logger.error(error, 'Failed to store encrypted item', { key, context });
      
      alertSystem.createAlert({
        severity: AlertSeverity.ERROR,
        category: AlertCategory.SECURITY,
        title: 'Encryption Storage Failed',
        message: `Failed to store encrypted data for key: ${key}`,
        details: { key, context, error: error.message }
      });
      
      return false;
    }
  }

  /**
   * Get item from localStorage with decryption
   */
  async getItem(key, context = 'default') {
    try {
      const storageKey = `ATELIER_WEBCRYPTO_${key}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (!storedData) {
        return null;
      }
      
      const encryptedData = JSON.parse(storedData);
      const decrypted = await this.decrypt(encryptedData, context);
      
      logger.info(`Encrypted item retrieved: ${key} (context: ${context})`);
      return decrypted;
    } catch (error) {
      logger.error(error, 'Failed to retrieve encrypted item', { key, context });
      
      alertSystem.createAlert({
        severity: AlertSeverity.WARNING,
        category: AlertCategory.SECURITY,
        title: 'Decryption Failed',
        message: `Failed to decrypt data for key: ${key}. Data may be corrupted.`,
        details: { key, context, error: error.message }
      });
      
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key) {
    const storageKey = `ATELIER_WEBCRYPTO_${key}`;
    localStorage.removeItem(storageKey);
    logger.info(`Encrypted item removed: ${key}`);
  }

  /**
   * Clear all Web Crypto encrypted items
   */
  clear() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ATELIER_WEBCRYPTO_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.keyCache.clear();
    
    logger.info(`Cleared ${keysToRemove.length} encrypted items`);
    return keysToRemove.length;
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    const stats = {
      webCryptoSupported: this.isSupported,
      keyVersion: this.keyVersion,
      algorithm: 'AES-GCM-256',
      encryptedKeys: 0,
      totalSize: 0,
      cachedKeys: this.keyCache.size
    };

    // Count encrypted items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ATELIER_WEBCRYPTO_')) {
        stats.encryptedKeys++;
        const value = localStorage.getItem(key);
        if (value) {
          stats.totalSize += value.length;
        }
      }
    }

    return stats;
  }

  /**
   * Test encryption/decryption performance
   */
  async performanceTest(iterations = 100) {
    if (!this.isSupported) {
      return { error: 'Web Crypto API not supported' };
    }

    const testData = {
      message: 'Performance test data',
      timestamp: Date.now(),
      array: new Array(100).fill(0).map((_, i) => i),
      nested: {
        deep: {
          object: 'test'
        }
      }
    };

    try {
      console.time('WebCrypto Performance Test');
      
      const encryptionTimes = [];
      const decryptionTimes = [];

      for (let i = 0; i < iterations; i++) {
        // Test encryption
        const encStart = performance.now();
        const encrypted = await this.encrypt(testData);
        const encEnd = performance.now();
        encryptionTimes.push(encEnd - encStart);

        // Test decryption
        const decStart = performance.now();
        await this.decrypt(encrypted);
        const decEnd = performance.now();
        decryptionTimes.push(decEnd - decStart);
      }

      console.timeEnd('WebCrypto Performance Test');

      const avgEncryption = encryptionTimes.reduce((a, b) => a + b, 0) / iterations;
      const avgDecryption = decryptionTimes.reduce((a, b) => a + b, 0) / iterations;

      return {
        iterations,
        avgEncryptionMs: avgEncryption.toFixed(2),
        avgDecryptionMs: avgDecryption.toFixed(2),
        totalMs: (avgEncryption + avgDecryption).toFixed(2),
        supported: true
      };
    } catch (error) {
      logger.error(error, 'Performance test failed');
      return { error: error.message };
    }
  }

  /**
   * Migrate data from CryptoJS to Web Crypto API
   */
  async migrateFromCryptoJS(cryptoJSStorage) {
    if (!this.isSupported) {
      logger.warning('Cannot migrate: Web Crypto API not supported');
      return { success: false, reason: 'Web Crypto API not supported' };
    }

    try {
      logger.info('Starting migration from CryptoJS to Web Crypto API');
      
      const migrationResults = {
        attempted: 0,
        successful: 0,
        failed: 0,
        errors: []
      };

      // Get all CryptoJS encrypted keys
      const cryptoJSKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ATELIER_SECURE_') && !key.includes('WEBCRYPTO')) {
          cryptoJSKeys.push(key);
        }
      }

      for (const storageKey of cryptoJSKeys) {
        migrationResults.attempted++;
        
        try {
          // Extract the actual key name
          const actualKey = storageKey.replace('ATELIER_SECURE_', '');
          
          // Get decrypted data from CryptoJS storage
          const decryptedData = cryptoJSStorage.getItem(actualKey);
          
          if (decryptedData !== null) {
            // Store using Web Crypto API
            const success = await this.setItem(actualKey, decryptedData);
            
            if (success) {
              migrationResults.successful++;
              logger.info(`Migrated key: ${actualKey}`);
            } else {
              migrationResults.failed++;
              migrationResults.errors.push(`Failed to encrypt ${actualKey} with Web Crypto`);
            }
          } else {
            migrationResults.failed++;
            migrationResults.errors.push(`Failed to decrypt ${actualKey} from CryptoJS`);
          }
        } catch (error) {
          migrationResults.failed++;
          migrationResults.errors.push(`Migration failed for ${storageKey}: ${error.message}`);
          logger.error(error, `Migration failed for key: ${storageKey}`);
        }
      }

      logger.info('Migration completed', migrationResults);
      
      alertSystem.createAlert({
        severity: migrationResults.failed === 0 ? AlertSeverity.INFO : AlertSeverity.WARNING,
        category: AlertCategory.SECURITY,
        title: 'Web Crypto Migration Completed',
        message: `Migrated ${migrationResults.successful}/${migrationResults.attempted} items to Web Crypto API`,
        details: migrationResults
      });

      return {
        success: migrationResults.failed === 0,
        results: migrationResults
      };
    } catch (error) {
      logger.error(error, 'Migration process failed');
      return { success: false, error: error.message };
    }
  }
}

// Create and export instance
const webCryptoStorage = new WebCryptoStorage();

// Export for global access (development/debugging)
window.__webCryptoStorage = webCryptoStorage;

export default webCryptoStorage;