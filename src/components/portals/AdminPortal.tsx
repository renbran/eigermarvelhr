/**
 * Admin/HR Portal
 * Complete HR management dashboard for administrators
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSyncStatus } from '@/hooks/useOdooSync';
import integrationTests from '@/lib/odoo-integration-tests';

export function AdminPortal() {
  const syncStatus = useSyncStatus();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showTests, setShowTests] = useState(false);

  const runIntegrationTests = async () => {
    const results = await integrationTests.runAllTests();
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-300">HR Management & System Administration</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* System Status */}
            <div className="grid gap-6 md:grid-cols-4">
              <StatCard title="Sync Status" value={syncStatus.isActive ? 'Syncing' : 'Idle'} 
                color={syncStatus.isActive ? 'blue' : 'green'} />
              <StatCard title="Items Synced" value={syncStatus.itemsSynced.toString()} color="purple" />
              <StatCard title="Connection" value={syncStatus.lastError ? 'Error' : 'Active'} 
                color={syncStatus.lastError ? 'red' : 'green'} />
              <StatCard title="Last Sync" value={syncStatus.lastSyncTime ? 
                new Date(syncStatus.lastSyncTime).toLocaleTimeString() : 'Never'} color="blue" />
            </div>

            {/* Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <ModuleCard
                title="HR Module"
                icon="👥"
                description="Jobs, Employees, Departments"
                status="connected"
              />
              <ModuleCard
                title="CRM Module"
                icon="📞"
                description="Leads, Opportunities"
                status="connected"
              />
              <ModuleCard
                title="Payroll Module"
                icon="💰"
                description="Salaries, Payslips"
                status="connected"
              />
              <ModuleCard
                title="Time Off Module"
                icon="📅"
                description="Leave, Attendance"
                status="connected"
              />
            </div>

            {/* Recent Activity */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-300">
                  <p>📊 System synced successfully</p>
                  <p>✅ 24 new job applicants this week</p>
                  <p>📈 5 new job postings created</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Job Management</CardTitle>
                <CardDescription className="text-gray-400">Create, edit, and manage job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="mb-4">+ Create New Job</Button>
                <div className="text-gray-300 space-y-4">
                  <p>📋 Senior Developer</p>
                  <p>📋 Marketing Manager</p>
                  <p>📋 Sales Executive</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Applicant Management</CardTitle>
                <CardDescription className="text-gray-400">Review and manage job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-300">
                  <p>👤 24 new applications this week</p>
                  <p>⏳ 12 pending review</p>
                  <p>✅ 8 shortlisted</p>
                  <p>❌ 4 rejected</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-4">
            <IntegrationTestPanel 
              onRunTests={runIntegrationTests}
              testResults={testResults}
              isRunning={showTests}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <div>
                  <p className="font-semibold mb-2">Odoo Instance</p>
                  <p>eigermarvelhr</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Database</p>
                  <p>eigermarvel (v18)</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Sync Interval</p>
                  <p>5 minutes</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  color: 'blue' | 'green' | 'red' | 'purple';
}

function StatCard({ title, value, color }: StatCardProps) {
  const bgColor = {
    blue: 'bg-blue-500/10 border-blue-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    red: 'bg-red-500/10 border-red-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30',
  }[color];

  const textColor = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  }[color];

  return (
    <Card className={`border ${bgColor}`}>
      <CardContent className="pt-6">
        <p className="text-sm text-gray-400 mb-2">{title}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

interface ModuleCardProps {
  title: string;
  icon: string;
  description: string;
  status: 'connected' | 'error' | 'pending';
}

function ModuleCard({ title, icon, description, status }: ModuleCardProps) {
  const statusColor = {
    connected: 'text-green-400',
    error: 'text-red-400',
    pending: 'text-yellow-400',
  }[status];

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl mb-2">{icon}</p>
            <p className="font-semibold text-white">{title}</p>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
          <Badge className={statusColor}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface IntegrationTestPanelProps {
  onRunTests: () => void;
  testResults: any[];
  isRunning: boolean;
}

function IntegrationTestPanel({ onRunTests, testResults, isRunning }: IntegrationTestPanelProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Integration Tests</CardTitle>
        <CardDescription className="text-gray-400">Verify Odoo MCP connection and data sync</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={onRunTests} disabled={isRunning} className="w-full">
          {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold text-white">Test Results:</p>
            {testResults.map((result, i) => (
              <div key={i} className={`p-3 rounded-lg ${
                result.status === 'passed' ? 'bg-green-500/10 border border-green-500/30' :
                result.status === 'failed' ? 'bg-red-500/10 border border-red-500/30' :
                'bg-yellow-500/10 border border-yellow-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-200">{result.name}</p>
                  <span className="text-xs text-gray-400">{result.duration}ms</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{result.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
