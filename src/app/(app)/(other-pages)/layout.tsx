import ModernHeader from '@/components/Header/ModernHeader'
import { Metadata } from 'next'
import { ApplicationLayout } from '../application-layout'

export const metadata: Metadata = {
  title: 'Masterclass ONM',
  description:
    'Formations d\'excellence en orthodontie neuro-musculaire avec les meilleurs experts. Développez votre expertise en ONM avec nos formations présentielles.',
  keywords: ['Masterclass ONM', 'orthodontie neuro-musculaire', 'formation orthodontiste', 'CEPROF', 'ONM'],
}

export default function Layout({ children, params }: { children: React.ReactNode; params: any }) {
  return <ApplicationLayout header={<ModernHeader />}>{children}</ApplicationLayout>
}
