import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * @param children - The child components to wrap
 * @param fallback - Optional custom fallback UI to display when an error occurs
 * @param onError - Optional callback to handle errors (e.g., logging to external service)
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console or external service
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default error message
      return (
        this.props.fallback || (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <h3 className="text-red-800 font-semibold mb-2">
              Something went wrong
            </h3>
            <p className="text-red-600 text-sm">
              An error occurred while displaying this content. Please try
              refreshing the page.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-2">
                <summary className="text-red-700 cursor-pointer">
                  Error details (development only)
                </summary>
                <pre className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 *
 * @param Component - The component to wrap
 * @param fallback - Optional custom fallback UI
 * @returns Wrapped component with error boundary
 */
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
