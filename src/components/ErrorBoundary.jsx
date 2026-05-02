import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking (Sentry, etc.)
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Send to monitoring service
    if (window.Sentry) {
      window.Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground text-sm">
                We've logged this error and our team has been notified. 
                {this.state.errorCount > 2 && (
                  <span> Please try again or contact support if the problem persists.</span>
                )}
              </p>
            </div>

            {typeof process !== 'undefined' && typeof process.env !== 'undefined' && process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-muted p-3 rounded-lg text-left max-h-32 overflow-y-auto">
                <p className="text-xs font-mono text-destructive whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={this.handleReset}
                className="flex-1 gap-2"
                variant="default"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button 
                onClick={this.handleHome}
                className="flex-1 gap-2"
                variant="outline"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Error ID: {this.state.errorCount > 0 && `ERR-${Date.now()}`}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;