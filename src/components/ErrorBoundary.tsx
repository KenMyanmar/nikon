import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional label to identify which boundary caught the error in logs */
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Structured log so a blank-page report can be diagnosed from DevTools
    console.error(
      `[ErrorBoundary${this.props.label ? `:${this.props.label}` : ""}] Page crash:`,
      {
        message: error?.message,
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
      }
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-card shadow-card p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              We hit an unexpected error rendering this page. Please try again — if it keeps happening, refresh the page.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-button bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
              >
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-button border border-border text-sm font-semibold hover:bg-muted transition"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
