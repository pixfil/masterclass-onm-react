import { ApplicationLayout } from '@/app/(app)/application-layout'
import BgGlassmorphism from '@/components/BgGlassmorphism'
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <ApplicationLayout>
      <BgGlassmorphism />
      {children}
    </ApplicationLayout>
  )
}

export default Layout
