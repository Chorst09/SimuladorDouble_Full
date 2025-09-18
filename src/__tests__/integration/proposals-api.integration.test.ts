/**
 * Integration tests for proposals API
 * These tests verify end-to-end functionality including database operations
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/proposals/route';

// Test configuration
const TEST_CONFIG = {
  testUserId: 'test-user-123',
  testUserEmail: 'test@example.com',
  testAuthToken: 'test-auth-token-123',
  baseUrl: 'http://localhost:3000'
};

// Helper function to create authenticated request
function createAuthenticatedRequest(
  url: string, 
  options: RequestInit = {}
): NextRequest {
  const request = new NextRequest(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_CONFIG.testAuthToken}`,
      'X-User-ID': TEST_CONFIG.testUserId,
      'X-User-Email': TEST_CONFIG.testUserEmail,
      ...options.headers
    }
  });
  
  return request;
}

// Helper function to create unauthenticated request
function createUnauthenticatedRequest(url: string, options: RequestInit = {}): NextRequest {
  return new NextRequest(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

// Mock Firebase Admin SDK for integration tests
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn()
}));

// Mock Firestore with more realistic behavior
const mockProposals = new Map();
let mockDocumentId = 1;

const mockFirestoreCollection = {
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn(() => {
    const docs = Array.from(mockProposals.values())
      .filter(doc => doc.createdBy === TEST_CONFIG.testUserId)
      .map(doc => ({
        id: doc.id,
        data: () => doc
      }));
    
    return Promise.resolve({
      forEach: (callback: (doc: any) => void) => {
        docs.forEach(callback);
      },
      size: docs.length
    });
  }),
  add: jest.fn((data) => {
    const id = `doc-${mockDocumentId++}`;
    const docData = {
      ...data,
      id,
      createdAt: new Date()
    };
    mockProposals.set(id, docData);
    
    return Promise.resolve({
      id,
      get: () => Promise.resolve({
        data: () => docData
      })
    });
  })
};

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => mockFirestoreCollection),
    listCollections: jest.fn(() => Promise.resolve([]))
  }))
}));

// Set up environment variables for testing
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';

describe('Proposals API Integration Tests', () => {
  beforeEach(() => {
    // Clear mock data before each test
    mockProposals.clear();
    mockDocumentId = 1;
    jest.clearAllMocks();
  });

  describe('End-to-End Proposal Creation and Retrieval', () => {
    it('should create and retrieve proposals for authenticated user', async () => {
      // Step 1: Create a proposal
      const proposalData = {
        title: 'Integration Test Proposal',
        client: 'Test Client Corp',
        type: 'FIBER',
        value: 5000,
        status: 'Rascunho',
        accountManager: 'Test Manager',
        distributorId: 'dist-001'
      };

      const createRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`,
        {
          method: 'POST',
          body: JSON.stringify(proposalData)
        }
      );

      const createResponse = await POST(createRequest);
      expect(createResponse.status).toBe(201);

      const createdProposal = await createResponse.json();
      expect(createdProposal.id).toBeDefined();
      expect(createdProposal.title).toBe(proposalData.title);
      expect(createdProposal.createdBy).toBe(TEST_CONFIG.testUserId);
      expect(createdProposal.baseId).toBeDefined();

      // Step 2: Retrieve proposals
      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`
      );

      const getResponse = await GET(getRequest);
      expect(getResponse.status).toBe(200);

      const proposals = await getResponse.json();
      expect(Array.isArray(proposals)).toBe(true);
      expect(proposals).toHaveLength(1);
      expect(proposals[0].id).toBe(createdProposal.id);
      expect(proposals[0].title).toBe(proposalData.title);
    });

    it('should filter proposals by type', async () => {
      // Create proposals of different types
      const fiberProposal = {
        title: 'Fiber Proposal',
        client: 'Fiber Client',
        type: 'FIBER'
      };

      const vmProposal = {
        title: 'VM Proposal',
        client: 'VM Client',
        type: 'VM'
      };

      // Create both proposals
      await POST(createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`,
        { method: 'POST', body: JSON.stringify(fiberProposal) }
      ));

      await POST(createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`,
        { method: 'POST', body: JSON.stringify(vmProposal) }
      ));

      // Retrieve only FIBER proposals
      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals?type=FIBER`
      );

      const getResponse = await GET(getRequest);
      expect(getResponse.status).toBe(200);

      const proposals = await getResponse.json();
      expect(proposals).toHaveLength(1);
      expect(proposals[0].type).toBe('FIBER');
      expect(proposals[0].title).toBe('Fiber Proposal');
    });

    it('should filter proposals by baseId', async () => {
      // Create a proposal
      const proposalData = {
        title: 'BaseId Test Proposal',
        client: 'BaseId Client',
        type: 'GENERAL'
      };

      const createResponse = await POST(createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`,
        { method: 'POST', body: JSON.stringify(proposalData) }
      ));

      const createdProposal = await createResponse.json();
      const baseId = createdProposal.baseId;

      // Retrieve by baseId
      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals?baseId=${baseId}`
      );

      const getResponse = await GET(getRequest);
      expect(getResponse.status).toBe(200);

      const proposals = await getResponse.json();
      expect(proposals).toHaveLength(1);
      expect(proposals[0].baseId).toBe(baseId);
    });
  });

  describe('User Isolation and Security', () => {
    it('should only return proposals for authenticated user', async () => {
      // Create proposal for test user
      const proposalData = {
        title: 'User Isolation Test',
        client: 'Test Client',
        type: 'FIBER'
      };

      await POST(createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`,
        { method: 'POST', body: JSON.stringify(proposalData) }
      ));

      // Manually add a proposal for a different user to mock data
      mockProposals.set('other-user-doc', {
        id: 'other-user-doc',
        title: 'Other User Proposal',
        client: 'Other Client',
        type: 'VM',
        createdBy: 'other-user-456',
        createdAt: new Date()
      });

      // Retrieve proposals - should only get the authenticated user's proposal
      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`
      );

      const getResponse = await GET(getRequest);
      expect(getResponse.status).toBe(200);

      const proposals = await getResponse.json();
      expect(proposals).toHaveLength(1);
      expect(proposals[0].createdBy).toBe(TEST_CONFIG.testUserId);
      expect(proposals[0].title).toBe('User Isolation Test');
    });

    it('should reject unauthenticated requests', async () => {
      const getRequest = createUnauthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`
      );

      const getResponse = await GET(getRequest);
      expect(getResponse.status).toBe(401);
    });

    it('should reject requests with invalid authentication', async () => {
      const getRequest = new NextRequest(`${TEST_CONFIG.baseUrl}/api/proposals`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      const getResponse = await GET(getRequest);
      expect(getResponse.status).toBe(401);
    });
  });

  describe('Data Validation and Error Handling', () => {
    it('should validate required fields on creation', async () => {
      const invalidData = {
        // Missing required fields: title, client
        type: 'FIBER',
        value: 1000
      };

      const createRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`,
        {
          method: 'POST',
          body: JSON.stringify(invalidData)
        }
      );

      const createResponse = await POST(createRequest);
      expect(createResponse.status).toBe(400);

      const errorData = await createResponse.json();
      expect(errorData.error).toBeDefined();
    });

    it('should handle malformed JSON gracefully', async () => {
      const createRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`,
        {
          method: 'POST',
          body: 'invalid json {'
        }
      );

      const createResponse = await POST(createRequest);
      expect(createResponse.status).toBe(400);
    });

    it('should set appropriate default values', async () => {
      const minimalData = {
        title: 'Minimal Proposal',
        client: 'Minimal Client'
      };

      const createRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`,
        {
          method: 'POST',
          body: JSON.stringify(minimalData)
        }
      );

      const createResponse = await POST(createRequest);
      expect(createResponse.status).toBe(201);

      const createdProposal = await createResponse.json();
      expect(createdProposal.type).toBe('GENERAL');
      expect(createdProposal.status).toBe('Rascunho');
      expect(createdProposal.version).toBe(1);
      expect(createdProposal.value).toBe(0);
      expect(createdProposal.createdBy).toBe(TEST_CONFIG.testUserId);
    });
  });

  describe('Performance and Monitoring', () => {
    it('should include performance headers in responses', async () => {
      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`
      );

      const getResponse = await GET(getRequest);
      expect(getResponse.status).toBe(200);

      // Check for performance monitoring headers
      expect(getResponse.headers.get('X-Request-ID')).toBeTruthy();
      expect(getResponse.headers.get('X-Response-Time')).toBeTruthy();
      expect(getResponse.headers.get('X-Result-Count')).toBeTruthy();
    });

    it('should handle large result sets efficiently', async () => {
      // Create multiple proposals
      const proposalPromises = [];
      for (let i = 0; i < 10; i++) {
        const proposalData = {
          title: `Bulk Proposal ${i}`,
          client: `Bulk Client ${i}`,
          type: 'FIBER',
          value: 1000 * (i + 1)
        };

        proposalPromises.push(
          POST(createAuthenticatedRequest(
            `${TEST_CONFIG.baseUrl}/api/proposals`,
            { method: 'POST', body: JSON.stringify(proposalData) }
          ))
        );
      }

      await Promise.all(proposalPromises);

      // Retrieve all proposals
      const startTime = Date.now();
      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`
      );

      const getResponse = await GET(getRequest);
      const endTime = Date.now();

      expect(getResponse.status).toBe(200);

      const proposals = await getResponse.json();
      expect(proposals).toHaveLength(10);

      // Verify reasonable response time (should be under 1 second for this test)
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000);

      // Verify proposals are properly ordered (most recent first)
      for (let i = 0; i < proposals.length - 1; i++) {
        const currentDate = new Date(proposals[i].createdAt);
        const nextDate = new Date(proposals[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });
  });

  describe('Error Recovery and Fallback Scenarios', () => {
    it('should handle database connection issues gracefully', async () => {
      // Mock database connection failure
      const originalGet = mockFirestoreCollection.get;
      mockFirestoreCollection.get.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`
      );

      const getResponse = await GET(getRequest);
      
      // Should handle the error gracefully
      expect(getResponse.status).toBeGreaterThanOrEqual(500);

      // Restore original mock
      mockFirestoreCollection.get = originalGet;
    });

    it('should provide helpful error messages for index errors', async () => {
      // Mock index error
      mockFirestoreCollection.get.mockRejectedValueOnce(
        new Error('The query requires an index')
      );

      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`
      );

      const getResponse = await GET(getRequest);
      
      expect(getResponse.status).toBeGreaterThanOrEqual(400);
      
      // Should provide structured error information
      const errorData = await getResponse.json();
      expect(errorData.error).toBeDefined();
    });
  });

  describe('Query Parameter Validation', () => {
    it('should handle invalid query parameters gracefully', async () => {
      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals?type=INVALID_TYPE&limit=invalid`
      );

      const getResponse = await GET(getRequest);
      
      // Should still return 200 but filter appropriately
      expect(getResponse.status).toBe(200);
      
      const proposals = await getResponse.json();
      expect(Array.isArray(proposals)).toBe(true);
    });

    it('should support multiple query parameters', async () => {
      // Create test data
      const proposalData = {
        title: 'Multi-param Test',
        client: 'Multi Client',
        type: 'FIBER'
      };

      const createResponse = await POST(createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals`,
        { method: 'POST', body: JSON.stringify(proposalData) }
      ));

      const createdProposal = await createResponse.json();

      // Query with multiple parameters
      const getRequest = createAuthenticatedRequest(
        `${TEST_CONFIG.baseUrl}/api/proposals?type=FIBER&baseId=${createdProposal.baseId}`
      );

      const getResponse = await GET(getRequest);
      expect(getResponse.status).toBe(200);

      const proposals = await getResponse.json();
      expect(proposals).toHaveLength(1);
      expect(proposals[0].type).toBe('FIBER');
      expect(proposals[0].baseId).toBe(createdProposal.baseId);
    });
  });
});