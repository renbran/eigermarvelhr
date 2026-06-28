import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Activity, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';

interface ErrorLog {
  id: string;
  timestamp: number;
  severity: 'critical' | 'error' | 'warning' | 'info';
  component: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  resolved: boolean;
}

interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  errorCount: number;
  warningCount: number;
  responseTime: number;
  uptime: number;
}

interface Alert {
  id: string;
  timestamp: number;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  action?: string;
  resolved: boolean;
}

interface DeploymentStatus {
  phase: string;
  progress: number;
  totalErrors: number;
  criticalErrors: number;
  warnings: number;
  metrics: SystemMetrics;
  alerts: Alert[];
  errors: ErrorLog[];
  isMonitoring: boolean;
}

const DeploymentMonitor: React.FC = () => {
  const [status, setStatus] = useState<DeploymentStatus>({
    phase: 'Initializing...',
    progress: 0,
    totalErrors: 0,
    criticalErrors: 0,
    warnings: 0,
    metrics: {
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      warningCount: 0,
      responseTime: 0,
      uptime: 0,
    },
    alerts: [],
    errors: [],
    isMonitoring: true,
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'error' | 'warning'>('all');

  // Simulate real-time data updates
  useEffect(() => {
    if (!autoRefresh || !status.isMonitoring) return;

    const interval = setInterval(() => {
      setStatus((prevStatus) => {
        // Simulate metrics update
        const newStatus = { ...prevStatus };

        // Update phase based on progress
        if (newStatus.progress < 25) {
          newStatus.phase = 'Environment Validation';
        } else if (newStatus.progress < 35) {
          newStatus.phase = 'Installing Dependencies';
        } else if (newStatus.progress < 50) {
          newStatus.phase = 'Running Pre-Deployment Tests';
        } else if (newStatus.progress < 65) {
          newStatus.phase = 'Building Application';
        } else if (newStatus.progress < 75) {
          newStatus.phase = 'Running Integration Tests';
        } else if (newStatus.progress < 85) {
          newStatus.phase = 'Deploying to Environment';
        } else if (newStatus.progress < 100) {
          newStatus.phase = 'Post-Deployment Verification';
        } else {
          newStatus.phase = 'Deployment Complete';
          newStatus.isMonitoring = false;
        }

        // Increment progress
        newStatus.progress = Math.min(newStatus.progress + Math.random() * 8, 100);

        // Update metrics (simulate)
        newStatus.metrics = {
          memoryUsage: Math.random() * 100,
          cpuUsage: Math.random() * 80,
          errorCount: Math.floor(Math.random() * 5),
          warningCount: Math.floor(Math.random() * 10),
          responseTime: 100 + Math.random() * 400,
          uptime: Date.now() / 1000,
        };

        return newStatus;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh, status.isMonitoring]);

  const handleClearErrors = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      errors: [],
      totalErrors: 0,
    }));
  }, []);

  const handleExportLogs = useCallback(() => {
    const logsData = {
      timestamp: new Date().toISOString(),
      status,
      errors: status.errors,
      alerts: status.alerts,
    };

    const dataStr = JSON.stringify(logsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deployment-logs-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [status]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const filteredErrors = status.errors.filter(
    (error) => filterSeverity === 'all' || error.severity === filterSeverity
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Deployment Monitor</h1>
        <p className="text-gray-500">Real-time monitoring and error tracking</p>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Status</CardTitle>
          <CardDescription>{status.phase}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">{Math.round(status.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-sm text-red-600">Critical Errors</div>
              <div className="text-2xl font-bold text-red-700">{status.criticalErrors}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-600">Total Errors</div>
              <div className="text-2xl font-bold text-orange-700">{status.totalErrors}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600">Warnings</div>
              <div className="text-2xl font-bold text-yellow-700">{status.warnings}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-sm text-green-600">Active Alerts</div>
              <div className="text-2xl font-bold text-green-700">
                {status.alerts.filter((a) => !a.resolved).length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Memory Usage</div>
              <div className="text-lg font-semibold">{Math.round(status.metrics.memoryUsage)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    status.metrics.memoryUsage > 80
                      ? 'bg-red-500'
                      : status.metrics.memoryUsage > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${status.metrics.memoryUsage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">CPU Usage</div>
              <div className="text-lg font-semibold">{Math.round(status.metrics.cpuUsage)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    status.metrics.cpuUsage > 80
                      ? 'bg-red-500'
                      : status.metrics.cpuUsage > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${status.metrics.cpuUsage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Response Time</div>
              <div className="text-lg font-semibold">{Math.round(status.metrics.responseTime)}ms</div>
              <div className="text-xs text-gray-500 mt-2">
                {status.metrics.responseTime > 5000
                  ? '⚠️ High'
                  : status.metrics.responseTime > 2000
                    ? '⚡ Good'
                    : '✅ Excellent'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {status.alerts.filter((a) => !a.resolved).length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.alerts
                .filter((a) => !a.resolved)
                .map((alert) => (
                  <Alert key={alert.id} className={`border-${getSeverityColor(alert.severity)}`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          {alert.action && <p className="text-sm text-gray-600">{alert.action}</p>}
                        </div>
                        <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Error Logs ({filteredErrors.length})</CardTitle>
            <CardDescription>Real-time error tracking and diagnostics</CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              value={filterSeverity}
              onChange={(e) =>
                setFilterSeverity(e.target.value as 'all' | 'critical' | 'error' | 'warning')
              }
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
              className="gap-2"
            >
              📥 Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearErrors}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full border rounded-lg p-4">
            {filteredErrors.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No errors logged</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredErrors.map((error) => (
                  <div
                    key={error.id}
                    className={`p-3 rounded-lg border ${
                      error.severity === 'critical'
                        ? 'bg-red-50 border-red-200'
                        : error.severity === 'error'
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(error.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{error.component}</p>
                          <Badge
                            variant={getSeverityColor(error.severity)}
                            className="text-xs"
                          >
                            {error.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </p>
                        {error.stack && (
                          <pre className="text-xs bg-gray-800 text-gray-100 p-2 rounded mt-2 overflow-auto">
                            {error.stack}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Resume'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportLogs}
            className="gap-2"
          >
            📊 Export Full Report
          </Button>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            {status.isMonitoring ? (
              <>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live monitoring active
              </>
            ) : (
              <>
                <span className="flex h-2 w-2 rounded-full bg-gray-400" />
                Monitoring complete
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentMonitor;
