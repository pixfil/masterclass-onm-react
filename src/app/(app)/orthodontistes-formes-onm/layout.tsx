import { ApplicationLayout } from '../application-layout'
import ModernHeader from '@/components/Header/ModernHeader'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ApplicationLayout header={<ModernHeader />}>{children}</ApplicationLayout>
}