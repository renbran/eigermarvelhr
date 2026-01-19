import React, { useState, useEffect } from 'react';
import syncManager from '@/lib/sync-manager';
import { AlertCircle, CheckCircle2, Loader, RefreshCw } from 'lucide-react';

interface SyncEvent {
  type: 'init' | 'progress' | 'complete' | 'error';
  message: string;
  progress?: number;
}

export function OdooSyncStatus() {
  const [syncStatus, setSyncStatus] = useState({
    isActive: false,
    lastSyncTime: null as string | null,
    lastError: null as string | null,
    itemsSynced: 0,
    successCount: 0,
    failureCount: 0,
  });

  const [currentEvent, setCurrentEvent] = useState<SyncEvent | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize sync manager on mount
  useEffect(() => {
    const initializeSync = async () => {
      try {
        setIsInitializing(true);
        await syncManager.initialize();
        setIsInitialized(true);
        updateStatus();
      } catch (error) {
        console.error('Failed to initialize sync manager:', error);
        setIsInitialized(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSync();

    // Set up event listener
    const handleSyncEvent = (event: SyncEvent) => {
      setCurrentEvent(event);
      updateStatus();
    };

    syncManager.addEventListener(handleSyncEvent);

    return () => {
      syncManager.removeEventListener(handleSyncEvent);
    };
  }, []);

  const updateStatus = () => {
    const status = syncManager.getSyncStatus();
    setSyncStatus(status);
  };

  const handleManualSync = async () => {
    try {
      await syncManager.performFullSync();
      updateStatus();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Loader className="w-5 h-5 mr-3 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-blue-700">Initializing Odoo sync...</span>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-700">Connection Failed</p>
            <p className="text-xs text-red-600 mt-1">{syncStatus.lastError || 'Unable to connect to Odoo'}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {syncStatus.isActive ? (
            <Loader className="w-5 h-5 mr-3 animate-spin text-blue-600" />
          ) : syncStatus.lastError ? (
            <AlertCircle className="w-5 h-5 mr-3 text-red-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mr-3 text-green-600" />
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Odoo Sync Status</h3>
            <p className="text-xs text-gray-500 mt-1">
              {syncStatus.isActive
                ? 'Syncing...'
                : syncStatus.lastError
                  ? `Error: ${syncStatus.lastError}`
                  : `Last sync: ${syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleTimeString() : 'Never'}`}
            </p>
          </div>
        </div>
        <button
          onClick={handleManualSync}
          disabled={syncStatus.isActive}
          className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Sync Now
        </button>
      </div>

      {/* Progress Event */}
      {currentEvent && (
        <div
          className={`p-3 rounded-md text-sm ${
            currentEvent.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : currentEvent.type === 'complete'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <p className="font-medium">{currentEvent.message}</p>
          {currentEvent.progress !== undefined && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentEvent.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600 font-medium">Items Synced</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{syncStatus.itemsSynced}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-md">
          <p className="text-xs text-green-600 font-medium">Successes</p>
          <p className="text-lg font-bold text-green-900 mt-1">{syncStatus.successCount}</p>
        </div>
        <div className="p-3 bg-red-50 rounded-md">
          <p className="text-xs text-red-600 font-medium">Failures</p>
          <p className="text-lg font-bold text-red-900 mt-1">{syncStatus.failureCount}</p>
        </div>
      </div>

      {/* Sync Logs */}
      <div className="text-xs">
        <p className="font-medium text-gray-700 mb-2">Recent Logs:</p>
        <div className="max-h-40 overflow-y-auto space-y-1 bg-gray-50 p-2 rounded border border-gray-200">
          {syncManager.getSyncLogs().slice(-5).map((log, idx) => (
            <div key={idx} className="text-gray-600 font-mono text-xs flex justify-between">
              <span>
                [{log.status.toUpperCase()}] {log.modelName}:{log.odooId} - {log.action}
              </span>
              <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OdooSyncStatus;
