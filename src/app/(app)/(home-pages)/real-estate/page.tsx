import BackgroundSection from '@/components/BackgroundSection'
import { RealEstateHeroSearchForm } from '@/components/HeroSearchForm/RealEstateHeroSearchForm'
import SectionDowloadApp from '@/components/SectionDowloadApp'
import SectionGridAuthorBox from '@/components/SectionGridAuthorBox'
import SectionGridAgentsHorizontal from '@/components/SectionGridAgentsHorizontal'
import SectionGridFeatureProperty from '@/components/SectionGridFeatureProperty'
import SectionFeaturedProperties from '@/components/SectionFeaturedProperties'
import SectionOurFeatures from '@/components/SectionOurFeatures'
import SectionCitiesSlider from '@/components/SectionCitiesSlider'
import SectionSubscribe2 from '@/components/SectionSubscribe2'
import { EstimationForm } from '@/components/EstimationForm'
import { CityRoller } from '@/components/CityRoller'
import { getAuthors } from '@/data/authors'
import { getAllAgents } from '@/lib/supabase/agents'
import { getFeaturedProperties, getTopCitiesByPropertyCount, getPublishedPropertiesWithImages } from '@/lib/supabase/properties'
import { adaptPropertiesToListings } from '@/lib/adapters/property-adapter'
import heroImage from '@/images/hero-right-3.png'
import logo1Dark from '@/images/logos/dark/1.png'
import logo2Dark from '@/images/logos/dark/2.png'
import logo3Dark from '@/images/logos/dark/3.png'
import logo4Dark from '@/images/logos/dark/4.png'
import logo5Dark from '@/images/logos/dark/5.png'
import logo1 from '@/images/logos/nomal/1.png'
import logo2 from '@/images/logos/nomal/2.png'
import logo3 from '@/images/logos/nomal/3.png'
import logo4 from '@/images/logos/nomal/4.png'
import logo5 from '@/images/logos/nomal/5.png'
import ourFeatureImage from '@/images/our-features-2.png'
import HeadingWithSub from '@/shared/Heading'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Accueil - Initiative Immobilier',
  description: 'Agence immobilière à Strasbourg. Vente et location de maisons, appartements, terrains et locaux commerciaux.',
}

const SectionHero = ({ cities }: { cities: string[] }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 end-0 w-full grow lg:w-3/4">
        <Image
          fill
          className="object-cover"
          src={heroImage}
          alt="hero"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
      <div className="relative py-24 lg:py-20">
        <div className="relative inline-flex">
          <div className="absolute inset-y-0 end-20 w-screen bg-primary-500 md:end-40"></div>
          <div className="relative max-w-2xl py-10 text-white sm:py-20 xl:py-24">
            <h2 className="text-4xl/[1.1] font-semibold text-pretty md:text-6xl/[1.1] xl:text-7xl/[1.1]">
              Trouvez votre <br />
              bien idéal à <CityRoller cities={cities} />
            </h2>
          </div>
        </div>
        <div className="hidden w-full lg:mt-20 lg:block">
          <RealEstateHeroSearchForm formStyle="default" />
        </div>
      </div>
    </div>
  )
}

const SectionLogoCloud = () => {
  const data = [
    {
      id: 1,
      src: logo1,
      srcDark: logo1Dark,
    },
    {
      id: 2,
      src: logo2,
      srcDark: logo2Dark,
    },
    {
      id: 3,
      src: logo3,
      srcDark: logo3Dark,
    },
    {
      id: 4,
      src: logo4,
      srcDark: logo4Dark,
    },
    {
      id: 5,
      src: logo5,
      srcDark: logo5Dark,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-5 sm:gap-16 lg:grid-cols-5">
      {data.map((item) => (
        <div key={item.id} className="flex items-end justify-center">
          <Image className="block dark:hidden" src={item.src} alt={`logo-${item.id}`} />
          <Image className="hidden dark:block" src={item.srcDark} alt={`logo-${item.id}`} />
        </div>
      ))}
    </div>
  )
}

async function Home() {
  const authors = await getAuthors()
  const agents = await getAllAgents()
  
  // Propriétés en vedette pour la section "Nos biens en vedette"
  const featuredProperties = await getFeaturedProperties(6)
  const featuredListings = adaptPropertiesToListings(featuredProperties)
  
  // Données pour la section "Découvrez votre bien idéal" par ville
  const topCitiesForFilters = await getTopCitiesByPropertyCount(4)
  const cityNames = topCitiesForFilters.map(({ city }) => city)
  
  // Données pour la section des villes (plus de villes affichées)
  const topCities = await getTopCitiesByPropertyCount(8)
  
  // Pour la section par ville, récupérer toutes les propriétés publiées
  const allPublishedProperties = await getPublishedPropertiesWithImages(20)
  const cityListings = adaptPropertiesToListings(allPublishedProperties)

  return (
    <main className="relative overflow-hidden">
      <div className="relative container mb-24 flex flex-col gap-y-24 lg:mb-28 lg:gap-y-32">
        <SectionHero cities={cityNames} />
        <SectionOurFeatures 
          type="type2" 
          rightImg={ourFeatureImage}
          subHeading="Nos services"
          heading="Pourquoi choisir Initiative Immobilier ?"
          listItems={[
            {
              badge: 'Expertise',
              title: 'Expertise locale',
              description: '15 ans d\'expérience du marché immobilier strasbourgeois et de ses spécificités',
            },
            {
              badge: 'Accompagnement',
              badgeColor: 'green',
              title: 'Accompagnement personnalisé',
              description: 'Un conseiller dédié vous accompagne à chaque étape de votre projet immobilier',
            },
            {
              badge: 'Réactivité',
              badgeColor: 'red',
              title: 'Réactivité et disponibilité',
              description: 'Une réponse rapide à vos demandes et une disponibilité 6 jours sur 7',
            },
          ]}
        />
        <div>
          <HeadingWithSub subheading="Découvrez notre sélection de biens d'exception.">
            Nos biens en vedette
          </HeadingWithSub>
          <SectionFeaturedProperties listing={featuredListings} />
        </div>
        
        <div>
          <SectionGridFeatureProperty 
            listing={cityListings}
            heading="Découvrez votre bien idéal"
            subHeading="Explorez les meilleures propriétés de votre région."
            tabs={cityNames.length > 0 ? cityNames : ['Strasbourg', 'Colmar', 'Mulhouse', 'Haguenau']}
          />
        </div>
        <div className="relative py-20">
          <BackgroundSection className="bg-neutral-100 dark:bg-black/20" />
          <HeadingWithSub isCenter subheading="Découvrez l'équipe qui vous accompagne.">
            Notre équipe
          </HeadingWithSub>
          <SectionGridAgentsHorizontal agents={agents} />
        </div>
        <SectionLogoCloud />
        <div className="relative py-20">
          <BackgroundSection className="bg-primary-50 dark:bg-primary-900/20" />
          <div className="text-center mb-12">
            <HeadingWithSub isCenter subheading="Estimation gratuite et sans engagement">
              Combien vaut votre bien ?
            </HeadingWithSub>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
              Nos experts immobiliers estiment gratuitement votre bien et vous accompagnent dans votre projet de vente.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <EstimationForm />
          </div>
        </div>
        <div>
          <HeadingWithSub subheading="Découvrez les villes où nous avons des biens disponibles.">
            Nos villes
          </HeadingWithSub>
          <SectionCitiesSlider cities={topCities} />
        </div>

      </div>
    </main>
  )
}

export default Home
