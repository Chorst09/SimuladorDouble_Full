// Simple test to verify authentication utilities work
const { extractBearerToken, validateUserPermission, createAuthErrorResponse } = require('./src/lib/auth-utils.ts');

// Mock NextRequest for testing
function createMockRequest(headers = {}) {
  return {
    headers: {
      get: (name) => headers[name.toLowerCase()] || null,
    },
  };
}

console.log('Testing authentication utilities...');

// Test extractBearerToken
console.log('\n1. Testing extractBearerToken:');
const validRequest = createMockRequest({ authorization: 'Bearer test-token-123' });
const token = extractBearerToken(validRequest);
console.log('Valid token extracted:', token === 'test-token-123' ? 'PASS' : 'FAIL');

const invalidRequest = createMockRequest();
const noToken = extractBearerToken(invalidRequest);
console.log('No token case:', noToken === null ? 'PASS' : 'FAIL');

// Test validateUserPermission
console.log('\n2. Testing validateUserPermission:');
const userContext = { userId: 'user123', email: 'user@test.com', role: 'user' };
const ownResource = validateUserPermission(userContext, 'user123');
console.log('User accessing own resource:', ownResource === true ? 'PASS' : 'FAIL');

const otherResource = validateUserPermission(userContext, 'user456');
console.log('User accessing other resource:', otherResource === false ? 'PASS' : 'FAIL');

const adminContext = { userId: 'admin123', email: 'admin@test.com', role: 'admin' };
const adminAccess = validateUserPermission(adminContext, 'user456');
console.log('Admin accessing any resource:', adminAccess === true ? 'PASS' : 'FAIL');

// Test createAuthErrorResponse
console.log('\n3. Testing createAuthErrorResponse:');
const errorResponse = createAuthErrorResponse(401, 'Unauthorized', 'Authentication required');
console.log('Error response structure:', 
  errorResponse.error === 'Unauthorized' && 
  errorResponse.message === 'Authentication required' && 
  errorResponse.code === 'UNAUTHORIZED' ? 'PASS' : 'FAIL');

console.log('\nAuthentication utilities test completed!');