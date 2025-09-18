/**
 * Integration tests for useProposalsApi hook
 * Tests the hook's interaction with the API and authentication
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProposalsApi } from '@/hooks/use-proposals-api';

// Mock Firebase auth
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  getIdToken: jest.fn(() => Promise.resolve('mock-token'))
};

jest.mock('@/lib/firebase', () => ({
  app: {}
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: mockUser
  }))
}));

jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(() => ({
    user: mockUser,
    loading: false,
    error: null
  }))
}));

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.location for URL construction
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000'
  },
  writable: true
});

describe('useProposalsApi Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Fetch Proposals Integration', () => {
    it('should fetch proposals with proper authentication headers', async () => {
      const mockProposals = [
        {
          id: 'prop1',
          title: 'Test Proposal 1',
          client: 'Test Client 1',
          type: 'FIBER',
          createdBy: 'test-user-123',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'prop2',
          title: 'Test Proposal 2',
          client: 'Test Client 2',
          type: 'VM',
          createdBy: 'test-user-123',
          createdAt: '2025-01-02T00:00:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([
          ['X-Request-ID', 'req-123'],
          ['X-Response-Time', '150'],
          ['X-Result-Count', '2'],
          ['X-Fallback-Used', 'false']
        ]),
        json: () => Promise.resolve(mockProposals)
      });

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.proposals).toHaveLength(2);
      expect(result.current.proposals[0].title).toBe('Test Proposal 1');
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.usedFallback).toBe(false);

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/proposals?userId=test-user-123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'X-User-ID': 'test-user-123'
          })
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockErrorResponse = {
        error: 'Index Missing',
        message: 'Required Firestore index is missing',
        code: 'INDEX_MISSING',
        timestamp: '2025-01-01T00:00:00Z',
        details: {
          indexUrl: 'https://console.firebase.google.com/project/test/firestore/indexes',
          requiredFields: ['createdBy', 'createdAt']
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(mockErrorResponse)
      });

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.apiError).toEqual(mockErrorResponse);
      expect(result.current.proposals).toHaveLength(0);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Network error');
    });

    it('should filter proposals by type', async () => {
      const mockProposals = [
        {
          id: 'prop1',
          title: 'Fiber Proposal',
          type: 'FIBER',
          createdBy: 'test-user-123'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockProposals)
      });

      const { result } = renderHook(() => 
        useProposalsApi({ type: 'FIBER' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/proposals?type=FIBER&userId=test-user-123',
        expect.any(Object)
      );
    });

    it('should filter proposals by baseId', async () => {
      const mockProposals = [
        {
          id: 'prop1',
          title: 'Specific Proposal',
          baseId: 'BASE_001',
          createdBy: 'test-user-123'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockProposals)
      });

      const { result } = renderHook(() => 
        useProposalsApi({ baseId: 'BASE_001' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/proposals?baseId=BASE_001&userId=test-user-123',
        expect.any(Object)
      );
    });
  });

  describe('Create Proposal Integration', () => {
    it('should create proposal with proper authentication', async () => {
      const newProposal = {
        id: 'new-prop',
        title: 'New Test Proposal',
        client: 'New Test Client',
        type: 'FIBER',
        createdBy: 'test-user-123',
        baseId: 'FIBER_2025_123456',
        createdAt: '2025-01-01T00:00:00Z'
      };

      mockFetch
        // Mock initial fetch (empty results)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map(),
          json: () => Promise.resolve([])
        })
        // Mock create proposal
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          headers: new Map([
            ['X-Request-ID', 'req-create-123'],
            ['X-Document-ID', 'new-prop'],
            ['X-Base-ID', 'FIBER_2025_123456']
          ]),
          json: () => Promise.resolve(newProposal)
        });

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let createdProposal: any;
      await act(async () => {
        createdProposal = await result.current.createProposal({
          title: 'New Test Proposal',
          client: 'New Test Client',
          type: 'FIBER'
        });
      });

      expect(createdProposal).toEqual(newProposal);
      expect(result.current.proposals).toHaveLength(1);
      expect(result.current.proposals[0]).toEqual(newProposal);

      // Verify create request
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/proposals',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'X-User-ID': 'test-user-123'
          }),
          body: JSON.stringify({
            title: 'New Test Proposal',
            client: 'New Test Client',
            type: 'FIBER',
            createdBy: 'test-user-123'
          })
        })
      );
    });

    it('should handle create proposal errors', async () => {
      const mockErrorResponse = {
        error: 'Validation Error',
        message: 'Title is required',
        code: 'VALIDATION_ERROR'
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map(),
          json: () => Promise.resolve([])
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve(mockErrorResponse)
        });

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let createdProposal: any;
      await act(async () => {
        createdProposal = await result.current.createProposal({
          client: 'Test Client'
          // Missing required title
        } as any);
      });

      expect(createdProposal).toBeNull();
      expect(result.current.error).toBeTruthy();
      expect(result.current.apiError).toEqual(mockErrorResponse);
    });
  });

  describe('Authentication Integration', () => {
    it('should handle authentication token refresh', async () => {
      // Mock token refresh scenario
      mockUser.getIdToken
        .mockResolvedValueOnce('old-token')
        .mockResolvedValueOnce('new-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve([])
      });

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger refresh
      await act(async () => {
        await result.current.refresh();
      });

      expect(mockUser.getIdToken).toHaveBeenCalledWith(true); // Force refresh
    });

    it('should handle authentication failures', async () => {
      mockUser.getIdToken.mockRejectedValueOnce(new Error('Token expired'));

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Authentication failed');
    });

    it('should update user context when authentication changes', async () => {
      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.userContext).toBeTruthy();
      });

      expect(result.current.userContext?.userId).toBe('test-user-123');
      expect(result.current.userContext?.isAuthenticated).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should retry failed requests', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map(),
          json: () => Promise.resolve([])
        });

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();

      // Trigger retry
      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + retry + successful
    });

    it('should clear errors when requested', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.apiError).toBeNull();
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track fallback usage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([
          ['X-Fallback-Used', 'true'],
          ['X-Fallback-Type', 'CLIENT_SORT'],
          ['X-Performance-Impact', 'MEDIUM']
        ]),
        json: () => Promise.resolve([])
      });

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.usedFallback).toBe(true);
    });

    it('should track last fetch timestamp', async () => {
      const beforeFetch = new Date();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve([])
      });

      const { result } = renderHook(() => useProposalsApi());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const afterFetch = new Date();

      expect(result.current.lastFetch).toBeTruthy();
      expect(result.current.lastFetch!.getTime()).toBeGreaterThanOrEqual(beforeFetch.getTime());
      expect(result.current.lastFetch!.getTime()).toBeLessThanOrEqual(afterFetch.getTime());
    });
  });
});