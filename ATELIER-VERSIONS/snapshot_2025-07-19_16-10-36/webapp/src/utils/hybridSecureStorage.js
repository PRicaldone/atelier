/**
 * Hybrid Secure Storage - Combines CryptoJS and Web Crypto API
 * Provides fallback and migration capabilities between encryption methods
 */

import { createModuleLogger } from '../modules/shared/monitoring/ModuleLogger';
import alertSystem, { AlertSeverity, AlertCategory } from './alertSystem';
import secureStorage from './secureStorage'; // CryptoJS implementation
import webCryptoStorage from './webCryptoStorage'; // Web Crypto API implementation

const logger = createModuleLogger('HybridSecureStorage');

class HybridSecureStorage {
  constructor() {
    this.preferredMethod = 'webcrypto';
    this.fallbackMethod = 'cryptojs';
    this.migrationInProgress = false;
    this.autoMigration = true;
    
    this.initialize();
  }

  async initialize() {
    logger.info('Initializing Hybrid Secure Storage');
    
    // Check Web Crypto API support
    const webCryptoSupported = webCryptoStorage.isSupported;
    
    if (!webCryptoSupported) {
      logger.warning('Web Crypto API not supported, using CryptoJS only');
      this.preferredMethod = 'cryptojs';
      
      alertSystem.createAlert({
        severity: AlertSeverity.INFO,
        category: AlertCategory.SECURITY,
        title: 'Encryption Method',
        message: 'Using CryptoJS encryption (Web Crypto API not supported)',
        details: { 
          reason: 'Browser compatibility',
          method: 'CryptoJS AES-256'
        }
      });
    } else {
      logger.info('Web Crypto API supported, using as preferred method');
      
      // Auto-migrate if enabled
      if (this.autoMigration) {
        this.performAutoMigration();
      }
    }
  }

  /**
   * Automatically migrate data from CryptoJS to Web Crypto API
   */
  async performAutoMigration() {
    if (this.migrationInProgress) {
      return;
    }

    try {
      this.migrationInProgress = true;
      logger.info('Starting automatic migration to Web Crypto API');

      // Check if migration is needed
      const cryptoJSStats = secureStorage.getStorageStats();
      const webCryptoStats = webCryptoStorage.getStorageStats();

      if (cryptoJSStats.encryptedKeys > 0 && webCryptoStats.encryptedKeys === 0) {
        logger.info('Migration needed: CryptoJS data found, no Web Crypto data');
        
        const migrationResult = await webCryptoStorage.migrateFromCryptoJS(secureStorage);
        
        if (migrationResult.success) {
          logger.info('Auto-migration completed successfully');
          
          // Update last migration timestamp
          localStorage.setItem('ATELIER_LAST_MIGRATION', new Date().toISOString());
          
          alertSystem.createAlert({
            severity: AlertSeverity.INFO,
            category: AlertCategory.SECURITY,
            title: 'Encryption Upgraded',
            message: 'Successfully migrated to Web Crypto API for enhanced security',
            details: migrationResult.results
          });
        } else {
          logger.error('Auto-migration failed', migrationResult);
        }
      } else {
        logger.info('No migration needed');
      }
    } catch (error) {
      logger.error(error, 'Auto-migration process failed');
    } finally {
      this.migrationInProgress = false;
    }
  }

  /**
   * Get the appropriate storage method for a key
   */
  async getStorageMethod(key) {
    // Check if data exists in Web Crypto storage
    const webCryptoKey = `ATELIER_WEBCRYPTO_${key}`;
    const hasWebCrypto = localStorage.getItem(webCryptoKey) !== null;

    // Check if data exists in CryptoJS storage
    const cryptoJSKey = `ATELIER_SECURE_${key}`;
    const hasCryptoJS = localStorage.getItem(cryptoJSKey) !== null;

    // Determine which method to use
    if (hasWebCrypto && this.preferredMethod === 'webcrypto') {
      return 'webcrypto';
    } else if (hasCryptoJS) {
      return 'cryptojs';
    } else {
      return this.preferredMethod;
    }
  }

  /**
   * Set item with preferred encryption method
   */
  async setItem(key, value, context = 'default') {
    try {
      const method = this.preferredMethod;
      
      if (method === 'webcrypto' && webCryptoStorage.isSupported) {
        const success = await webCryptoStorage.setItem(key, value, context);
        if (success) {
          logger.info(`Stored with Web Crypto: ${key}`);
          return true;
        } else {
          logger.warning(`Web Crypto storage failed, falling back to CryptoJS: ${key}`);
          // Fall back to CryptoJS
          secureStorage.setItem(key, value);
          return true;
        }
      } else {
        // Use CryptoJS
        secureStorage.setItem(key, value);
        logger.info(`Stored with CryptoJS: ${key}`);
        return true;
      }
    } catch (error) {
      logger.error(error, `Failed to store item: ${key}`);
      
      alertSystem.createAlert({
        severity: AlertSeverity.ERROR,
        category: AlertCategory.SECURITY,
        title: 'Storage Failed',
        message: `Failed to store encrypted data for: ${key}`,
        details: { key, error: error.message }
      });
      
      return false;
    }
  }

  /**
   * Get item with automatic method detection
   */
  async getItem(key, context = 'default') {
    try {
      const method = await this.getStorageMethod(key);
      
      if (method === 'webcrypto') {
        const data = await webCryptoStorage.getItem(key, context);
        if (data !== null) {
          logger.info(`Retrieved with Web Crypto: ${key}`);
          return data;
        }
      }
      
      // Try CryptoJS as fallback or primary method
      const data = secureStorage.getItem(key);
      if (data !== null) {
        logger.info(`Retrieved with CryptoJS: ${key}`);
        
        // Optionally migrate to Web Crypto API on read
        if (this.autoMigration && this.preferredMethod === 'webcrypto' && webCryptoStorage.isSupported) {
          try {
            await webCryptoStorage.setItem(key, data, context);
            logger.info(`Auto-migrated on read: ${key}`);
          } catch (migrationError) {
            logger.warning(migrationError, `Failed to auto-migrate on read: ${key}`);
          }
        }
        
        return data;
      }
      
      return null;
    } catch (error) {
      logger.error(error, `Failed to retrieve item: ${key}`);
      
      alertSystem.createAlert({
        severity: AlertSeverity.WARNING,
        category: AlertCategory.SECURITY,
        title: 'Retrieval Failed',
        message: `Failed to decrypt data for: ${key}`,
        details: { key, error: error.message }
      });
      
      return null;
    }
  }

  /**
   * Remove item from both storage methods
   */
  removeItem(key) {
    try {
      // Remove from both storage methods to ensure cleanup
      webCryptoStorage.removeItem(key);
      secureStorage.removeItem(key);
      
      logger.info(`Removed item: ${key}`);
      return true;
    } catch (error) {
      logger.error(error, `Failed to remove item: ${key}`);
      return false;
    }
  }

  /**
   * Clear all encrypted storage
   */
  clear() {
    try {
      const webCryptoCleared = webCryptoStorage.clear();
      const cryptoJSCleared = secureStorage.clear();
      
      const totalCleared = webCryptoCleared + cryptoJSCleared;
      logger.info(`Cleared all encrypted storage: ${totalCleared} items`);
      
      return totalCleared;
    } catch (error) {
      logger.error(error, 'Failed to clear encrypted storage');
      return 0;
    }
  }

  /**
   * Get comprehensive storage statistics
   */
  getStorageStats() {
    const cryptoJSStats = secureStorage.getStorageStats();
    const webCryptoStats = webCryptoStorage.getStorageStats();
    
    return {
      hybrid: {
        preferredMethod: this.preferredMethod,
        fallbackMethod: this.fallbackMethod,
        migrationInProgress: this.migrationInProgress,
        lastMigration: localStorage.getItem('ATELIER_LAST_MIGRATION')
      },
      cryptojs: cryptoJSStats,
      webcrypto: webCryptoStats,
      total: {
        encryptedKeys: cryptoJSStats.encryptedKeys + webCryptoStats.encryptedKeys,
        totalSize: cryptoJSStats.totalSize + webCryptoStats.totalSize
      }
    };
  }

  /**
   * Perform manual migration
   */
  async performMigration(direction = 'to-webcrypto') {
    if (this.migrationInProgress) {
      throw new Error('Migration already in progress');
    }

    try {
      this.migrationInProgress = true;
      logger.info(`Starting manual migration: ${direction}`);

      let result;
      
      if (direction === 'to-webcrypto') {
        result = await webCryptoStorage.migrateFromCryptoJS(secureStorage);
      } else {
        throw new Error('Migration direction not supported');
      }

      if (result.success) {
        localStorage.setItem('ATELIER_LAST_MIGRATION', new Date().toISOString());
        
        alertSystem.createAlert({
          severity: AlertSeverity.INFO,
          category: AlertCategory.SECURITY,
          title: 'Migration Completed',
          message: `Successfully migrated to ${direction.replace('-', ' ')}`,
          details: result.results
        });
      }

      return result;
    } catch (error) {
      logger.error(error, 'Manual migration failed');
      throw error;
    } finally {
      this.migrationInProgress = false;
    }
  }

  /**
   * Performance comparison between methods
   */
  async performanceComparison(iterations = 50) {
    logger.info('Starting performance comparison');
    
    const results = {
      cryptojs: null,
      webcrypto: null,
      comparison: null
    };

    try {
      // Test CryptoJS performance
      console.log('Testing CryptoJS performance...');
      const cryptoJSStart = performance.now();
      
      const testData = {
        test: 'performance',
        data: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `test_${i}` }))
      };

      for (let i = 0; i < iterations; i++) {
        const encrypted = secureStorage.encrypt(testData);
        secureStorage.decrypt(encrypted);
      }
      
      const cryptoJSEnd = performance.now();
      const cryptoJSTime = cryptoJSEnd - cryptoJSStart;
      
      results.cryptojs = {
        totalMs: cryptoJSTime.toFixed(2),
        avgMs: (cryptoJSTime / iterations).toFixed(2),
        iterations
      };

      // Test Web Crypto API performance (if supported)
      if (webCryptoStorage.isSupported) {
        console.log('Testing Web Crypto API performance...');
        results.webcrypto = await webCryptoStorage.performanceTest(iterations);
        
        // Calculate comparison
        if (results.webcrypto && !results.webcrypto.error) {
          const cryptoJSAvg = parseFloat(results.cryptojs.avgMs);
          const webCryptoAvg = parseFloat(results.webcrypto.totalMs);
          
          results.comparison = {
            fasterMethod: cryptoJSAvg < webCryptoAvg ? 'cryptojs' : 'webcrypto',
            speedDifference: Math.abs(cryptoJSAvg - webCryptoAvg).toFixed(2),
            percentageDifference: (Math.abs(cryptoJSAvg - webCryptoAvg) / Math.min(cryptoJSAvg, webCryptoAvg) * 100).toFixed(1)
          };
        }
      } else {
        results.webcrypto = { error: 'Web Crypto API not supported' };
      }

      logger.info('Performance comparison completed', results);
      return results;
    } catch (error) {
      logger.error(error, 'Performance comparison failed');
      return { error: error.message };
    }
  }

  /**
   * Configure storage preferences
   */
  configure(options = {}) {
    if (options.preferredMethod) {
      this.preferredMethod = options.preferredMethod;
      logger.info(`Preferred method updated: ${this.preferredMethod}`);
    }
    
    if (options.autoMigration !== undefined) {
      this.autoMigration = options.autoMigration;
      logger.info(`Auto-migration ${this.autoMigration ? 'enabled' : 'disabled'}`);
    }
    
    // Save configuration
    localStorage.setItem('ATELIER_HYBRID_CONFIG', JSON.stringify({
      preferredMethod: this.preferredMethod,
      autoMigration: this.autoMigration,
      lastUpdated: new Date().toISOString()
    }));
  }

  /**
   * Get current configuration
   */
  getConfiguration() {
    return {
      preferredMethod: this.preferredMethod,
      fallbackMethod: this.fallbackMethod,
      autoMigration: this.autoMigration,
      migrationInProgress: this.migrationInProgress,
      webCryptoSupported: webCryptoStorage.isSupported
    };
  }
}

// Create and export instance
const hybridSecureStorage = new HybridSecureStorage();

// Export for global access (development/debugging)
window.__hybridSecureStorage = hybridSecureStorage;

export default hybridSecureStorage;