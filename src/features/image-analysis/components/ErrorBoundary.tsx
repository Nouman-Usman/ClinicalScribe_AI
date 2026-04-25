import { ReactNode, Component, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ImageAnalysisErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Image Analysis Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="h-screen flex items-center justify-center p-4">
            <Alert className="max-w-md border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-900">Analysis Error</AlertTitle>
              <AlertDescription className="text-red-800 mt-2 text-sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </AlertDescription>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={this.handleReset}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Restart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  Go Home
                </Button>
              </div>
            </Alert>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
