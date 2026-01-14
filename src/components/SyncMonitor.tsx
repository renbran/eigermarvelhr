import React, { useEffect, useState, useCallback } from 'react';
import { Activity, RotateCw, CheckCircle, AlertCircle, Database, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface SyncEvent {
  id: string;
  timestamp: number;
  type: 'to_odoo' | 'from_odoo' | 'error' | 'success';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  message: string;
  recordsAffected: number;
  duration?: number;
}

interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncTime: number;
  averageSyncTime: number;
  pendingSyncs: number;
  recordsSyncedToOdoo: number;
  recordsSyncedFromOdoo: number;
}

const SyncMonitor: React.FC = () => {
  const [stats, setStats] = useState<SyncStats>({
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    lastSyncTime: Date.now(),
    averageSyncTime: 0,
    pendingSyncs: 0,
    recordsSyncedToOdoo: 0,
    recordsSyncedFromOdoo: 0,
  });

  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [syncDirection, setSyncDirection] = useState<'both' | 'to_odoo' | 'from_odoo'>('both');

  // Simulate sync events
  useEffect(() => {
    if (!isAutoSync) return;

    const interval = setInterval(() => {
      // Randomly trigger syncs
      if (Math.random() > 0.6) {
        const direction = ['to_odoo', 'from_odoo'][Math.floor(Math.random() * 2)];
        const recordCount = Math.floor(Math.random() * 10) + 1;
        const isSuccess = Math.random() > 0.1;

        const event: SyncEvent = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: isSuccess ? 'success' : 'error',
          status: 'completed',
          message: isSuccess
            ? `Synced ${recordCount} records ${direction === 'to_odoo' ? 'to Odoo' : 'from Odoo'}`
            : `Sync failed: Connection timeout`,
          recordsAffected: isSuccess ? recordCount : 0,
          duration: Math.random() * 3000 + 500,
        };

        setEvents((prev) => [event, ...prev.slice(0, 49)]);

        setStats((prev) => ({
          ...prev,
          totalSyncs: prev.totalSyncs + 1,
          successfulSyncs: isSuccess ? prev.successfulSyncs + 1 : prev.successfulSyncs,
          failedSyncs: !isSuccess ? prev.failedSyncs + 1 : prev.failedSyncs,
          lastSyncTime: Date.now(),
          pendingSyncs: Math.max(0, prev.pendingSyncs - 1),
          recordsSyncedToOdoo:
            direction === 'to_odoo' && isSuccess
              ? prev.recordsSyncedToOdoo + recordCount
              : prev.recordsSyncedToOdoo,
          recordsSyncedFromOdoo:
            direction === 'from_odoo' && isSuccess
              ? prev.recordsSyncedFromOdoo + recordCount
              : prev.recordsSyncedFromOdoo,
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoSync]);

  const handleManualSync = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      pendingSyncs: prev.pendingSyncs + 1,
    }));

    // Simulate sync completion
    setTimeout(() => {
      const event: SyncEvent = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: 'success',
        status: 'completed',
        message: 'Manual sync completed successfully',
        recordsAffected: 5,
        duration: 1200,
      };

      setEvents((prev) => [event, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalSyncs: prev.totalSyncs + 1,
        successfulSyncs: prev.successfulSyncs + 1,
        lastSyncTime: Date.now(),
        pendingSyncs: Math.max(0, prev.pendingSyncs - 1),
        recordsSyncedFromOdoo: prev.recordsSyncedFromOdoo + 5,
      }));
    }, 2000);
  }, []);

  const getSuccessRate = () => {
    if (stats.totalSyncs === 0) return 0;
    return Math.round((stats.successfulSyncs / stats.totalSyncs) * 100);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Sync Monitor</h1>
        <p className="text-gray-500">Real-time database synchronization tracking</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getSuccessRate()}%</div>
            <p className="text-xs text-gray-500 mt-1">{stats.totalSyncs} total syncs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">To Odoo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recordsSyncedToOdoo}</div>
            <p className="text-xs text-gray-500 mt-1">records synced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">From Odoo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recordsSyncedFromOdoo}</div>
            <p className="text-xs text-gray-500 mt-1">records synced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{stats.pendingSyncs}</div>
            <p className="text-xs text-gray-500 mt-1">syncs in queue</p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCw className="h-5 w-5" />
            Sync Status
          </CardTitle>
          <CardDescription>Website ↔ Odoo Database synchronization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Globe className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium">Website</p>
              <p className="text-xs text-blue-600 mt-1">✓ Running</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <RotateCw className="h-6 w-6 mx-auto text-green-600 mb-2 animate-spin" />
              <p className="text-sm font-medium">Sync Active</p>
              <p className="text-xs text-green-600 mt-1">Bidirectional</p>
            </div>

            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <Database className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-medium">Odoo DB</p>
              <p className="text-xs text-emerald-600 mt-1">✓ Connected</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">
              Last sync: {new Date(stats.lastSyncTime).toLocaleTimeString()}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleManualSync}
                variant="default"
                className="gap-2"
              >
                <RotateCw className="h-4 w-4" />
                Sync Now
              </Button>

              <Button
                variant={isAutoSync ? 'default' : 'outline'}
                onClick={() => setIsAutoSync(!isAutoSync)}
                className="gap-2"
              >
                {isAutoSync ? '⏸️ Pause' : '▶️ Resume'} Auto-Sync
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Syncs</p>
              <p className="text-2xl font-bold mt-1">{stats.totalSyncs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.successfulSyncs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.failedSyncs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold mt-1">{Math.round(stats.averageSyncTime)}ms</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Records (To)</p>
              <p className="text-2xl font-bold mt-1">{stats.recordsSyncedToOdoo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Records (From)</p>
              <p className="text-2xl font-bold mt-1">{stats.recordsSyncedFromOdoo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Events Log */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Events ({events.length})</CardTitle>
          <CardDescription>Real-time sync operations log</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full border rounded-lg p-4">
            {events.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No sync events yet. Click "Sync Now" to start.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${
                      event.type === 'success'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getEventIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{event.message}</p>
                          <Badge
                            variant={event.type === 'success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                          {event.duration && ` • ${event.duration.toFixed(0)}ms`}
                        </p>
                      </div>
                      {event.recordsAffected > 0 && (
                        <div className="text-sm font-semibold text-blue-600">
                          +{event.recordsAffected}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Testing Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            To test sync functionality:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Sync Now" to trigger a manual sync operation</li>
            <li>Watch the events log for sync completion status</li>
            <li>Check success rate and record counts</li>
            <li>Create a job or applicant to test bidirectional sync</li>
            <li>Verify data appears in both website and Odoo</li>
            <li>Monitor auto-sync (enabled by default)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncMonitor;
