/**
 * Comprehensive Error Tracking & Monitoring System
 * Real-time error capture, logging, and alerting for deployment
 */

export interface ErrorLog {
  id: string;
  timestamp: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  component: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  resolved: boolean;
}

export interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  errorCount: number;
  warningCount: number;
  responseTime: number;
  uptime: number;
}

export interface Alert {
  id: string;
  timestamp: string;
  type: 'performance' | 'error' | 'connectivity' | 'data';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  action?: string;
  resolved: boolean;
}

class ErrorTrackingSystem {
  private errors: ErrorLog[] = [];
  private alerts: Alert[] = [];
  private metrics: SystemMetrics = {
    memoryUsage: 0,
    cpuUsage: 0,
    errorCount: 0,
    warningCount: 0,
    responseTime: 0,
    uptime: 0,
  };
  private startTime = Date.now();
  private errorThresholds = {
    criticalErrorCount: 10,
    warningCount: 50,
    responseTime: 5000, // 5 seconds
  };
  private listeners: ((error: ErrorLog) => void)[] = [];

  constructor() {
    this.setupGlobalErrorHandling();
    this.startMetricsCollection();
  }

  private setupGlobalErrorHandling(): void {
    // Handle uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError({
          component: 'Global',
          message: event.message,
          stack: event.error?.stack,
          severity: 'critical',
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError({
          component: 'PromiseRejection',
          message: String(event.reason),
          severity: 'critical',
          context: { promise: event.promise },
        });
      });
    }
  }

  private startMetricsCollection(): void {
    // Collect metrics every 5 seconds
    setInterval(() => {
      this.updateMetrics();
      this.checkThresholds();
    }, 5000);
  }

  private updateMetrics(): void {
    this.metrics.uptime = (Date.now() - this.startTime) / 1000; // seconds
    this.metrics.errorCount = this.errors.filter((e) => e.severity === 'error').length;
    this.metrics.warningCount = this.errors.filter((e) => e.severity === 'warning').length;

    // Estimate memory usage (browser API)
    if ((performance as any).memory) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1048576; // MB
    }
  }

  private checkThresholds(): void {
    // Check critical error count
    if (this.metrics.errorCount > this.errorThresholds.criticalErrorCount) {
      this.raiseAlert({
        type: 'error',
        severity: 'critical',
        message: `Critical: Error count exceeded threshold (${this.metrics.errorCount}/${this.errorThresholds.criticalErrorCount})`,
        action: 'Review error logs and consider rollback',
      });
    }

    // Check warning count
    if (this.metrics.warningCount > this.errorThresholds.warningCount) {
      this.raiseAlert({
        type: 'error',
        severity: 'high',
        message: `High: Warning count elevated (${this.metrics.warningCount}/${this.errorThresholds.warningCount})`,
      });
    }
  }

  captureError(error: Omit<ErrorLog, 'id' | 'timestamp' | 'resolved'>): void {
    const errorLog: ErrorLog = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity: error.severity,
      component: error.component,
      message: error.message,
      stack: error.stack,
      context: error.context,
      resolved: false,
    };

    this.errors.push(errorLog);

    // Keep only last 1000 errors
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(errorLog));

    // Log to console
    console.error(`[${errorLog.severity.toUpperCase()}] ${errorLog.component}: ${errorLog.message}`, errorLog.context);

    // Raise alert for critical errors
    if (error.severity === 'critical') {
      this.raiseAlert({
        type: 'error',
        severity: 'critical',
        message: `${error.component}: ${error.message}`,
        action: 'Investigate immediately',
      });
    }
  }

  raiseAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): void {
    const newAlert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      action: alert.action,
      resolved: false,
    };

    this.alerts.push(newAlert);

    // Keep only last 500 alerts
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }

    console.warn(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`, alert.action);
  }

  resolveError(errorId: string): void {
    const error = this.errors.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  getErrors(severity?: string): ErrorLog[] {
    if (severity) {
      return this.errors.filter((e) => e.severity === severity);
    }
    return [...this.errors];
  }

  getAlerts(resolved?: boolean): Alert[] {
    if (resolved !== undefined) {
      return this.alerts.filter((a) => a.resolved === resolved);
    }
    return [...this.alerts];
  }

  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  getSummary() {
    return {
      totalErrors: this.errors.length,
      criticalErrors: this.errors.filter((e) => e.severity === 'critical').length,
      errorErrors: this.errors.filter((e) => e.severity === 'error').length,
      warnings: this.errors.filter((e) => e.severity === 'warning').length,
      unresolved: this.errors.filter((e) => !e.resolved).length,
      activeAlerts: this.alerts.filter((a) => !a.resolved).length,
      metrics: this.metrics,
    };
  }

  subscribe(listener: (error: ErrorLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  exportLogs(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        errors: this.errors,
        alerts: this.alerts,
        metrics: this.metrics,
        summary: this.getSummary(),
      },
      null,
      2
    );
  }

  clearErrors(): void {
    this.errors = [];
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}

// Create singleton instance
export const errorTracker = new ErrorTrackingSystem();

export default errorTracker;
