import { ProposalQueryRecovery, QueryRecoveryUtils } from '../query-recovery';
import { fallbackCache } from '../retry-utils';

// Mock Firestore collection
class MockFirestoreCollection {
  private documents: any[] = [];
  private shouldThrowError = false;
  private errorToThrow: any = null;

  constructor(documents: any[] = []) {
    this.documents = documents;
  }

  where(field: string, operator: string, value: any) {
    const filtered = this.documents.filter(doc => {
      switch (operator) {
        case '==':
          return doc.data[field] === value;
        default:
          return true;
      }
    });

    return new MockFirestoreQuery(filtered, this.shouldThrowError, this.errorToThrow);
  }

  setError(error: any) {
    this.shouldThrowError = true;
    this.errorToThrow = error;
  }

  clearError() {
    this.shouldThrowError = false;
    this.errorToThrow = null;
  }
}

class MockFirestoreQuery {
  constructor(
    private documents: any[],
    private shouldThrowError = false,
    private errorToThrow: any = null
  ) {}

  where(field: string, operator: string, value: any) {
    const filtered = this.documents.filter(doc => {
      switch (operator) {
        case '==':
          return doc.data[field] === value;
        default:
          return true;
      }
    });

    return new MockFirestoreQuery(filtered, this.shouldThrowError, this.errorToThrow);
  }

  orderBy(field: string, direction: string = 'asc') {
    if (this.shouldThrowError) {
      throw this.errorToThrow;
    }

    const sorted = [...this.documents].sort((a, b) => {
      const valueA = a.data[field];
      const valueB = b.data[field];
      
      if (direction === 'desc') {
        return valueB > valueA ? 1 : valueB < valueA ? -1 : 0;
      }
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    });

    return new MockFirestoreQuery(sorted, this.shouldThrowError, this.errorToThrow);
  }

  limit(count: number) {
    return new MockFirestoreQuery(
      this.documents.slice(0, count),
      this.shouldThrowError,
      this.errorToThrow
    );
  }

  async get() {
    if (this.shouldThrowError) {
      throw this.errorToThrow;
    }

    return {
      forEach: (callback: (doc: any) => void) => {
        this.documents.forEach(doc => {
          callback({
            id: doc.id,
            data: () => doc.data
          });
        });
      },
      size: this.documents.length
    };
  }
}

describe('ProposalQueryRecovery', () => {
  let mockCollection: MockFirestoreCollection;
  let queryRecovery: ProposalQueryRecovery;

  const sampleProposals = [
    {
      id: 'prop1',
      data: {
        createdBy: 'user1',
        type: 'FIBER',
        baseId: 'BASE_001',
        createdAt: new Date('2025-01-01'),
        title: 'Proposal 1'
      }
    },
    {
      id: 'prop2',
      data: {
        createdBy: 'user1',
        type: 'VM',
        baseId: 'BASE_002',
        createdAt: new Date('2025-01-02'),
        title: 'Proposal 2'
      }
    },
    {
      id: 'prop3',
      data: {
        createdBy: 'user2',
        type: 'FIBER',
        baseId: 'BASE_003',
        createdAt: new Date('2025-01-03'),
        title: 'Proposal 3'
      }
    }
  ];

  beforeEach(() => {
    mockCollection = new MockFirestoreCollection(sampleProposals);
    queryRecovery = new ProposalQueryRecovery(mockCollection);
    fallbackCache.clear();
  });

  describe('executeQueryWithRecovery', () => {
    it('should execute primary query successfully', async () => {
      const result = await queryRecovery.executeQueryWithRecovery({
        userId: 'user1',
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      expect(result.usedFallback).toBe(false);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].createdBy).toBe('user1');
      expect(result.performanceImpact).toBe('LOW');
    });

    it('should use fallback query when primary query fails with index error', async () => {
      const indexError = new Error('The query requires an index');
      mockCollection.setError(indexError);

      const result = await queryRecovery.executeQueryWithRecovery({
        userId: 'user1',
        type: 'FIBER',
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      expect(result.usedFallback).toBe(true);
      expect(result.recoveryMethod).toBe('CLIENT_SORT');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('FIBER');
      expect(result.performanceImpact).toBe('MEDIUM');
    });

    it('should filter by baseId in fallback query', async () => {
      const indexError = new Error('The query requires an index');
      mockCollection.setError(indexError);

      const result = await queryRecovery.executeQueryWithRecovery({
        userId: 'user1',
        baseId: 'BASE_001',
        orderBy: 'createdAt'
      });

      expect(result.usedFallback).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].baseId).toBe('BASE_001');
    });

    it('should apply client-side sorting in fallback', async () => {
      const indexError = new Error('The query requires an index');
      mockCollection.setError(indexError);

      const result = await queryRecovery.executeQueryWithRecovery({
        userId: 'user1',
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      expect(result.usedFallback).toBe(true);
      expect(result.data).toHaveLength(2);
      // Should be sorted by createdAt desc
      expect(new Date(result.data[0].createdAt).getTime())
        .toBeGreaterThan(new Date(result.data[1].createdAt).getTime());
    });

    it('should apply limit in fallback query', async () => {
      const indexError = new Error('The query requires an index');
      mockCollection.setError(indexError);

      const result = await queryRecovery.executeQueryWithRecovery({
        userId: 'user1',
        orderBy: 'createdAt',
        limit: 1
      });

      expect(result.usedFallback).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should use cached results as last resort', async () => {
      const cacheKey = 'proposals_user1_all_all_createdAt_desc_unlimited';
      const cachedData = [{ id: 'cached1', title: 'Cached Proposal' }];
      fallbackCache.set(cacheKey, cachedData);

      // Make both primary and fallback fail
      const error = new Error('Database connection failed');
      mockCollection.setError(error);

      const result = await queryRecovery.executeQueryWithRecovery({
        userId: 'user1',
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      expect(result.usedFallback).toBe(true);
      expect(result.recoveryMethod).toBe('CACHED_RESULT');
      expect(result.data).toEqual(cachedData);
      expect(result.performanceImpact).toBe('LOW');
    });

    it('should cache successful results', async () => {
      await queryRecovery.executeQueryWithRecovery({
        userId: 'user1',
        orderBy: 'createdAt'
      });

      const cacheKey = 'proposals_user1_all_all_createdAt_desc_unlimited';
      const cachedData = fallbackCache.get(cacheKey);
      
      expect(cachedData).toBeDefined();
      expect(cachedData).toHaveLength(2);
    });

    it('should provide appropriate recommended actions', async () => {
      const indexError = new Error('The query requires an index');
      mockCollection.setError(indexError);

      const result = await queryRecovery.executeQueryWithRecovery({
        userId: 'user1',
        orderBy: 'createdAt'
      });

      expect(result.recommendedAction).toContain('client-side sorting');
      expect(result.recommendedAction).toContain('composite indexes');
    });
  });
});

describe('QueryRecoveryUtils', () => {
  describe('isIndexError', () => {
    it('should detect index-related errors', () => {
      const indexErrors = [
        new Error('The query requires an index'),
        new Error('composite index not found'),
        new Error('FAILED_PRECONDITION: index missing'),
        new Error('inequality filter requires composite index')
      ];

      indexErrors.forEach(error => {
        expect(QueryRecoveryUtils.isIndexError(error)).toBe(true);
      });
    });

    it('should not detect non-index errors', () => {
      const nonIndexErrors = [
        new Error('Permission denied'),
        new Error('Network connection failed'),
        new Error('Invalid argument'),
        new Error('Quota exceeded')
      ];

      nonIndexErrors.forEach(error => {
        expect(QueryRecoveryUtils.isIndexError(error)).toBe(false);
      });
    });
  });

  describe('extractRequiredFields', () => {
    it('should extract field names from error messages', () => {
      const error = new Error("The query requires an index on field 'createdBy' and 'createdAt'");
      const fields = QueryRecoveryUtils.extractRequiredFields(error);
      
      expect(fields).toContain('createdBy');
      expect(fields).toContain('createdAt');
    });

    it('should handle quoted field names', () => {
      const error = new Error('Index required for fields "userId" and "type"');
      const fields = QueryRecoveryUtils.extractRequiredFields(error);
      
      expect(fields).toContain('userId');
      expect(fields).toContain('type');
    });

    it('should filter out direction keywords', () => {
      const error = new Error("Index required on 'createdAt' desc and 'userId' asc");
      const fields = QueryRecoveryUtils.extractRequiredFields(error);
      
      expect(fields).toContain('createdAt');
      expect(fields).toContain('userId');
      expect(fields).not.toContain('desc');
      expect(fields).not.toContain('asc');
    });
  });

  describe('generateIndexUrl', () => {
    it('should generate URL with project ID', () => {
      const url = QueryRecoveryUtils.generateIndexUrl('test-project');
      expect(url).toBe('https://console.firebase.google.com/project/test-project/firestore/indexes');
    });

    it('should generate generic URL without project ID', () => {
      const url = QueryRecoveryUtils.generateIndexUrl();
      expect(url).toBe('https://console.firebase.google.com/firestore/indexes');
    });
  });
});