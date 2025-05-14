/**
 * Environment utilities for Next.js application
 */

/**
 * Determine if code is running on the server
 */
export const isServer = typeof window === 'undefined';

/**
 * Determine if code is running on the client
 */
export const isClient = !isServer;

/**
 * Ensure a function is only called on the server side
 * @throws Error if called on the client
 */
export function ensureServer(functionName: string) {
  if (typeof window !== 'undefined') {
    throw new Error(`${functionName} can only be called from server-side code`);
  }
}

/**
 * Ensure a function is only called on the client side
 * @throws Error if called on the server
 */
export function ensureClient(functionName: string): void {
  if (!isClient) {
    throw new Error(`${functionName} can only be called on the client side`);
  }
} 