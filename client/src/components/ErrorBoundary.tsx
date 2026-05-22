import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-belly-cream px-4 text-center">
          <h1 className="font-display text-2xl font-bold text-belly-red">Something went wrong</h1>
          <p className="max-w-md text-sm text-belly-brown/70">{this.state.error.message}</p>
          <Button
            variant="gold"
            onClick={() => {
              localStorage.removeItem('belly-cart')
              localStorage.removeItem('belly-auth')
              window.location.href = '/'
            }}
          >
            Clear data &amp; reload
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
