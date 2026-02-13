// Helper function to emit socket events from API routes
// Disabled for Vercel deployment - using auto-refresh instead
export function emitSocketEvent(event, data) {
  // No-op for Vercel deployment
  // Admin dashboard uses auto-refresh polling every 5 seconds
  console.log('Event logged (WebSocket disabled):', event);
}
