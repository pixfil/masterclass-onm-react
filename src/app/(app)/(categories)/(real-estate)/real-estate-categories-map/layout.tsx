import { ApplicationLayout } from '@/app/(app)/application-layout'
import ModernHeader from '@/components/Header/ModernHeader'
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {
  return <ApplicationLayout header={<ModernHeader />}>{children}</ApplicationLayout>
}

export default Layout
