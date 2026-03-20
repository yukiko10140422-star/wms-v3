import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center gap-4 p-8">
          <div className="text-4xl">😵</div>
          <h2 className="text-lg font-bold text-ink">エラーが発生しました</h2>
          <p className="text-sm text-muted text-center max-w-md">
            {this.state.error?.message || '予期しないエラーです'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-mango text-white rounded-lg font-bold hover:bg-mango-dark transition-colors cursor-pointer"
          >
            再試行
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
