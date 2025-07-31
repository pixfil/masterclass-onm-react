import ModernHeader from '@/components/Header/ModernHeader'
import { ApplicationLayout } from '../application-layout'

export default function Layout({ children, params }: { children: React.ReactNode; params: any }) {
  return <ApplicationLayout header={<ModernHeader />}>{children}</ApplicationLayout>
}
