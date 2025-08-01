import { AuthProvider } from '@/contexts/AuthContext'
import { ApplicationLayout } from '../application-layout'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ApplicationLayout>
        {children}
      </ApplicationLayout>
    </AuthProvider>
  )
}