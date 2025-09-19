/**
 * Error Boundary Component for Real Data Integration
 * 
 * Provides graceful error handling and fallback UI for data loading failures
 */

"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logger } from '@/lib/adapters/real';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Logger.error('ErrorBoundary caught an error', error, { component: 'ErrorBoundary' });
    
    this.setState({
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      Logger.warn(`Max retries (${maxRetries}) reached for ErrorBoundary`);
      return;
    }

    Logger.info(`Retrying... attempt ${retryCount + 1}/${maxRetries}`);
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleAutoRetry = () => {
    // Auto-retry after 3 seconds for the first error
    if (this.state.retryCount === 0) {
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, 3000);
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback: CustomFallback, maxRetries = 3 } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (CustomFallback) {
        return <CustomFallback error={error} retry={this.handleRetry} />;
      }

      // Auto-retry for first error
      if (retryCount === 0) {
        this.handleAutoRetry();
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={error}
          retryCount={retryCount}
          maxRetries={maxRetries}
          onRetry={this.handleRetry}
        />
      );
    }

    return children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
}

function DefaultErrorFallback({ error, retryCount, maxRetries, onRetry }: DefaultErrorFallbackProps) {
  const [autoRetrying, setAutoRetrying] = React.useState(retryCount === 0);

  React.useEffect(() => {
    if (retryCount === 0) {
      const timer = setTimeout(() => {
        setAutoRetrying(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [retryCount]);

  const canRetry = retryCount < maxRetries;
  const isDataError = error.name === 'DataFetchError' || error.name === 'DataTransformError';

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          {isDataError ? 'Data Loading Error' : 'Something went wrong'}
        </h2>
        
        <p className="mt-4 text-gray-600">
          {isDataError 
            ? 'We encountered an issue loading the latest data. This might be temporary.'
            : 'An unexpected error occurred. We\'re working to fix this.'}
        </p>

        {error.message && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-left">
            <h3 className="text-sm font-medium text-gray-900">Error Details:</h3>
            <p className="mt-1 text-sm text-gray-700 font-mono">{error.message}</p>
          </div>
        )}

        {retryCount > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Retry attempt: {retryCount}/{maxRetries}
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {canRetry && (
            <button
              onClick={onRetry}
              disabled={autoRetrying}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-orange)] px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${autoRetrying ? 'animate-spin' : ''}`} />
              {autoRetrying ? 'Auto-retrying...' : 'Try Again'}
            </button>
          )}
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>

        {isDataError && (
          <div className="mt-8 text-left rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-sm font-medium text-blue-900">Troubleshooting Tips:</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Check your internet connection</li>
              <li>• The data provider API might be temporarily unavailable</li>
              <li>• Try refreshing the page in a few minutes</li>
              <li>• Demo data is available as a fallback</li>
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Hook for wrapping async operations with error boundary compatible error handling
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    Logger.error('useErrorHandler caught error', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const wrapAsync = React.useCallback(async <T,>(
    operation: () => Promise<T>,
    fallback?: T
  ): Promise<T> => {
    try {
      clearError();
      return await operation();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      handleError(error);
      
      if (fallback !== undefined) {
        return fallback;
      }
      
      throw error;
    }
  }, [handleError, clearError]);

  // Throw error to trigger error boundary (but only after component is mounted)
  React.useEffect(() => {
    if (error) {
      // Use setTimeout to ensure this happens after the component is fully mounted
      setTimeout(() => {
        throw error;
      }, 0);
    }
  }, [error]);

  return {
    wrapAsync,
    handleError,
    clearError,
    hasError: !!error
  };
}

export default ErrorBoundary;