import { Metadata } from 'next'
import HeroFormations from '@/components/formations/HeroFormations'
import UpcomingSessions from '@/components/formations/UpcomingSessions'
import FeaturedFormations from '@/components/formations/FeaturedFormations'
import InstructorsSection from '@/components/formations/InstructorsSection'
import CEPROFSection from '@/components/formations/CEPROFSection'
import TestimonialsSection from '@/components/formations/TestimonialsSection'
import NewsletterFormations from '@/components/formations/NewsletterFormations'

export const metadata: Metadata = {
  title: 'Formations Orthodontie Neuro-Musculaire | Masterclass ONM',
  description: 'Découvrez nos formations présentielles en orthodontie neuro-musculaire. Cours pour débutants et experts avec les meilleurs formateurs.',
}

export default function FormationsPage() {
  return (
    <main className="nc-PageHome relative">
      <HeroFormations />
      
      <div className="container relative overflow-hidden">
        {/* Prochaines sessions */}
        <UpcomingSessions />
        
        {/* Formations populaires */}
        <FeaturedFormations />
        
        {/* Nos formateurs */}
        <InstructorsSection />
        
        {/* CEPROF - Cercle de spécialistes */}
        <CEPROFSection />
        
        {/* Témoignages */}
        <TestimonialsSection />
        
        {/* Newsletter */}
        <NewsletterFormations />
      </div>
    </main>
  )
}