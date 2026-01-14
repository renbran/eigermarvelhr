/**
 * Odoo Dashboard Component
 * Displays sync status and allows manual sync triggers
 */

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSyncStatus, useOdooSync } from '@/hooks/useOdooSync';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

export function OdooDashboard() {
  const syncStatus = useSyncStatus();
  const { performSync, getStatus } = useOdooSync(true);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await performSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odoo Sync Status</CardTitle>
        <CardDescription>Real-time synchronization with eigermarvelhr database</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Sync Status</p>
            <Badge
              className={syncStatus.isActive ? 'bg-yellow-500' : 'bg-green-500'}
              variant="outline"
            >
              {syncStatus.isActive ? 'Syncing...' : 'Idle'}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">Items Synced</p>
            <p className="text-lg font-semibold">{syncStatus.itemsSynced}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">Last Sync</p>
            <p className="text-xs text-gray-500">
              {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleString() : 'Never'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">Connection</p>
            <Badge variant={syncStatus.lastError ? 'destructive' : 'default'}>
              {syncStatus.lastError ? 'Error' : 'Connected'}
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {syncStatus.lastError && (
          <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Sync Error</p>
              <p className="text-sm text-red-800">{syncStatus.lastError}</p>
            </div>
          </div>
        )}

        {/* Manual Sync Button */}
        <Button onClick={handleManualSync} disabled={isSyncing} className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>

        {/* Configuration Info */}
        <div className="space-y-2 rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-semibold">Configuration</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>
              <span className="font-medium">Instance:</span> eigermarvelhr
            </p>
            <p>
              <span className="font-medium">Database:</span> eigermarvel (Odoo v18)
            </p>
            <p>
              <span className="font-medium">Provider:</span> CloudPepper
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
