/**
 * Odoo Connection Manager
 * Establishes and maintains connection with eigermarvelhr Odoo instance
 * Handles authentication and RPC calls
 */

export interface OdooConnectionConfig {
  url: string;
  database: string;
  username: string;
  password: string;
  version: string;
}

export interface OdooSession {
  uid: number;
  session_id: string;
  partner_id: number;
}

class OdooConnection {
  private config: OdooConnectionConfig;
  private session: OdooSession | null = null;
  private isConnected = false;

  constructor(config: OdooConnectionConfig) {
    this.config = config;
    console.log(`[OdooConnection] Initialized with URL: ${config.url}`);
  }

  /**
   * Authenticate and establish session with Odoo
   */
  async authenticate(): Promise<boolean> {
    try {
      console.log(`[OdooConnection] Authenticating as ${this.config.username}...`);

      const response = await fetch(`${this.config.url}/web/session/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            db: this.config.database,
            login: this.config.username,
            password: this.config.password,
          },
          id: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('[OdooConnection] Authentication error:', data.error);
        throw new Error(data.error.message || 'Authentication failed');
      }

      if (data.result && data.result.uid) {
        this.session = {
          uid: data.result.uid,
          session_id: data.result.session_id || '',
          partner_id: data.result.partner_id || 0,
        };
        this.isConnected = true;
        console.log(`[OdooConnection] ✓ Authenticated successfully as UID: ${this.session.uid}`);
        return true;
      }

      throw new Error('Invalid authentication response');
    } catch (error) {
      console.error('[OdooConnection] Authentication failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Make RPC call to Odoo
   */
  async rpcCall<T = unknown>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
  ): Promise<T> {
    if (!this.isConnected || !this.session) {
      throw new Error('Not connected to Odoo. Call authenticate() first.');
    }

    try {
      const response = await fetch(`${this.config.url}/web/dataset/call_kw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model,
            method,
            args,
            kwargs,
          },
          id: Math.floor(Math.random() * 10000),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error(`[OdooConnection] RPC Error for ${model}.${method}:`, data.error);
        throw new Error(data.error.message || `RPC call failed: ${model}.${method}`);
      }

      return data.result as T;
    } catch (error) {
      console.error(`[OdooConnection] RPC call failed: ${model}.${method}`, error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isAuthenticated(): boolean {
    return this.isConnected && this.session !== null;
  }

  /**
   * Get session info
   */
  getSession(): OdooSession | null {
    return this.session;
  }

  /**
   * Disconnect session
   */
  disconnect(): void {
    this.session = null;
    this.isConnected = false;
    console.log('[OdooConnection] Disconnected');
  }
}

/**
 * Create singleton instance of OdooConnection
 */
export const createOdooConnection = (config: OdooConnectionConfig): OdooConnection => {
  return new OdooConnection(config);
};

export default OdooConnection;
