/**
 * Migration utility for secure storage
 * Migrates existing localStorage data to encrypted format
 */

import secureStorage from './secureStorage.js';

export const MIGRATION_KEYS = [
  'ATELIER_CANVAS_ELEMENTS',
  'ATELIER_CANVAS_SETTINGS',
  'ATELIER_CANVAS_STATE',
  'ATELIER_MIND_GARDEN',
  'atelier-unified-store',
  'atelier-project-store',
  'ATELIER_ANALYTICS_PATTERNS',
  'ATELIER_ANALYTICS_METRICS',
  'ATELIER_ANALYTICS_USAGE'
];

/**
 * Migrate all localStorage data to encrypted format
 */
export const migrateToSecureStorage = () => {
  console.log('🔐 Starting migration to secure storage...');
  
  const migrationResults = {
    migrated: [],
    skipped: [],
    errors: []
  };

  for (const key of MIGRATION_KEYS) {
    try {
      const existingData = localStorage.getItem(key);
      
      if (!existingData) {
        migrationResults.skipped.push(key);
        continue;
      }

      // Check if already encrypted
      try {
        const parsed = JSON.parse(existingData);
        if (parsed.encrypted && parsed.version) {
          migrationResults.skipped.push(`${key} (already encrypted)`);
          continue;
        }
      } catch (e) {
        // Not JSON, treat as raw data
      }

      // Parse and migrate
      let data;
      try {
        data = JSON.parse(existingData);
      } catch (e) {
        data = existingData; // Raw string data
      }

      // Migrate to secure storage
      const success = secureStorage.setItem(key, data);
      
      if (success) {
        migrationResults.migrated.push(key);
        console.log(`🔐 ✅ Migrated ${key}`);
      } else {
        migrationResults.errors.push(`${key}: Failed to encrypt`);
        console.error(`🔐 ❌ Failed to migrate ${key}`);
      }

    } catch (error) {
      migrationResults.errors.push(`${key}: ${error.message}`);
      console.error(`🔐 ❌ Error migrating ${key}:`, error);
    }
  }

  console.log('🔐 Migration complete:', {
    migrated: migrationResults.migrated.length,
    skipped: migrationResults.skipped.length,
    errors: migrationResults.errors.length
  });

  return migrationResults;
};

/**
 * Check if migration is needed
 */
export const needsSecureStorageMigration = () => {
  let unencryptedCount = 0;
  
  for (const key of MIGRATION_KEYS) {
    const data = localStorage.getItem(key);
    if (!data) continue;
    
    try {
      const parsed = JSON.parse(data);
      if (!parsed.encrypted || !parsed.version) {
        unencryptedCount++;
      }
    } catch (e) {
      // Raw data, needs migration
      unencryptedCount++;
    }
  }
  
  return unencryptedCount > 0;
};

/**
 * Auto-migrate on app startup
 */
export const autoMigrateOnStartup = () => {
  if (needsSecureStorageMigration()) {
    console.log('🔐 Auto-migrating to secure storage...');
    return migrateToSecureStorage();
  }
  
  console.log('🔐 No migration needed');
  return null;
};

/**
 * Get migration status
 */
export const getMigrationStatus = () => {
  const stats = secureStorage.getStorageStats();
  return {
    needsMigration: needsSecureStorageMigration(),
    encryptedKeys: stats.encryptedKeys,
    totalKeys: stats.totalKeys,
    encryptionPercentage: stats.totalKeys > 0 ? (stats.encryptedKeys / stats.totalKeys * 100).toFixed(1) : 0
  };
};