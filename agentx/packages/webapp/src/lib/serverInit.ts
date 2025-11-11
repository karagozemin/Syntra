// Server-side initialization for better error handling
// This should be imported early in the application lifecycle

let isInitialized = false;

export function initializeServerErrorHandling() {
  if (isInitialized || typeof window !== 'undefined') {
    return; // Already initialized or running on client
  }
  
  console.log('🔧 Initializing server-side error handling...');
  
  // Handle unhandled promise rejections more gracefully
  process.on('unhandledRejection', (reason, promise) => {
    const reasonStr = reason instanceof Error ? reason.message : String(reason);
    
    // Filter out known IPFS Storage timeout issues that are handled elsewhere
    if (reasonStr.includes('Upload timeout') || 
        reasonStr.includes('ETIMEDOUT') ||
        reasonStr.includes('read ETIMEDOUT')) {
      console.log('🔧 Suppressed handled storage timeout rejection:', reasonStr);
      return;
    }
    
    // Log other unhandled rejections for debugging
    console.warn('⚠️ Unhandled Promise Rejection:', reasonStr);
    console.warn('Promise:', promise);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    // Don't exit the process in development/production
    // process.exit(1);
  });
  
  isInitialized = true;
  console.log('✅ Server error handling initialized');
}

// Auto-initialize if this module is imported
if (typeof window === 'undefined') {
  initializeServerErrorHandling();
}
