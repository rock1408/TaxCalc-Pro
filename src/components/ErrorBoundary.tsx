import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in TaxCalc Pro:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950" id="error_boundary_fallback">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950/50 rounded-2xl p-8 shadow-xl text-center">
            <div className="inline-flex p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full mb-4">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              We encountered an unexpected error while performing calculations. Rest assured, your entered data is safely preserved in local storage.
            </p>
            {this.state.error && (
              <pre className="text-left text-[10px] font-mono bg-gray-50 dark:bg-slate-950 p-3 rounded-lg overflow-x-auto text-red-500 max-h-32 mb-6 border border-gray-150 dark:border-slate-850">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10"
              id="error_boundary_reset_btn"
            >
              <RefreshCw size={16} />
              Reset & Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
