import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('rsvp_list');
      localStorage.removeItem('wishes_list');
      localStorage.removeItem('uploaded_images');
      localStorage.removeItem('liked_wishes');
      localStorage.removeItem('alumni_view_count');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white border border-[#D9D1C7] rounded-sm p-6 shadow-md text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-[#3D3A35]">
                Đang làm mới trang hội ngộ
              </h2>
              <p className="text-xs text-[#7C7464] font-serif italic">
                Hệ thống đang tải lại dữ liệu kỷ niệm để đảm bảo hiển thị mượt mà nhất.
              </p>
            </div>

            {this.state.error && (
              <p className="text-[10px] bg-red-50 text-red-700 p-2 rounded text-left font-mono overflow-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#3D3A35] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#8C7A6B] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tải lại trang</span>
              </button>
              
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-white border border-[#D9D1C7] text-[#3D3A35] text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#F7F3EE] transition-colors cursor-pointer"
              >
                <span>Khôi phục mặc định</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
