// Test setup file
// Global test configuration for security tests

// Increase timeout for emulator tests
jest.setTimeout(30000);

// Handle async errors
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});
