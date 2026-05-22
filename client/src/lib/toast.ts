type ToastVariant = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

type Listener = (toasts: ToastMessage[]) => void

let toasts: ToastMessage[] = []
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((fn) => fn([...toasts]))
}

function push(title: string, variant: ToastVariant, description?: string) {
  const id = crypto.randomUUID()
  toasts = [{ id, title, description, variant }, ...toasts].slice(0, 4)
  notify()
  setTimeout(() => dismiss(id), 4000)
}

export function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

export const toast = {
  success: (title: string, description?: string) => push(title, 'success', description),
  error: (title: string, description?: string) => push(title, 'error', description),
  info: (title: string, description?: string) => push(title, 'info', description),
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  listener([...toasts])
  return () => {
    listeners.delete(listener)
  }
}
