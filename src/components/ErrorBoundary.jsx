import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error);
        console.error('Component stack:', errorInfo.componentStack);
        // Log to any error tracking service here
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background text-text-primary p-8">
                    <h1>Something went wrong.</h1>
                    <pre className="mt-4 p-4 bg-surface rounded-lg overflow-auto">
                        {this.state.error?.toString()}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 