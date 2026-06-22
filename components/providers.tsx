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
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgb(var(--color-background) / 1)',
              color: 'rgb(var(--color-foreground) / 1)',
              border: '1px solid rgb(var(--color-border) / 1)',
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  )
}
