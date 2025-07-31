import '@/styles/tailwind.css'
import './globals.css'
import { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import 'rc-slider/assets/index.css'
import Providers from './providers'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | Masterclass ONM',
    default: 'Masterclass ONM - Formations Orthodontie Neuro-Musculaire',
  },
  description: 'Masterclass ONM, formations d\'excellence en orthodontie neuro-musculaire. Découvrez nos sessions présentielles avec les meilleurs experts. Formation certifiante reconnue internationalement.',
  keywords: 'Masterclass ONM, orthodontie neuro-musculaire, formation orthodontiste, CEPROF, Dr Romain de Papé, formation dentaire, ONM, orthodontie fonctionnelle',
  
  openGraph: {
    title: 'Masterclass ONM - Formations Orthodontie Neuro-Musculaire',
    description: 'Formations d\'excellence en orthodontie neuro-musculaire avec les meilleurs experts internationaux.',
    url: 'https://masterclass-onm.com',
    siteName: 'Masterclass ONM',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://masterclass-onm.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Masterclass ONM - Formations Orthodontie Neuro-Musculaire'
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Masterclass ONM - Formations Orthodontie Neuro-Musculaire',
    description: 'Formations d\'excellence en orthodontie neuro-musculaire avec les meilleurs experts.',
    images: ['https://masterclass-onm.com/og-image.jpg']
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  
  verification: {
    google: 'your-google-verification-code', // À remplacer par votre code Google
    // other: 'your-other-verification-codes'
  },
  
  alternates: {
    canonical: 'https://initiative-immobilier.fr'
  },
  
  other: {
    'theme-color': '#0891b2', // Couleur principale de votre site
    'msapplication-TileColor': '#0891b2'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={poppins.className} suppressHydrationWarning>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
