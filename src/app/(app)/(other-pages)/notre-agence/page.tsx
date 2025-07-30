import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import { Link } from '@/shared/link'
import Image from 'next/image'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  HomeIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const stats = [
  { id: 1, name: 'Années d\'expérience', value: '15+' },
  { id: 2, name: 'Biens vendus', value: '500+' },
  { id: 3, name: 'Clients satisfaits', value: '98%' },
  { id: 4, name: 'Délai moyen de vente', value: '45 jours' },
]

const services = [
  {
    icon: HomeIcon,
    title: 'Vente immobilière',
    description: 'Accompagnement complet pour la vente de votre bien au meilleur prix',
  },
  {
    icon: CurrencyEuroIcon,
    title: 'Estimation gratuite',
    description: 'Évaluation précise et gratuite de votre bien immobilier',
  },
  {
    icon: UserGroupIcon,
    title: 'Conseil personnalisé',
    description: 'Un interlocuteur unique pour un suivi personnalisé de votre projet',
  },
]

const teamMembers = [
  {
    name: 'Marie Dupont',
    role: 'Directrice d\'agence',
    image: '/images/team/marie.jpg',
    description: '15 ans d\'expérience dans l\'immobilier strasbourgeois',
  },
  {
    name: 'Pierre Martin',
    role: 'Conseiller immobilier',
    image: '/images/team/pierre.jpg',
    description: 'Spécialiste des biens de prestige et maisons de caractère',
  },
  {
    name: 'Sophie Bernard',
    role: 'Conseillère immobilière',
    image: '/images/team/sophie.jpg',
    description: 'Experte en appartements et primo-accédants',
  },
]

export default function NotreAgencePage() {
  return (
    <div className="container relative py-16">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <Heading level={1} className="mb-4">
          Notre agence immobilière à Strasbourg
        </Heading>
        <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          Depuis plus de 15 ans, Initiative Immobilier vous accompagne dans tous vos projets immobiliers 
          avec professionnalisme et proximité.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.id} className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {stat.name}
            </div>
          </div>
        ))}
      </div>

      {/* About Section */}
      <div className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <Heading level={2} className="mb-6">
            Une agence à taille humaine
          </Heading>
          <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
            <p>
              Initiative Immobilier est née de la volonté de créer une agence immobilière différente, 
              où la relation humaine et la confiance sont au cœur de notre métier.
            </p>
            <p>
              Notre équipe de professionnels passionnés met son expertise et sa connaissance approfondie 
              du marché strasbourgeois à votre service pour concrétiser vos projets immobiliers.
            </p>
            <p>
              Que vous souhaitiez vendre, acheter ou faire estimer votre bien, nous vous accompagnons 
              à chaque étape avec transparence et efficacité.
            </p>
          </div>
          <div className="mt-8 flex gap-4">
            <Button href="/estimer-mon-bien">
              Estimer mon bien
            </Button>
            <Button href="/contact" color="light">
              Nous contacter
            </Button>
          </div>
        </div>
        <div className="relative h-96 overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-700">
          <Image
            src="/images/agency-office.jpg"
            alt="Bureau de l'agence Initiative Immobilier"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Services */}
      <div className="mb-16">
        <Heading level={2} className="mb-8 text-center">
          Nos services
        </Heading>
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className="rounded-2xl border border-neutral-200 p-6 transition-shadow hover:shadow-lg dark:border-neutral-700"
            >
              <service.icon className="mb-4 h-10 w-10 text-primary-600 dark:text-primary-400" />
              <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <Heading level={2} className="mb-8 text-center">
          Notre équipe
        </Heading>
        <div className="grid gap-8 md:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-4 mx-auto h-48 w-48 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                {/* L'image serait ajoutée ici */}
              </div>
              <h3 className="mb-1 text-lg font-semibold">{member.name}</h3>
              <p className="mb-2 text-sm text-primary-600 dark:text-primary-400">
                {member.role}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-2xl bg-neutral-100 p-8 dark:bg-neutral-800">
        <Heading level={2} className="mb-8 text-center">
          Nous trouver
        </Heading>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <MapPinIcon className="h-6 w-6 shrink-0 text-primary-600 dark:text-primary-400" />
            <div>
              <h4 className="mb-1 font-semibold">Adresse</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                123 Avenue de la Paix<br />
                67000 Strasbourg
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <PhoneIcon className="h-6 w-6 shrink-0 text-primary-600 dark:text-primary-400" />
            <div>
              <h4 className="mb-1 font-semibold">Téléphone</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                03 88 12 34 56
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <EnvelopeIcon className="h-6 w-6 shrink-0 text-primary-600 dark:text-primary-400" />
            <div>
              <h4 className="mb-1 font-semibold">Email</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                contact@initiative.immo
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ClockIcon className="h-6 w-6 shrink-0 text-primary-600 dark:text-primary-400" />
            <div>
              <h4 className="mb-1 font-semibold">Horaires</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Lun-Ven: 9h-18h<br />
                Sam: 9h-12h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}