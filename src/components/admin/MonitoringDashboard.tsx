'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  RefreshCw,
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';

interface PerformanceStats {
  activeOperations: number;
  averageResponseTime: number;
  errorRate: number;
  slowOperations: number;
  recentErrors: any[];
}

interface DatabaseLog {
  timestamp: string;
  level: string;
  operation: string;
  collection: string;
  success: boolean;
  duration: number;
  resultCount?: number;
  errorType?: string;
  errorMessage?: string;
  context: {
    requestId?: string;
    userId?: string;
    operation?: string;
  };
}

interface ErrorAlert {
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  errorType: string;
  errorMessage: string;
  frequency: number;
  firstOccurrence: string;
  lastOccurrence: string;
  affectedOperations: string[];
  suggestedActions: string[];
}

interface MonitoringData {
  performance?: PerformanceStats;
  logs?: DatabaseLog[];
  alerts?: ErrorAlert[];
  health?: {
    healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    healthScore: number;
    healthChecks: Record<string, any>;
  };
}

export function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMonitoringData = async (endpoint: string = 'stats') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/monitoring?endpoint=${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch monitoring data: ${response.statusText}`);
      }

      const result = await response.json();
      
      setData(prev => ({
        ...prev,
        [endpoint]: endpoint === 'stats' ? result.performance : result
      }));
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
      console.error('Monitoring data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchMonitoringData('stats'),
      fetchMonitoringData('logs'),
      fetchMonitoringData('alerts'),
      fetchMonitoringData('health')
    ]);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAllData();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600';
      case 'WARNING': return 'text-yellow-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-blue-100 text-blue-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Database operations, performance metrics, and system health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Health Overview */}
      {data.health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className={`text-2xl font-bold ${getHealthStatusColor(data.health.healthStatus)}`}>
                {data.health.healthStatus}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Health Score</span>
                  <span className="text-sm text-muted-foreground">
                    {data.health.healthScore}/100
                  </span>
                </div>
                <Progress value={data.health.healthScore} className="h-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.health.healthChecks || {}).map(([key, check]) => (
                <div key={key} className="text-center">
                  <div className={`inline-flex items-center gap-1 text-sm font-medium ${
                    check.status === 'PASS' ? 'text-green-600' : 
                    check.status === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {check.status === 'PASS' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : check.status === 'WARNING' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {check.message}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Stats */}
      {data.performance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Operations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.performance.activeOperations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(data.performance.averageResponseTime)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.performance.errorRate.toFixed(2)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Slow Operations</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.performance.slowOperations}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Operation Logs</CardTitle>
              <CardDescription>
                Recent database operations with performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.logs && data.logs.logs ? (
                <div className="space-y-2">
                  {data.logs.logs.slice(0, 20).map((log: DatabaseLog, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.operation}
                        </Badge>
                        <div>
                          <div className="font-medium">{log.collection}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatDuration(log.duration)}</div>
                        {log.resultCount !== undefined && (
                          <div className="text-sm text-muted-foreground">
                            {log.resultCount} results
                          </div>
                        )}
                        {log.errorMessage && (
                          <div className="text-sm text-red-600 max-w-xs truncate">
                            {log.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No logs available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                System alerts and recommended actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.alerts && data.alerts.alerts && data.alerts.alerts.length > 0 ? (
                <div className="space-y-4">
                  {data.alerts.alerts.map((alert: ErrorAlert, index: number) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {alert.errorType}
                        <span className="text-sm font-normal">
                          (occurred {alert.frequency} times)
                        </span>
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        <div className="mb-2">{alert.errorMessage}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          First: {formatTimestamp(alert.firstOccurrence)} | 
                          Last: {formatTimestamp(alert.lastOccurrence)}
                        </div>
                        {alert.suggestedActions.length > 0 && (
                          <div>
                            <div className="font-medium mb-1">Suggested Actions:</div>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {alert.suggestedActions.map((action, actionIndex) => (
                                <li key={actionIndex}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active alerts
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}