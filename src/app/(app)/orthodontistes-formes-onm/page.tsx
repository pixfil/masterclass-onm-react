import type { Metadata } from 'next'
import { Heading } from '@/shared/Heading'
import Image from 'next/image'
import Link from 'next/link'
import { MapPinIcon, AcademicCapIcon, CalendarIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Orthodontistes formés à l\'ONM | Masterclass ONM',
  description: 'Trouvez un orthodontiste formé à l\'Orthodontie Neuro-Musculaire (ONM) près de chez vous. Annuaire des praticiens certifiés.',
  keywords: 'orthodontiste, ONM, orthodontie neuro-musculaire, praticien certifié, annuaire orthodontistes'
}

// Mock data - À remplacer par des données de Supabase
const formattedOrthodontists = [
  {
    id: '1',
    name: 'Dr. Marie Dubois',
    city: 'Paris',
    region: 'Île-de-France',
    specialities: ['ONM Niveau 1', 'ONM Niveau 2', 'Fonction masticatrice'],
    certificationDate: '2023',
    practiceAddress: '123 Avenue des Champs-Élysées, 75008 Paris',
    phone: '01 42 25 63 85',
    email: 'contact@dr-dubois-ortho.fr',
    website: 'https://dr-dubois-ortho.fr',
    image: null,
    description: 'Spécialiste en orthodontie neuro-musculaire depuis plus de 15 ans, formée aux dernières techniques ONM.'
  },
  {
    id: '2',
    name: 'Dr. Jean-Pierre Martin',
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes', 
    specialities: ['ONM Niveau 1', 'Dysfonctions ATM'],
    certificationDate: '2022',
    practiceAddress: '45 Rue de la République, 69002 Lyon',
    phone: '04 78 92 15 47',
    email: 'cabinet@martin-orthodontie.fr',
    website: 'https://martin-orthodontie.fr',
    image: null,
    description: 'Expert en traitement des dysfonctions temporo-mandibulaires par l\'approche neuro-musculaire.'
  },
  {
    id: '3',
    name: 'Dr. Sophie Leclerc',
    city: 'Marseille',
    region: 'Provence-Alpes-Côte d\'Azur',
    specialities: ['ONM Niveau 1', 'ONM Niveau 2', 'Orthodontie interceptive'],
    certificationDate: '2024',
    practiceAddress: '78 Boulevard de la Corniche, 13007 Marseille',
    phone: '04 91 55 32 18',
    email: 'dr.leclerc@orthodontie-marseille.fr',
    website: null,
    image: null,
    description: 'Praticienne spécialisée dans l\'orthodontie interceptive et les traitements précoces ONM.'
  },
  {
    id: '4',
    name: 'Dr. Antoine Moreau',
    city: 'Toulouse',
    region: 'Occitanie',
    specialities: ['ONM Niveau 1', 'Rééducation fonctionnelle'],
    certificationDate: '2023',
    practiceAddress: '12 Place du Capitole, 31000 Toulouse',
    phone: '05 61 23 74 92',
    email: 'contact@moreau-ortho.com',
    website: 'https://moreau-ortho.com',
    image: null,
    description: 'Passionné par l\'approche fonctionnelle en orthodontie, spécialiste de la rééducation neuro-musculaire.'
  },
  {
    id: '5',
    name: 'Dr. Catherine Rousseau',
    city: 'Nantes',
    region: 'Pays de la Loire',
    specialities: ['ONM Niveau 1', 'Orthodontie adulte'],
    certificationDate: '2022',
    practiceAddress: '25 Cours des 50 Otages, 44000 Nantes',
    phone: '02 40 47 58 29',
    email: 'cabinet.rousseau@orthodontie-nantes.fr',
    website: 'https://orthodontie-nantes.fr',
    image: null,
    description: 'Spécialisée dans les traitements orthodontiques adultes avec l\'approche neuro-musculaire ONM.'
  },
  {
    id: '6',
    name: 'Dr. Philippe Garnier',
    city: 'Strasbourg',
    region: 'Grand Est',
    specialities: ['ONM Niveau 1', 'ONM Niveau 2', 'Orthodontie linguale'],
    certificationDate: '2023',
    practiceAddress: '8 Place Kléber, 67000 Strasbourg',
    phone: '03 88 32 67 45',
    email: 'garnier@orthodontie-strasbourg.fr',
    website: null,
    image: null,
    description: 'Expert en orthodontie linguale et techniques ONM avancées, formations régulières aux nouvelles approches.'
  }
]

const regions = [...new Set(formattedOrthodontists.map(o => o.region))].sort()

export default function OrthodontisteFormesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Heading as="h1" className="text-3xl lg:text-4xl mb-4">
          Orthodontistes formés à l'ONM
        </Heading>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Trouvez un praticien certifié en Orthodontie Neuro-Musculaire près de chez vous. 
          Tous nos orthodontistes listés ont suivi avec succès nos formations spécialisées.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 text-center">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AcademicCapIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            {formattedOrthodontists.length}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Orthodontistes certifiés
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 text-center">
          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MapPinIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            {regions.length}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Régions couvertes
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            2022
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Première certification
          </p>
        </div>
      </div>

      {/* Filter by region */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Filtrer par région
        </h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Toutes les régions
          </button>
          {regions.map(region => (
            <button
              key={region}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Orthodontists grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {formattedOrthodontists.map((orthodontist) => (
          <div key={orthodontist.id} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              {/* Avatar placeholder */}
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                {orthodontist.name.split(' ').map(n => n[0]).join('')}
              </div>

              <div className="flex-1 min-w-0">
                {/* Name and title */}
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">
                  {orthodontist.name}
                </h3>
                
                {/* Location */}
                <div className="flex items-center text-neutral-600 dark:text-neutral-400 mb-2">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{orthodontist.city}, {orthodontist.region}</span>
                </div>

                {/* Specialities */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {orthodontist.specialities.map((speciality, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-full"
                    >
                      {speciality}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {orthodontist.description}
                </p>

                {/* Contact info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{orthodontist.practiceAddress}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <a href={`tel:${orthodontist.phone}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                      {orthodontist.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <a href={`mailto:${orthodontist.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                      {orthodontist.email}
                    </a>
                  </div>

                  {orthodontist.website && (
                    <div className="pt-2">
                      <a
                        href={orthodontist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        Visiter le site web
                      </a>
                    </div>
                  )}
                </div>

                {/* Certification badge */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                    <AcademicCapIcon className="w-4 h-4 mr-1" />
                    <span>Certifié ONM depuis {orthodontist.certificationDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">
          Vous êtes orthodontiste et souhaitez vous former à l'ONM ?
        </h2>
        <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
          Rejoignez les professionnels certifiés en suivant nos formations spécialisées en Orthodontie Neuro-Musculaire.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/formations"
            className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Découvrir nos formations
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </div>

      {/* Note */}
      <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
          <strong>Note importante :</strong> Les praticiens listés ont suivi nos formations et sont certifiés en Orthodontie Neuro-Musculaire. 
          Cette liste est mise à jour régulièrement. Pour toute question ou modification, 
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
            contactez-nous
          </Link>.
        </p>
      </div>
    </div>
  )
}