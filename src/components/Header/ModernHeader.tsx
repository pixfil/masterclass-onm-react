'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { 
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  InformationCircleIcon,
  PhoneIcon,
  PhotoIcon,
  ShoppingCartIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import CartDropdown from '@/components/CartDropdown'
import AvatarDropdown from './AvatarDropdown'
import { useCart } from '@/contexts/CartContext'

interface MegaMenuSection {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavigationItem {
  name: string
  href?: string
  megaMenu?: {
    sections: MegaMenuSection[]
    formations?: FormationMegaMenu[]
    featured?: {
      title: string
      description: string
      href: string
      image: string
    }
  }
}

interface FormationMegaMenu {
  id: string
  title: string
  description: string
  href: string
  date: string
  location: string
  price: number
  status: 'upcoming' | 'available' | 'full'
}

interface ModernHeaderProps {
  transparentMode?: boolean
}

const ModernHeader: React.FC<ModernHeaderProps> = ({ transparentMode = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [formations, setFormations] = useState<FormationMegaMenu[]>([])
  const [megaMenuTimeout, setMegaMenuTimeout] = useState<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const { itemsCount } = useCart()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (megaMenuTimeout) {
        clearTimeout(megaMenuTimeout)
      }
    }
  }, [megaMenuTimeout])

  // Load formations for mega menu
  useEffect(() => {
    const loadFormations = async () => {
      try {
        const { data, error } = await supabase
          .from('formations')
          .select(`
            id,
            title,
            short_description,
            slug,
            price,
            status,
            formation_sessions(
              id,
              start_date,
              location
            )
          `)
          .eq('status', 'published')
          .limit(4)
          .order('created_at', { ascending: false })

        if (data) {
          const formationMenuItems: FormationMegaMenu[] = data.map(formation => {
            const nextSession = formation.formation_sessions
              ?.sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              ?.find((session: any) => new Date(session.start_date) > new Date())
            
            return {
              id: formation.id,
              title: formation.title,
              description: formation.short_description || 'Formation d\'excellence en ONM',
              href: `/formations/${formation.slug}`,
              date: nextSession?.start_date || 'À venir',
              location: nextSession?.location || 'En ligne',
              price: formation.price || 0,
              status: nextSession ? 'upcoming' : 'available'
            }
          })
          setFormations(formationMenuItems)
        }
      } catch (error) {
        console.error('Erreur chargement formations:', error)
        // En cas d'erreur, utiliser des formations par défaut
        setFormations([
          {
            id: '1',
            title: 'Formation ONM Niveau 1',
            description: 'Introduction à l\'orthodontie neuro-musculaire',
            href: '/formations/onm-niveau-1',
            date: 'À venir',
            location: 'Paris',
            price: 2500,
            status: 'available'
          },
          {
            id: '2',
            title: 'Formation ONM Niveau 2',
            description: 'Perfectionnement en orthodontie neuro-musculaire',
            href: '/formations/onm-niveau-2',
            date: 'À venir',
            location: 'Lyon',
            price: 3000,
            status: 'available'
          },
          {
            id: '3',
            title: 'Webinaire ONM',
            description: 'Découverte de la méthode ONM en ligne',
            href: '/formations/webinaire-onm',
            date: 'À venir',
            location: 'En ligne',
            price: 0,
            status: 'available'
          },
          {
            id: '4',
            title: 'Formation Expert ONM',
            description: 'Maîtrise avancée de l\'orthodontie neuro-musculaire',
            href: '/formations/expert-onm',
            date: 'À venir',
            location: 'Marseille',
            price: 4000,
            status: 'available'
          }
        ])
      }
    }

    loadFormations()
  }, [])

  const navigation: NavigationItem[] = [
    {
      name: 'L\'ONM',
      megaMenu: {
        sections: [
          {
            title: 'La Méthode',
            description: 'Découvrez l\'orthodontie neuro-musculaire',
            href: '/la-methode',
            icon: AcademicCapIcon
          },
          {
            title: 'Science & Recherche',
            description: 'Bases scientifiques et études cliniques',
            href: '/science-recherche',
            icon: InformationCircleIcon
          },
          {
            title: 'Cas Cliniques',
            description: 'Résultats et témoignages',
            href: '/cas-cliniques',
            icon: PhotoIcon
          },
          {
            title: 'Orthodontistes formés à l\'ONM',
            description: 'Trouvez un praticien certifié près de chez vous',
            href: '/orthodontistes-formes',
            icon: UserGroupIcon
          }
        ],
        featured: {
          title: 'L\'Innovation ONM',
          description: 'Révolutionnez votre pratique orthodontique avec une approche scientifique validée',
          href: '/innovation-onm',
          image: '/images/onm-featured.jpg'
        }
      }
    },
    {
      name: 'Formations',
      href: '/formations',
      megaMenu: {
        formations: formations,
        featured: {
          title: 'Toutes nos Formations',
          description: 'Découvrez l\'ensemble de nos programmes de formation en orthodontie neuro-musculaire',
          href: '/formations',
          image: '/images/formations-featured.jpg'
        }
      }
    },
    {
      name: 'CEPROF',
      megaMenu: {
        sections: [
          {
            title: 'Nos Experts',
            description: 'Rencontrez les spécialistes ONM',
            href: '/ceprof',
            icon: UserGroupIcon
          },
          {
            title: 'Devenir Membre',
            description: 'Rejoignez le cercle d\'excellence',
            href: '/ceprof/devenir-membre',
            icon: AcademicCapIcon
          },
          {
            title: 'Communauté',
            description: 'Échanges et partages d\'expérience',
            href: '/ceprof/communaute',
            icon: UserGroupIcon
          }
        ],
        featured: {
          title: 'Excellence CEPROF',
          description: 'Rejoignez l\'élite des orthodontistes formés à la méthode ONM',
          href: '/ceprof/cercle-excellence',
          image: '/images/ceprof-featured.jpg'
        }
      }
    },
    {
      name: 'Outils',
      megaMenu: {
        sections: [
          {
            title: 'Diagnostic ONM Pro',
            description: 'Logiciel d\'analyse neuro-musculaire avancée',
            href: '/outils/diagnostic-onm',
            icon: ComputerDesktopIcon
          },
          {
            title: 'App Mobile ONM',
            description: 'Suivi patient et protocoles ONM',
            href: '/outils/app-mobile',
            icon: ComputerDesktopIcon
          },
          {
            title: 'Plateforme E-Learning',
            description: 'Formation en ligne interactive',
            href: '/outils/e-learning',
            icon: AcademicCapIcon
          },
          {
            title: 'Kit de Mesure ONM',
            description: 'Outils physiques pour l\'analyse',
            href: '/outils/kit-mesure',
            icon: InformationCircleIcon
          }
        ],
        featured: {
          title: 'Nouvel Outil Breveté',
          description: 'Découvrez notre dernière innovation technologique pour l\'orthodontie neuro-musculaire',
          href: '/outils/nouveaute',
          image: '/images/outil-medical.png'
        }
      }
    },
    {
      name: 'Contact',
      href: '/contact'
    }
  ]

  const handleMegaMenuEnter = (itemName: string) => {
    if (megaMenuTimeout) {
      clearTimeout(megaMenuTimeout)
      setMegaMenuTimeout(null)
    }
    setActiveMegaMenu(itemName)
  }

  const handleMegaMenuLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMegaMenu(null)
    }, 150) // Délai de 150ms avant fermeture
    setMegaMenuTimeout(timeout)
  }

  const handleMegaMenuMouseEnter = () => {
    if (megaMenuTimeout) {
      clearTimeout(megaMenuTimeout)
      setMegaMenuTimeout(null)
    }
  }

  const handleMegaMenuMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMegaMenu(null)
    }, 100)
    setMegaMenuTimeout(timeout)
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 min-w-0">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`font-bold text-lg transition-colors ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  Masterclass ONM
                </span>
                <span className={`text-xs transition-colors hidden sm:block ${
                  isScrolled ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Orthodontie Neuro-Musculaire
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 ml-8 flex-1 justify-center">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.megaMenu && handleMegaMenuEnter(item.name)}
                onMouseLeave={handleMegaMenuLeave}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : isScrolled
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        : 'text-white hover:text-blue-200'
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <button
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isScrolled
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        : 'text-white hover:text-blue-200'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.megaMenu && (
                      <ChevronDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </button>
                )}

                {/* Mega Menu */}
                {item.megaMenu && activeMegaMenu === item.name && (
                  <div 
                    className="fixed w-screen max-w-5xl z-50"
                    style={{
                      top: '5rem', // hauteur du header (h-20 = 5rem)
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                    onMouseEnter={handleMegaMenuMouseEnter}
                    onMouseLeave={handleMegaMenuMouseLeave}
                  >
                    {/* Zone invisible pour éviter la fermeture */}
                    <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent"></div>
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      {/* Mega menu pour les formations */}
                      {item.megaMenu.formations ? (
                        <div className="grid grid-cols-3 gap-0">
                          {/* Liste des formations */}
                          <div className="col-span-2 p-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Nos formations disponibles</h3>
                            <div className="space-y-4">
                              {item.megaMenu.formations.map((formation) => (
                                <Link
                                  key={formation.id}
                                  href={formation.href}
                                  className="group block p-4 rounded-xl border-l-4 border-transparent hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                        {formation.title}
                                      </h4>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                        {formation.description}
                                      </p>
                                      <div className="flex items-center space-x-4 mt-2">
                                        <div className="flex items-center text-xs text-gray-500">
                                          <ClockIcon className="w-3 h-3 mr-1" />
                                          {formation.date !== 'À venir' ? 
                                            new Date(formation.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 
                                            formation.date
                                          }
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                          <MapPinIcon className="w-3 h-3 mr-1" />
                                          {formation.location}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-lg font-bold text-orange-600">
                                        {formation.price > 0 ? `${formation.price}€` : 'Gratuit'}
                                      </div>
                                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                        formation.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                                        formation.status === 'full' ? 'bg-red-100 text-red-700' :
                                        'bg-orange-100 text-orange-700'
                                      }`}>
                                        {formation.status === 'upcoming' ? 'Prochaine' :
                                         formation.status === 'full' ? 'Complet' : 'Disponible'}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <Link
                                href="/formations"
                                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm"
                              >
                                Voir le catalogue complet →
                              </Link>
                            </div>
                          </div>

                          {/* Section mise en avant */}
                          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-8 flex flex-col justify-center">
                            <div className="text-white">
                              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                                <CalendarIcon className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="font-bold text-xl mb-2">
                                Prochaine session
                              </h3>
                              <p className="text-orange-100 text-sm mb-4">
                                Ne ratez pas nos formations présentielles avec les meilleurs experts ONM
                              </p>
                              <div className="bg-white/10 rounded-lg p-3 mb-4">
                                <div className="text-sm text-orange-100">Prochaine date :</div>
                                <div className="font-semibold">15 Mars 2025</div>
                                <div className="text-sm text-orange-100">Paris - Module 1</div>
                              </div>
                              <Link
                                href="/formations"
                                className="inline-flex items-center px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                              >
                                S'inscrire maintenant
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Mega menu standard pour les autres sections */
                        <div className="grid grid-cols-3 gap-0">
                          {/* Menu Sections */}
                          <div className="col-span-2 p-8">
                            <div className="grid grid-cols-2 gap-6">
                              {item.megaMenu.sections?.map((section) => {
                                const Icon = section.icon
                                return (
                                  <Link
                                    key={section.title}
                                    href={section.href}
                                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                                  >
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                        <Icon className="w-5 h-5 text-blue-600" />
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {section.title}
                                      </h3>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {section.description}
                                      </p>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>

                          {/* Featured Section */}
                          {item.megaMenu.featured && (
                            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-8 flex flex-col justify-center">
                              <div className="text-white">
                                <h3 className="font-bold text-lg mb-2">
                                  {item.megaMenu.featured.title}
                                </h3>
                                <p className="text-blue-100 text-sm mb-6">
                                  {item.megaMenu.featured.description}
                                </p>
                                <Link
                                  href={item.megaMenu.featured.href}
                                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                >
                                  En savoir plus
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions: Auth, Cart, CTA */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0 min-w-0">
            {/* Auth Button or User Menu */}
            <div className="flex items-center">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                </div>
              ) : user ? (
                <AvatarDropdown user={user} />
              ) : (
                <Link
                  href="/connexion"
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-md whitespace-nowrap text-sm ${
                    isScrolled
                      ? 'text-gray-700 hover:text-blue-600 bg-white/70 hover:bg-blue-50/80 border border-gray-200/50'
                      : 'text-white hover:text-blue-200 bg-white/10 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  Connexion
                </Link>
              )}
            </div>

            {/* Cart */}
            <div className="flex items-center">
              <CartDropdown isScrolled={isScrolled} />
            </div>

            {/* CTA Button */}
            <Link
              href="/formations"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap text-sm"
            >
              Formations
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isScrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <div className="px-4 py-3">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {item.megaMenu && (
                        <div className="mt-3 ml-4 space-y-2">
                          {item.megaMenu.sections.map((section) => (
                            <Link
                              key={section.title}
                              href={section.href}
                              className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {section.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {/* Mobile Auth */}
                <div className="flex items-center justify-between px-4">
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                    </div>
                  ) : user ? (
                    <span className="text-sm text-gray-600">Connecté</span>
                  ) : (
                    <Link
                      href="/connexion"
                      className="text-blue-600 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Se connecter
                    </Link>
                  )}
                  
                  {/* Mobile Cart */}
                  <div className="relative">
                    <ShoppingCartIcon className="w-6 h-6 text-gray-600" />
                    {itemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {itemsCount}
                      </span>
                    )}
                  </div>
                </div>
                
                <Link
                  href="/formations"
                  className="block mx-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Nos Formations
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default ModernHeader