import { Component, ComponentType, ReactNode } from 'react'

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Something went wrong
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {this.state.error?.message}
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

export function withBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
): ComponentType<P> {
  function WithBoundary(props: P) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
  WithBoundary.displayName = `WithBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
  return WithBoundary
}
