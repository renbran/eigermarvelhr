import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader, RefreshCw, Database, Server, Lock } from 'lucide-react';
import syncManager from '@/lib/sync-manager';
import odooService from '@/lib/odoo-service';

export function OdooConnectionDashboard() {
  const [status, setStatus] = useState({
    connected: false,
    syncing: false,
    lastSync: null as string | null,
    itemsSynced: 0,
    successCount: 0,
    failureCount: 0,
    lastError: null as string | null,
  });

  const [serverInfo, setServerInfo] = useState({
    url: 'https://eigermarvelhr.com',
    database: 'eigermarvel',
    ip: '65.20.72.53',
    version: 'v18',
  });

  const [syncDetails, setSyncDetails] = useState({
    jobs: 0,
    applicants: 0,
    departments: 0,
    employees: 0,
    company: null as { name?: string } | null,
  });

  useEffect(() => {
    const updateStatus = () => {
      const syncStatus = syncManager.getSyncStatus();
      setStatus({
        connected: odooService.isConnected(),
        syncing: syncStatus.isActive,
        lastSync: syncStatus.lastSyncTime,
        itemsSynced: syncStatus.itemsSynced,
        successCount: syncStatus.successCount,
        failureCount: syncStatus.failureCount,
        lastError: syncStatus.lastError,
      });
    };

    const listener = () => updateStatus();
    syncManager.addEventListener(listener);
    updateStatus();

    return () => {
      syncManager.removeEventListener(listener);
    };
  }, []);

  const handleTestConnection = async () => {
    try {
      const connected = await odooService.initConnection();
      if (connected) {
        alert('✅ Connection successful!');
      }
    } catch (error) {
      alert('❌ Connection failed: ' + String(error));
    }
  };

  const handleSync = async () => {
    try {
      await syncManager.performFullSync();
      alert('✅ Sync completed!');
    } catch (error) {
      alert('❌ Sync failed: ' + String(error));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Odoo Connection Dashboard</h1>
          <p className="text-slate-400">Eiger Marvel HR Platform - eigermarvelhr.com</p>
        </div>

        {/* Connection Status Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {status.connected ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-semibold">Disconnected</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleTestConnection}
                disabled={status.syncing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Lock className="w-4 h-4 mr-2" />
                Test Connection
              </button>
              <button
                onClick={handleSync}
                disabled={status.syncing}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {status.syncing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Server Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center text-slate-400 mb-2">
                <Server className="w-4 h-4 mr-2" />
                <span className="text-sm">Server</span>
              </div>
              <p className="text-white font-mono text-sm">{serverInfo.url}</p>
              <p className="text-slate-500 text-xs mt-1">{serverInfo.ip}</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center text-slate-400 mb-2">
                <Database className="w-4 h-4 mr-2" />
                <span className="text-sm">Database</span>
              </div>
              <p className="text-white font-mono text-sm">{serverInfo.database}</p>
              <p className="text-slate-500 text-xs mt-1">Odoo {serverInfo.version}</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Last Sync</p>
              <p className="text-white font-mono text-sm">
                {status.lastSync ? new Date(status.lastSync).toLocaleTimeString() : 'Never'}
              </p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Items Synced</p>
              <p className="text-white text-2xl font-bold">{status.itemsSynced}</p>
            </div>
          </div>

          {/* Error Message */}
          {status.lastError && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-semibold">Last Error</p>
                <p className="text-red-300 text-sm mt-1">{status.lastError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Successful Syncs</p>
                <p className="text-2xl font-bold text-green-400 mt-2">{status.successCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-400 opacity-20" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Failed Syncs</p>
                <p className="text-2xl font-bold text-red-400 mt-2">{status.failureCount}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-400 opacity-20" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Sync Status</p>
                <p className="text-2xl font-bold text-blue-400 mt-2">
                  {status.syncing ? 'In Progress' : 'Idle'}
                </p>
              </div>
              {status.syncing ? (
                <Loader className="w-10 h-10 text-blue-400 opacity-20 animate-spin" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-blue-400 opacity-20" />
              )}
            </div>
          </div>
        </div>

        {/* Sync Details */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Synced Records</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Jobs</p>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-xs text-slate-500 mt-1">from hr.job</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Applicants</p>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-xs text-slate-500 mt-1">from hr.applicant</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Departments</p>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-xs text-slate-500 mt-1">from hr.department</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Employees</p>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-xs text-slate-500 mt-1">from hr.employee</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Company</p>
              <p className="text-2xl font-bold text-white">1</p>
              <p className="text-xs text-slate-500 mt-1">from res.company</p>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">🔗 Connection Info</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Domain: eigermarvelhr.com</li>
              <li>• IP: 65.20.72.53</li>
              <li>• Database: eigermarvel</li>
              <li>• Odoo Version: v18</li>
            </ul>
          </div>
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">✅ Auto-Sync Enabled</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Sync Interval: Every 5 minutes</li>
              <li>• Conflict Resolution: Odoo wins</li>
              <li>• Retry on Failure: Enabled</li>
              <li>• Max Retries: 3 attempts</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-xs">
          <p>Eiger Marvel HR Platform - Odoo Integration v1.0</p>
          <p className="mt-1">Last Updated: January 17, 2026</p>
        </div>
      </div>
    </div>
  );
}

export default OdooConnectionDashboard;
