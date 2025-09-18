/**
 * Tests for error recovery mechanisms
 */

import { withRetry, isRetryableError, RETRY_CONFIGS } from '../retry-utils';
import { ClientSorter, shouldUseFallback } from '../fallback-query-utils';
import { detectFirestoreError } from '../error-utils';

describe('Error Recovery Mechanisms', () => {
  describe('Retry Logic', () => {
    it('should retry retryable errors', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          const error = new Error('UNAVAILABLE: Service temporarily unavailable');
          error.name = 'UNAVAILABLE';
          throw error;
        }
        return 'success';
      };

      const result = await withRetry(operation, RETRY_CONFIGS.read, 'test operation');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(3);
    });

    it('should not retry non-retryable errors', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        const error = new Error('PERMISSION_DENIED: Access denied');
        error.name = 'PERMISSION_DENIED';
        throw error;
      };

      const result = await withRetry(operation, RETRY_CONFIGS.read, 'test operation');
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
    });

    it('should identify retryable errors correctly', () => {
      const retryableErrors = ['UNAVAILABLE', 'DEADLINE_EXCEEDED', 'connection'];
      
      expect(isRetryableError({ message: 'UNAVAILABLE: Service down' }, retryableErrors)).toBe(true);
      expect(isRetryableError({ code: 'DEADLINE_EXCEEDED' }, retryableErrors)).toBe(true);
      expect(isRetryableError({ message: 'connection timeout' }, retryableErrors)).toBe(true);
      expect(isRetryableError({ message: 'PERMISSION_DENIED' }, retryableErrors)).toBe(false);
    });
  });

  describe('Client-Side Sorting', () => {
    const testDocuments = [
      { id: '1', createdAt: new Date('2023-01-01'), title: 'First', value: 100 },
      { id: '2', createdAt: new Date('2023-01-03'), title: 'Third', value: 300 },
      { id: '3', createdAt: new Date('2023-01-02'), title: 'Second', value: 200 }
    ];

    it('should sort by date descending', () => {
      const sorted = ClientSorter.sortByField(testDocuments, 'createdAt', 'desc');
      
      expect(sorted[0].id).toBe('2'); // 2023-01-03
      expect(sorted[1].id).toBe('3'); // 2023-01-02
      expect(sorted[2].id).toBe('1'); // 2023-01-01
    });

    it('should sort by date ascending', () => {
      const sorted = ClientSorter.sortByField(testDocuments, 'createdAt', 'asc');
      
      expect(sorted[0].id).toBe('1'); // 2023-01-01
      expect(sorted[1].id).toBe('3'); // 2023-01-02
      expect(sorted[2].id).toBe('2'); // 2023-01-03
    });

    it('should sort by string field', () => {
      const sorted = ClientSorter.sortByField(testDocuments, 'title', 'asc');
      
      expect(sorted[0].title).toBe('First');
      expect(sorted[1].title).toBe('Second');
      expect(sorted[2].title).toBe('Third');
    });

    it('should sort by numeric field', () => {
      const sorted = ClientSorter.sortByField(testDocuments, 'value', 'desc');
      
      expect(sorted[0].value).toBe(300);
      expect(sorted[1].value).toBe(200);
      expect(sorted[2].value).toBe(100);
    });

    it('should apply limit correctly', () => {
      const limited = ClientSorter.applyLimit(testDocuments, 2);
      expect(limited.length).toBe(2);
    });

    it('should filter by field correctly', () => {
      const filtered = ClientSorter.filterByField(testDocuments, 'value', 200);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('3');
    });
  });

  describe('Fallback Detection', () => {
    it('should detect index errors requiring fallback', () => {
      const indexError = new Error('The query requires an index');
      expect(shouldUseFallback(indexError)).toBe(true);

      const compositeError = new Error('composite index required');
      expect(shouldUseFallback(compositeError)).toBe(true);

      const permissionError = new Error('PERMISSION_DENIED');
      expect(shouldUseFallback(permissionError)).toBe(false);
    });
  });

  describe('Firestore Error Detection', () => {
    it('should classify index errors correctly', () => {
      const indexError = new Error('The query requires an index');
      const result = detectFirestoreError(indexError);
      
      expect(result.code).toBe('INDEX_MISSING');
      expect(result.isRetryable).toBe(false);
    });

    it('should classify permission errors correctly', () => {
      const permissionError = new Error('PERMISSION_DENIED: Access denied');
      const result = detectFirestoreError(permissionError);
      
      expect(result.code).toBe('PERMISSION_DENIED');
      expect(result.isRetryable).toBe(false);
    });

    it('should classify quota errors correctly', () => {
      const quotaError = new Error('quota exceeded');
      const result = detectFirestoreError(quotaError);
      
      expect(result.code).toBe('QUOTA_EXCEEDED');
      expect(result.isRetryable).toBe(true);
    });

    it('should classify connection errors correctly', () => {
      const connectionError = new Error('connection failed');
      const result = detectFirestoreError(connectionError);
      
      expect(result.code).toBe('DATABASE_CONNECTION_ERROR');
      expect(result.isRetryable).toBe(true);
    });
  });
});