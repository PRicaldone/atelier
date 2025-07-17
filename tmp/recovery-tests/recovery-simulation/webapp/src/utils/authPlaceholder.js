/**
 * Authentication Placeholder - Demo mode for development
 * Provides basic auth structure for future real authentication
 */

class AuthPlaceholder {
  constructor() {
    this.isDemo = true;
    this.currentUser = null;
    this.authState = 'unauthenticated';
    this.callbacks = new Set();
  }

  /**
   * Demo login - for development only
   */
  async login(credentials = {}) {
    const demoUser = {
      id: 'demo-user',
      username: credentials.username || 'demo',
      email: credentials.email || 'demo@atelier.local',
      role: 'owner',
      permissions: ['read', 'write', 'admin'],
      createdAt: new Date().toISOString(),
      isDemoUser: true
    };

    this.currentUser = demoUser;
    this.authState = 'authenticated';
    this.notifyListeners();
    
    console.log('🔐 Demo authentication successful:', demoUser);
    return { success: true, user: demoUser };
  }

  /**
   * Demo logout
   */
  async logout() {
    this.currentUser = null;
    this.authState = 'unauthenticated';
    this.notifyListeners();
    
    console.log('🔐 Demo logout successful');
    return { success: true };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.authState === 'authenticated' && this.currentUser !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check user permissions
   */
  hasPermission(permission) {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Notify listeners of auth state changes
   */
  notifyListeners() {
    this.callbacks.forEach(callback => {
      try {
        callback(this.currentUser, this.authState);
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    });
  }

  /**
   * Get auth state for debugging
   */
  getDebugInfo() {
    return {
      isDemo: this.isDemo,
      authState: this.authState,
      currentUser: this.currentUser,
      listenerCount: this.callbacks.size
    };
  }

  /**
   * Initialize demo user automatically (for development)
   */
  async initializeDemoUser() {
    if (process.env.NODE_ENV === 'development') {
      await this.login({
        username: 'developer',
        email: 'dev@atelier.local'
      });
    }
  }

  /**
   * Future: Replace with real authentication
   */
  async connectRealAuth(authProvider) {
    console.log('🔐 Connecting to real auth provider:', authProvider);
    
    // TODO: Implement real authentication
    // - Supabase: supabase.auth.signIn()
    // - Convex: convex.auth.signIn()
    // - Custom: custom auth implementation
    
    throw new Error('Real authentication not yet implemented');
  }
}

// Create singleton instance
const authPlaceholder = new AuthPlaceholder();

export default authPlaceholder;

// Export helper functions
export const login = (credentials) => authPlaceholder.login(credentials);
export const logout = () => authPlaceholder.logout();
export const isAuthenticated = () => authPlaceholder.isAuthenticated();
export const getCurrentUser = () => authPlaceholder.getCurrentUser();
export const hasPermission = (permission) => authPlaceholder.hasPermission(permission);
export const onAuthStateChange = (callback) => authPlaceholder.onAuthStateChange(callback);
export const getAuthDebugInfo = () => authPlaceholder.getDebugInfo();
export const initializeDemoUser = () => authPlaceholder.initializeDemoUser();

// Auto-initialize demo user in development
if (process.env.NODE_ENV === 'development') {
  authPlaceholder.initializeDemoUser();
}