import { Metadata } from 'next'
import { ApplicationLayout } from '../application-layout'
import ModernHeader from '@/components/Header/ModernHeader'

export const metadata: Metadata = {
  title: 'Masterclass ONM - Formations Orthodontie Neuro-Musculaire',
  description:
    'Formations d\'excellence en orthodontie neuro-musculaire avec les meilleurs experts. Découvrez nos sessions présentielles pour développer votre expertise en ONM.',
  keywords: ['Masterclass ONM', 'orthodontie neuro-musculaire', 'formation orthodontiste', 'CEPROF', 'Dr Romain de Papé'],
}

export default function Layout({ children, params }: { children: React.ReactNode; params: any }) {
  return <ApplicationLayout header={<ModernHeader />}>{children}</ApplicationLayout>
}
