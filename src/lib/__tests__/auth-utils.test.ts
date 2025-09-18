import { extractUserContext, requireAuthentication, isAuthError, createAuthErrorResponse } from '../auth-utils';
import { NextRequest } from 'next/server';

// Mock NextRequest for testing
function createMockRequest(headers: Record<string, string> = {}): NextRequest {
  const url = 'http://localhost:3000/api/test';
  const request = new NextRequest(url);
  
  // Add headers to the request
  Object.entries(headers).forEach(([key, value]) => {
    request.headers.set(key, value);
  });
  
  return request;
}

describe('Auth Utils', () => {
  describe('extractUserContext', () => {
    it('should return MISSING_AUTH error when no authorization header', async () => {
      const request = createMockRequest();
      const result = await extractUserContext(request);
      
      expect(isAuthError(result)).toBe(true);
      if (isAuthError(result)) {
        expect(result.code).toBe('MISSING_AUTH');
        expect(result.message).toBe('Authorization header is required');
      }
    });

    it('should return INVALID_TOKEN error when authorization header is malformed', async () => {
      const request = createMockRequest({
        'authorization': 'InvalidFormat'
      });
      const result = await extractUserContext(request);
      
      expect(isAuthError(result)).toBe(true);
      if (isAuthError(result)) {
        expect(result.code).toBe('INVALID_TOKEN');
        expect(result.message).toBe('Invalid authorization token format');
      }
    });

    it('should return INVALID_TOKEN error when Bearer token is empty', async () => {
      const request = createMockRequest({
        'authorization': 'Bearer '
      });
      const result = await extractUserContext(request);
      
      expect(isAuthError(result)).toBe(true);
      if (isAuthError(result)) {
        expect(result.code).toBe('INVALID_TOKEN');
        expect(result.message).toBe('Unable to extract user ID from token');
      }
    });

    it('should extract user context from valid Bearer token with user_ prefix', async () => {
      const request = createMockRequest({
        'authorization': 'Bearer user_12345'
      });
      const result = await extractUserContext(request);
      
      expect(isAuthError(result)).toBe(false);
      if (!isAuthError(result)) {
        expect(result.userId).toBe('user_12345');
        expect(result.isAuthenticated).toBe(true);
      }
    });

    it('should extract user context from base64 encoded JSON token', async () => {
      const tokenData = { userId: 'test-user-123', sub: 'test-user-123' };
      const encodedToken = btoa(JSON.stringify(tokenData));
      
      const request = createMockRequest({
        'authorization': `Bearer ${encodedToken}`
      });
      const result = await extractUserContext(request);
      
      expect(isAuthError(result)).toBe(false);
      if (!isAuthError(result)) {
        expect(result.userId).toBe('test-user-123');
        expect(result.isAuthenticated).toBe(true);
      }
    });

    it('should treat non-JSON token as direct user ID', async () => {
      const request = createMockRequest({
        'authorization': 'Bearer simple-user-id'
      });
      const result = await extractUserContext(request);
      
      expect(isAuthError(result)).toBe(false);
      if (!isAuthError(result)) {
        expect(result.userId).toBe('simple-user-id');
        expect(result.isAuthenticated).toBe(true);
      }
    });

    it('should handle authentication errors gracefully', async () => {
      // Test with a token that would cause an error in processing
      const request = createMockRequest({
        'authorization': 'Bearer '
      });
      const result = await extractUserContext(request);
      
      expect(isAuthError(result)).toBe(true);
    });
  });

  describe('requireAuthentication', () => {
    it('should throw error for missing authentication', async () => {
      const request = createMockRequest();
      
      await expect(requireAuthentication(request)).rejects.toThrow('Authentication failed');
    });

    it('should return user context for valid authentication', async () => {
      const request = createMockRequest({
        'authorization': 'Bearer user_12345'
      });
      
      const result = await requireAuthentication(request);
      expect(result.userId).toBe('user_12345');
      expect(result.isAuthenticated).toBe(true);
    });
  });

  describe('isAuthError', () => {
    it('should correctly identify auth errors', () => {
      const authError = { code: 'MISSING_AUTH' as const, message: 'Test error' };
      const userContext = { userId: 'test', isAuthenticated: true };
      
      expect(isAuthError(authError)).toBe(true);
      expect(isAuthError(userContext)).toBe(false);
    });
  });

  describe('createAuthErrorResponse', () => {
    it('should create 401 response for MISSING_AUTH', () => {
      const error = { code: 'MISSING_AUTH' as const, message: 'Authorization required' };
      const response = createAuthErrorResponse(error);
      
      expect(response.status).toBe(401);
    });

    it('should create 403 response for other auth errors', () => {
      const error = { code: 'INVALID_TOKEN' as const, message: 'Invalid token' };
      const response = createAuthErrorResponse(error);
      
      expect(response.status).toBe(403);
    });

    it('should include error details in response body', async () => {
      const error = { code: 'EXPIRED_TOKEN' as const, message: 'Token expired' };
      const response = createAuthErrorResponse(error);
      
      const body = await response.json();
      expect(body.error).toBe('Authentication Error');
      expect(body.message).toBe('Token expired');
      expect(body.code).toBe('EXPIRED_TOKEN');
    });
  });
});