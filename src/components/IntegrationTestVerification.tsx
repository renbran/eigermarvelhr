/**
 * Integration Test Verification Component
 * Visual interface to run and monitor integration tests
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import integrationTests from '@/lib/odoo-integration-tests';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration: number;
  timestamp: string;
}

export function IntegrationTestVerification() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const testResults = await integrationTests.runAllTests();
      setResults(testResults);
      setSummary(integrationTests.getSummary());
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    const data = integrationTests.exportResults();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-tests-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integration Test Suite</h1>
        <p className="text-gray-600 mt-2">Comprehensive verification of Odoo MCP integration</p>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runTests} disabled={isRunning} size="lg">
              {isRunning ? '⏳ Running Tests...' : '▶️ Run All Tests'}
            </Button>
            {results.length > 0 && (
              <Button variant="outline" onClick={exportResults}>
                📥 Export Results
              </Button>
            )}
          </div>
          {summary && (
            <div className="grid grid-cols-4 gap-4">
              <SummaryCard label="Total" value={summary.total.toString()} />
              <SummaryCard label="Passed" value={summary.passed.toString()} color="green" />
              <SummaryCard label="Failed" value={summary.failed.toString()} color="red" />
              <SummaryCard label="Success Rate" value={summary.successRate} color="blue" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {results.length} tests completed in {results.reduce((sum, r) => sum + r.duration, 0)}ms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <TestResultItem key={index} result={result} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Details Tab */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Tests</TabsTrigger>
                <TabsTrigger value="passed">Passed ({results.filter(r => r.status === 'passed').length})</TabsTrigger>
                <TabsTrigger value="failed">Failed ({results.filter(r => r.status === 'failed').length})</TabsTrigger>
                <TabsTrigger value="warnings">Warnings ({results.filter(r => r.status === 'warning').length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                {results.map((result, i) => (
                  <TestDetail key={i} result={result} />
                ))}
              </TabsContent>

              <TabsContent value="passed" className="space-y-3 mt-4">
                {results.filter(r => r.status === 'passed').map((result, i) => (
                  <TestDetail key={i} result={result} />
                ))}
              </TabsContent>

              <TabsContent value="failed" className="space-y-3 mt-4">
                {results.filter(r => r.status === 'failed').map((result, i) => (
                  <TestDetail key={i} result={result} />
                ))}
              </TabsContent>

              <TabsContent value="warnings" className="space-y-3 mt-4">
                {results.filter(r => r.status === 'warning').map((result, i) => (
                  <TestDetail key={i} result={result} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  color?: 'green' | 'red' | 'blue';
}

function SummaryCard({ label, value, color = 'blue' }: SummaryCardProps) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[color]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

interface TestResultItemProps {
  result: TestResult;
}

function TestResultItem({ result }: TestResultItemProps) {
  const icon = {
    passed: '✅',
    failed: '❌',
    warning: '⚠️',
  }[result.status];

  const bgColor = {
    passed: 'bg-green-50 border-green-200',
    failed: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }[result.status];

  return (
    <div className={`p-4 rounded-lg border ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-lg">{icon}</span>
          <div>
            <p className="font-semibold text-gray-900">{result.name}</p>
            <p className="text-sm text-gray-600">{result.message}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{result.duration}ms</span>
      </div>
    </div>
  );
}

interface TestDetailProps {
  result: TestResult;
}

function TestDetail({ result }: TestDetailProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Test Name</p>
            <p className="font-semibold">{result.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge>{result.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Message</p>
            <p>{result.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p>{result.duration}ms</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Timestamp</p>
              <p className="text-xs">{new Date(result.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
