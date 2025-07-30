'use client'

import { Toaster } from 'react-hot-toast'
import SupabaseProvider from '@/contexts/SupabaseProvider'
import { CartProvider } from '@/contexts/CartContext'
import ThemeProvider from './theme-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <CartProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </CartProvider>
      </SupabaseProvider>
    </ThemeProvider>
  )
}