// Helper function to emit socket events from API routes
export function emitSocketEvent(event, data) {
  try {
    if (global.io) {
      global.io.to('admin-room').emit(event, data);
    }
  } catch (error) {
    console.error('Socket emit error:', error);
  }
}
