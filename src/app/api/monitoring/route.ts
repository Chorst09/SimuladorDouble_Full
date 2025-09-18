import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth-utils';
import { 
  getPerformanceStats, 
  getRecentLogs, 
  checkForAlerts,
  logger,
  type DatabaseOperationLog,
  type ErrorAlert
} from '@/lib/logging-utils';

/**
 * Monitoring API endpoint for database operations and performance metrics
 * Provides insights into system health, performance, and error patterns
 */

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract user context for authorization
    const userContextResult = await getUserContext(request);
    if (!userContextResult.success || !userContextResult.user) {
      return NextResponse.json(
        { error: 'Authentication required to access monitoring data' },
        { status: 401 }
      );
    }

    // For now, allow all authenticated users to view monitoring data
    // In production, you might want to restrict this to admin users only
    const userContext = userContextResult.user;

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'stats';
    const limit = parseInt(searchParams.get('limit') || '50');

    switch (endpoint) {
      case 'stats':
        return handleStatsRequest();
      
      case 'logs':
        return handleLogsRequest(limit);
      
      case 'alerts':
        return handleAlertsRequest();
      
      case 'health':
        return handleHealthRequest();
      
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint. Available endpoints: stats, logs, alerts, health' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in monitoring API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle performance statistics request
 */
function handleStatsRequest(): NextResponse {
  try {
    const stats = getPerformanceStats();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      performance: stats,
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Error getting performance stats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance statistics' },
      { status: 500 }
    );
  }
}

/**
 * Handle recent logs request
 */
function handleLogsRequest(limit: number): NextResponse {
  try {
    const logs = getRecentLogs(Math.min(limit, 200)); // Cap at 200 logs
    
    // Group logs by operation type for better analysis
    const logsByOperation = logs.reduce((acc, log) => {
      const key = log.operation;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(log);
      return acc;
    }, {} as Record<string, DatabaseOperationLog[]>);

    // Calculate operation statistics
    const operationStats = Object.entries(logsByOperation).map(([operation, operationLogs]) => {
      const successful = operationLogs.filter(log => log.success);
      const failed = operationLogs.filter(log => !log.success);
      const totalDuration = operationLogs.reduce((sum, log) => sum + log.duration, 0);
      const avgDuration = operationLogs.length > 0 ? totalDuration / operationLogs.length : 0;

      return {
        operation,
        totalCount: operationLogs.length,
        successCount: successful.length,
        failureCount: failed.length,
        successRate: operationLogs.length > 0 ? (successful.length / operationLogs.length) * 100 : 0,
        averageDuration: Math.round(avgDuration),
        slowOperations: operationLogs.filter(log => log.duration > 1000).length
      };
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalLogs: logs.length,
      logs: logs.slice(-limit), // Return most recent logs
      operationStats,
      summary: {
        totalOperations: logs.length,
        successfulOperations: logs.filter(log => log.success).length,
        failedOperations: logs.filter(log => !log.success).length,
        averageResponseTime: logs.length > 0 
          ? Math.round(logs.reduce((sum, log) => sum + log.duration, 0) / logs.length)
          : 0
      }
    });
  } catch (error) {
    console.error('Error getting recent logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve recent logs' },
      { status: 500 }
    );
  }
}

/**
 * Handle alerts request
 */
function handleAlertsRequest(): NextResponse {
  try {
    const alerts = checkForAlerts();
    
    // Categorize alerts by severity
    const alertsBySeverity = alerts.reduce((acc, alert) => {
      if (!acc[alert.severity]) {
        acc[alert.severity] = [];
      }
      acc[alert.severity].push(alert);
      return acc;
    }, {} as Record<string, ErrorAlert[]>);

    // Calculate alert statistics
    const alertStats = {
      total: alerts.length,
      critical: alertsBySeverity.CRITICAL?.length || 0,
      high: alertsBySeverity.HIGH?.length || 0,
      medium: alertsBySeverity.MEDIUM?.length || 0,
      low: alertsBySeverity.LOW?.length || 0
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      alertStats,
      alerts,
      alertsBySeverity,
      recommendations: generateRecommendations(alerts)
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve alerts' },
      { status: 500 }
    );
  }
}

/**
 * Handle system health request
 */
function handleHealthRequest(): NextResponse {
  try {
    const stats = getPerformanceStats();
    const alerts = checkForAlerts();
    
    // Determine overall system health
    const criticalAlerts = alerts.filter(alert => alert.severity === 'CRITICAL').length;
    const highAlerts = alerts.filter(alert => alert.severity === 'HIGH').length;
    
    let healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    let healthScore: number;

    if (criticalAlerts > 0) {
      healthStatus = 'CRITICAL';
      healthScore = Math.max(0, 30 - (criticalAlerts * 10));
    } else if (highAlerts > 2 || stats.errorRate > 10) {
      healthStatus = 'WARNING';
      healthScore = Math.max(30, 70 - (highAlerts * 5) - (stats.errorRate * 2));
    } else {
      healthStatus = 'HEALTHY';
      healthScore = Math.min(100, 90 - (stats.errorRate * 2) - (stats.slowOperations * 1));
    }

    const healthChecks = {
      errorRate: {
        status: stats.errorRate < 5 ? 'PASS' : stats.errorRate < 15 ? 'WARNING' : 'FAIL',
        value: stats.errorRate,
        threshold: 5,
        message: `Error rate is ${stats.errorRate.toFixed(2)}%`
      },
      responseTime: {
        status: stats.averageResponseTime < 1000 ? 'PASS' : stats.averageResponseTime < 3000 ? 'WARNING' : 'FAIL',
        value: stats.averageResponseTime,
        threshold: 1000,
        message: `Average response time is ${stats.averageResponseTime}ms`
      },
      activeOperations: {
        status: stats.activeOperations < 10 ? 'PASS' : stats.activeOperations < 50 ? 'WARNING' : 'FAIL',
        value: stats.activeOperations,
        threshold: 10,
        message: `${stats.activeOperations} operations currently active`
      },
      criticalAlerts: {
        status: criticalAlerts === 0 ? 'PASS' : 'FAIL',
        value: criticalAlerts,
        threshold: 0,
        message: `${criticalAlerts} critical alerts active`
      }
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      healthStatus,
      healthScore,
      healthChecks,
      performance: stats,
      alertSummary: {
        total: alerts.length,
        critical: criticalAlerts,
        high: highAlerts
      },
      recommendations: generateHealthRecommendations(healthChecks, stats)
    });
  } catch (error) {
    console.error('Error getting system health:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve system health' },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendations based on alerts
 */
function generateRecommendations(alerts: ErrorAlert[]): string[] {
  const recommendations: string[] = [];
  
  const indexErrors = alerts.filter(alert => alert.errorType === 'INDEX_ERROR');
  const connectionErrors = alerts.filter(alert => alert.errorType === 'CONNECTION_ERROR');
  const quotaErrors = alerts.filter(alert => alert.errorType === 'QUOTA_ERROR');
  
  if (indexErrors.length > 0) {
    recommendations.push('Create missing Firestore composite indexes to improve query performance');
    recommendations.push('Review and optimize query patterns to reduce index requirements');
  }
  
  if (connectionErrors.length > 0) {
    recommendations.push('Investigate network connectivity issues');
    recommendations.push('Implement connection pooling and retry mechanisms');
  }
  
  if (quotaErrors.length > 0) {
    recommendations.push('Review Firebase usage quotas and consider upgrading plan');
    recommendations.push('Optimize query patterns to reduce read/write operations');
  }
  
  return recommendations;
}

/**
 * Generate health-based recommendations
 */
function generateHealthRecommendations(
  healthChecks: Record<string, any>, 
  stats: ReturnType<typeof getPerformanceStats>
): string[] {
  const recommendations: string[] = [];
  
  if (healthChecks.errorRate.status !== 'PASS') {
    recommendations.push('Investigate and resolve recurring errors to improve system reliability');
  }
  
  if (healthChecks.responseTime.status !== 'PASS') {
    recommendations.push('Optimize database queries and add appropriate indexes to improve response times');
  }
  
  if (stats.slowOperations > 5) {
    recommendations.push('Review and optimize slow database operations');
  }
  
  if (healthChecks.activeOperations.status !== 'PASS') {
    recommendations.push('Monitor for potential memory leaks or stuck operations');
  }
  
  return recommendations;
}

// Only allow GET requests
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'POST method not allowed' },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'PUT method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'DELETE method not allowed' },
    { status: 405 }
  );
}