import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

// Mock Firebase Admin SDK
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn()
}));

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({
            forEach: jest.fn((callback) => {
              // Mock some documents
              callback({
                id: 'doc1',
                data: () => ({
                  title: 'Test Proposal',
                  createdBy: 'user123',
                  type: 'FIBER',
                  createdAt: { toDate: () => new Date('2025-01-01') }
                })
              });
            }),
            size: 1
          }))
        }))
      })),
      add: jest.fn(() => Promise.resolve({
        id: 'new-doc-id',
        get: jest.fn(() => Promise.resolve({
          data: () => ({
            title: 'New Proposal',
            createdBy: 'user123',
            type: 'FIBER',
            createdAt: new Date('2025-01-01')
          })
        }))
      }))
    })),
    listCollections: jest.fn(() => Promise.resolve([]))
  }))
}));

// Mock auth utils
jest.mock('@/lib/auth-utils', () => ({
  extractUserContext: jest.fn(),
  requireAuthentication: jest.fn(),
  isAuthError: jest.fn(),
  createAuthErrorResponse: jest.fn(() => new Response('Auth Error', { status: 401 }))
}));

// Mock other utilities
jest.mock('@/lib/error-utils', () => ({
  createProposalApiError: jest.fn(() => new Response('API Error', { status: 500 })),
  createIndexErrorResponse: jest.fn(() => new Response('Index Error', { status: 500 })),
  createValidationErrorResponse: jest.fn(() => new Response('Validation Error', { status: 400 })),
  createDatabaseConnectionErrorResponse: jest.fn(() => new Response('DB Error', { status: 500 })),
  createInternalServerErrorResponse: jest.fn(() => new Response('Internal Error', { status: 500 })),
  createPermissionDeniedResponse: jest.fn(() => new Response('Permission Denied', { status: 403 })),
  createQuotaExceededResponse: jest.fn(() => new Response('Quota Exceeded', { status: 429 })),
  detectFirestoreError: jest.fn(() => ({ code: 'UNKNOWN_ERROR', message: 'Unknown error' }))
}));

jest.mock('@/lib/retry-utils', () => ({
  executeWithRecovery: jest.fn((operation) => operation()),
  withFirestoreRetry: jest.fn((operation) => operation()),
  RETRY_CONFIGS: { read: {}, write: {}, query: {} },
  databaseCircuitBreaker: { execute: jest.fn((operation) => operation()) }
}));

jest.mock('@/lib/fallback-query-utils', () => ({
  EnhancedQueryBuilder: jest.fn().mockImplementation(() => ({
    executeQuery: jest.fn(() => Promise.resolve({
      snapshot: {
        forEach: jest.fn((callback) => {
          callback({
            id: 'doc1',
            data: () => ({
              title: 'Test Proposal',
              createdBy: 'user123',
              type: 'FIBER',
              createdAt: { toDate: () => new Date('2025-01-01') }
            })
          });
        }),
        size: 1
      },
      usedFallback: false,
      fallbackType: null,
      performanceImpact: 'LOW',
      recommendedAction: null
    }))
  }))
}));

jest.mock('@/lib/logging-utils', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  startPerformanceMonitoring: jest.fn(() => 'tracking-id'),
  endPerformanceMonitoring: jest.fn(),
  logSuccess: jest.fn(),
  logError: jest.fn(),
  logDatabaseOperation: jest.fn()
}));

// Set up environment variables
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';

describe('/api/proposals', () => {
  const mockExtractUserContext = require('@/lib/auth-utils').extractUserContext;
  const mockIsAuthError = require('@/lib/auth-utils').isAuthError;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return proposals for authenticated user', async () => {
      // Mock successful authentication
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock authentication failure
      mockExtractUserContext.mockResolvedValue({
        code: 'MISSING_AUTH',
        message: 'Authentication required'
      });
      mockIsAuthError.mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should handle query parameters correctly', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/proposals?type=FIBER&baseId=BASE_001');
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Verify that query parameters were processed
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should include response headers for debugging', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);

      expect(response.headers.get('X-Request-ID')).toBeTruthy();
      expect(response.headers.get('X-Response-Time')).toBeTruthy();
      expect(response.headers.get('X-Result-Count')).toBeTruthy();
    });

    it('should handle database connection errors', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      // Mock database connection failure
      const mockGetFirestore = require('firebase-admin/firestore').getFirestore;
      mockGetFirestore.mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    const validProposalData = {
      title: 'Test Proposal',
      client: 'Test Client',
      type: 'FIBER',
      value: 1000,
      status: 'Rascunho'
    };

    it('should create proposal for authenticated user', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify(validProposalData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.title).toBe(validProposalData.title);
      expect(data.createdBy).toBe('user123');
    });

    it('should return 401 for unauthenticated user', async () => {
      mockExtractUserContext.mockResolvedValue({
        code: 'MISSING_AUTH',
        message: 'Authentication required'
      });
      mockIsAuthError.mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify(validProposalData)
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const invalidData = {
        // Missing required fields
        value: 1000
      };

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle invalid JSON in request body', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should set default values for optional fields', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const minimalData = {
        title: 'Test Proposal',
        client: 'Test Client'
      };

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify(minimalData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.type).toBe('GENERAL'); // Default type
      expect(data.status).toBe('Rascunho'); // Default status
      expect(data.version).toBe(1); // Default version
      expect(data.value).toBe(0); // Default value
    });

    it('should include response headers for debugging', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify(validProposalData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.headers.get('X-Request-ID')).toBeTruthy();
      expect(response.headers.get('X-Response-Time')).toBeTruthy();
      expect(response.headers.get('X-Document-ID')).toBeTruthy();
      expect(response.headers.get('X-Base-ID')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle index errors with appropriate response', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      // Mock index error
      const mockDetectFirestoreError = require('@/lib/error-utils').detectFirestoreError;
      mockDetectFirestoreError.mockReturnValue({
        code: 'INDEX_MISSING',
        message: 'Index required'
      });

      const mockExecuteWithRecovery = require('@/lib/retry-utils').executeWithRecovery;
      mockExecuteWithRecovery.mockRejectedValue(new Error('Index required'));

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);

      expect(response.status).toBe(500); // Index error response
    });

    it('should handle permission denied errors', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const mockDetectFirestoreError = require('@/lib/error-utils').detectFirestoreError;
      mockDetectFirestoreError.mockReturnValue({
        code: 'PERMISSION_DENIED',
        message: 'Permission denied'
      });

      const mockExecuteWithRecovery = require('@/lib/retry-utils').executeWithRecovery;
      mockExecuteWithRecovery.mockRejectedValue(new Error('Permission denied'));

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);

      expect(response.status).toBe(403); // Permission denied response
    });

    it('should handle quota exceeded errors', async () => {
      mockExtractUserContext.mockResolvedValue({
        userId: 'user123',
        isAuthenticated: true
      });
      mockIsAuthError.mockReturnValue(false);

      const mockDetectFirestoreError = require('@/lib/error-utils').detectFirestoreError;
      mockDetectFirestoreError.mockReturnValue({
        code: 'QUOTA_EXCEEDED',
        message: 'Quota exceeded'
      });

      const mockExecuteWithRecovery = require('@/lib/retry-utils').executeWithRecovery;
      mockExecuteWithRecovery.mockRejectedValue(new Error('Quota exceeded'));

      const request = new NextRequest('http://localhost:3000/api/proposals');
      const response = await GET(request);

      expect(response.status).toBe(429); // Quota exceeded response
    });
  });
});