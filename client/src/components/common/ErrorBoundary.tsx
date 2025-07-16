import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-luxury-cream">
          <div className="luxury-card-selected p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-luxury-midnight-black mb-4">
                系統發生錯誤
              </h2>
              <p className="text-luxury-midnight-black/70 mb-6">
                很抱歉，系統遇到了一個問題。請重新整理頁面或聯繫技術支援。
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-luxury-gold text-white px-4 py-2 rounded-md hover:bg-luxury-gold/90 transition-colors"
                >
                  重新整理頁面
                </button>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full border border-luxury-gold text-luxury-gold px-4 py-2 rounded-md hover:bg-luxury-gold/10 transition-colors"
                >
                  重試
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-luxury-midnight-black/50 hover:text-luxury-midnight-black">
                    錯誤詳情 (開發模式)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
