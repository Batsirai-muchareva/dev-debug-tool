/**
 * ErrorBoundary - Graceful error handling for React components
 * 
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole
 * debug panel.
 * 
 * @example
 * ```tsx
 * import { ErrorBoundary } from '@app/errors/error-boundary';
 * 
 * // In Panel.tsx
 * export const Panel = () => {
 *   return (
 *     <ErrorBoundary
 *       fallback={<ErrorFallback />}
 *       onError={(error) => console.error('[DevDebug]', error)}
 *     >
 *       <TabsProvider>
 *         <FilterProvider>
 *           <MainPopover />
 *           <SuggestionsPopover />
 *         </FilterProvider>
 *       </TabsProvider>
 *     </ErrorBoundary>
 *   );
 * };
 * ```
 */

import * as React from 'react';
import { Component, ErrorInfo, ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Custom fallback UI to show when an error occurs
   * If not provided, a default error message is shown
   */
  fallback?: ReactNode;

  /**
   * Callback when an error is caught
   * Use this for error reporting/logging
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Custom reset handler
   * Called when user clicks "Try Again"
   */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// =============================================================================
// Default Fallback Component
// =============================================================================

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

/**
 * Default error fallback UI
 * Shows a user-friendly error message with a retry button
 */
const DefaultErrorFallback = ({ error, onReset }: ErrorFallbackProps) => {
  const styles: Record<string, React.CSSProperties> = {
    container: {
      padding: '20px',
      backgroundColor: 'rgba(255, 0, 0, 0.05)',
      border: '1px solid rgba(255, 0, 0, 0.2)',
      borderRadius: '8px',
      margin: '10px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    title: {
      color: '#dc3545',
      margin: '0 0 10px 0',
      fontSize: '16px',
      fontWeight: 600,
    },
    message: {
      color: '#666',
      margin: '0 0 15px 0',
      fontSize: '14px',
    },
    errorDetails: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#333',
      marginBottom: '15px',
      maxHeight: '100px',
      overflow: 'auto',
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>⚠️ Something went wrong</h3>
      <p style={styles.message}>
        The debug panel encountered an error. Your work in the editor is safe.
      </p>
      
      {error && (
        <pre style={styles.errorDetails}>
          {error.message}
        </pre>
      )}
      
      <button 
        style={styles.button}
        onClick={onReset}
        onMouseOver={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3';
        }}
        onMouseOut={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#007bff';
        }}
      >
        Try Again
      </button>
    </div>
  );
};

// =============================================================================
// ErrorBoundary Component
// =============================================================================

/**
 * Error boundary component that catches errors in its child tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when an error is thrown
   * This is called during the "render" phase
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log the error and call the onError callback
   * This is called during the "commit" phase
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console
    console.error('[DevDebugTool] Error caught by boundary:', error);
    console.error('[DevDebugTool] Component stack:', errorInfo.componentStack);

    // Update state with error info
    this.setState({ errorInfo });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Reset the error state
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Render custom fallback or default
      if (fallback) {
        return fallback;
      }

      return (
        <DefaultErrorFallback 
          error={error} 
          onReset={this.handleReset} 
        />
      );
    }

    return children;
  }
}

// =============================================================================
// Hook for Functional Components
// =============================================================================

/**
 * Hook to manually trigger error boundary
 * Useful for catching errors in async operations
 * 
 * @example
 * ```tsx
 * const { showBoundary } = useErrorBoundary();
 * 
 * const fetchData = async () => {
 *   try {
 *     await riskyOperation();
 *   } catch (error) {
 *     showBoundary(error);
 *   }
 * };
 * ```
 */
export function useErrorHandler() {
  const [, setError] = React.useState<Error | null>(null);

  const showBoundary = React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);

  return { showBoundary };
}

// =============================================================================
// Higher-Order Component
// =============================================================================

/**
 * HOC to wrap a component with an error boundary
 * 
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(RiskyComponent, {
 *   fallback: <div>Error loading component</div>,
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

