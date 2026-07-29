'use client'

import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { store } from '@/lib/store'

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--popover)',
              color: 'var(--popover-foreground)',
              border: '1px solid var(--border)',
              maxWidth: 'min(420px, calc(100vw - 32px))',
              overflowWrap: 'anywhere',
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  )
}
