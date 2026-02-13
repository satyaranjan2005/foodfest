'use client';

import { useState } from 'react';

// Simplified hook for Vercel deployment (no WebSocket)
// Uses auto-refresh polling instead
export function useSocket() {
  // Always return false since we're not using WebSockets on Vercel
  const [isConnected] = useState(false);

  // Dummy functions for compatibility
  const on = () => {};
  const off = () => {};

  return { isConnected, on, off };
}
