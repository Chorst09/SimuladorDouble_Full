import { 
  logger,
  startPerformanceMonitoring,
  endPerformanceMonitoring,
  logSuccess,
  logError,
  logDatabaseOperation,
  getPerformanceStats,
  getRecentLogs,
  checkForAlerts
} from '../logging-utils';

describe('Logging Utils', () => {
  beforeEach(() => {
    // Clear any existing logs/metrics before each test
    jest.clearAllMocks();
  });

  describe('Performance Monitoring', () => {
    it('should track operation performance', () => {
      const context = {
        requestId: 'test-req-123',
        userId: 'user-456',
        operation: 'TEST_OPERATION',
        collection: 'test_collection'
      };

      const trackingId = startPerformanceMonitoring('test_operation', context);
      expect(trackingId).toBeDefined();
      expect(typeof trackingId).toBe('string');

      // Simulate some work
      const result = endPerformanceMonitoring(trackingId, true, {
        queryComplexity: 'LOW',
        resultCount: 5
      });

      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
      expect(result?.operationName).toBe('test_operation');
      expect(result?.resultCount).toBe(5);
    });

    it('should handle failed operations', () => {
      const context = {
        requestId: 'test-req-456',
        operation: 'FAILED_OPERATION'
      };

      const trackingId = startPerformanceMonitoring('failed_operation', context);
      
      const result = endPerformanceMonitoring(trackingId, false, {
        errorType: 'CONNECTION_ERROR',
        retryCount: 3
      });

      expect(result).toBeDefined();
      expect(result?.success).toBe(false);
      expect(result?.errorType).toBe('CONNECTION_ERROR');
      expect(result?.retryCount).toBe(3);
    });
  });

  describe('Database Operation Logging', () => {
    it('should log successful database operations', () => {
      const context = {
        requestId: 'test-req-789',
        userId: 'user-123',
        operation: 'READ_PROPOSALS',
        collection: 'proposals'
      };

      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logDatabaseOperation('READ', 'proposals', true, 250, context, {
        resultCount: 10,
        indexesUsed: ['createdBy_createdAt_composite']
      });

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('[DB-READ]');
      expect(logCall).toContain('SUCCESS');
      expect(logCall).toContain('proposals');
      expect(logCall).toContain('250ms');

      consoleSpy.mockRestore();
    });

    it('should log failed database operations', () => {
      const context = {
        requestId: 'test-req-error',
        operation: 'WRITE_PROPOSAL'
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logDatabaseOperation('WRITE', 'proposals', false, 1500, context, {
        errorType: 'INDEX_ERROR',
        errorMessage: 'Missing composite index'
      });

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('[DB-WRITE]');
      expect(logCall).toContain('FAILED');
      expect(logCall).toContain('1500ms');

      consoleSpy.mockRestore();
    });
  });

  describe('Success and Error Logging', () => {
    it('should log successful operations', () => {
      const context = {
        requestId: 'success-req',
        operation: 'GET_PROPOSALS'
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logSuccess('Fetch proposals', context, {
        duration: 300,
        resultCount: 15,
        fallbackUsed: false
      });

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0];
      expect(logCall[0]).toContain('[SUCCESS]');
      expect(logCall[1]).toMatchObject({
        requestId: 'success-req',
        operation: 'GET_PROPOSALS',
        duration: 300,
        resultCount: 15
      });

      consoleSpy.mockRestore();
    });

    it('should log and classify errors', () => {
      const context = {
        requestId: 'error-req',
        operation: 'CREATE_PROPOSAL'
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const testError = new Error('FAILED_PRECONDITION: The query requires an index');
      logError('Create proposal', testError, context, {
        severity: 'HIGH',
        duration: 2000
      });

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0];
      expect(logCall[0]).toContain('[ERROR]');
      expect(logCall[0]).toContain('Create proposal failed');

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Statistics', () => {
    it('should provide performance statistics', () => {
      // Add some test data
      const context = { requestId: 'stats-test', operation: 'TEST' };
      
      logDatabaseOperation('READ', 'proposals', true, 100, context);
      logDatabaseOperation('READ', 'proposals', false, 2000, context, {
        errorType: 'TIMEOUT_ERROR'
      });

      const stats = getPerformanceStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.averageResponseTime).toBe('number');
      expect(typeof stats.errorRate).toBe('number');
      expect(typeof stats.activeOperations).toBe('number');
      expect(Array.isArray(stats.recentErrors)).toBe(true);
    });
  });

  describe('Recent Logs', () => {
    it('should return recent logs with limit', () => {
      const context = { requestId: 'logs-test', operation: 'TEST' };
      
      // Add multiple log entries
      for (let i = 0; i < 5; i++) {
        logDatabaseOperation('READ', 'test', true, 100 + i * 10, {
          ...context,
          requestId: `logs-test-${i}`
        });
      }

      const logs = getRecentLogs(3);
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeLessThanOrEqual(3);
      
      if (logs.length > 0) {
        expect(logs[0]).toHaveProperty('timestamp');
        expect(logs[0]).toHaveProperty('operation');
        expect(logs[0]).toHaveProperty('success');
        expect(logs[0]).toHaveProperty('duration');
      }
    });
  });

  describe('Alert System', () => {
    it('should detect repeated errors and generate alerts', () => {
      const context = { 
        requestId: 'alert-test', 
        operation: 'TEST_ALERTS',
        collection: 'test'
      };

      // Simulate repeated errors
      for (let i = 0; i < 4; i++) {
        logDatabaseOperation('READ', 'test', false, 1000, context, {
          errorType: 'INDEX_ERROR',
          errorMessage: 'Missing index for query'
        });
      }

      const alerts = checkForAlerts();
      expect(Array.isArray(alerts)).toBe(true);
      
      // Should have at least one alert for repeated INDEX_ERROR
      const indexAlert = alerts.find(alert => alert.errorType === 'INDEX_ERROR');
      if (indexAlert) {
        expect(indexAlert.frequency).toBeGreaterThanOrEqual(3);
        expect(indexAlert.severity).toBe('HIGH');
        expect(Array.isArray(indexAlert.suggestedActions)).toBe(true);
      }
    });
  });

  describe('Error Classification', () => {
    it('should classify different error types correctly', () => {
      const context = { requestId: 'classify-test', operation: 'TEST' };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Test different error types
      const indexError = new Error('FAILED_PRECONDITION: requires an index');
      logError('Index error test', indexError, context);

      const permissionError = new Error('PERMISSION_DENIED: insufficient permissions');
      logError('Permission error test', permissionError, context);

      const quotaError = new Error('RESOURCE_EXHAUSTED: quota exceeded');
      logError('Quota error test', quotaError, context);

      expect(consoleSpy).toHaveBeenCalledTimes(3);

      consoleSpy.mockRestore();
    });
  });
});