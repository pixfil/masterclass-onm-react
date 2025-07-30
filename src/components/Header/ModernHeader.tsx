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
  ShoppingCartIcon
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
    featured?: {
      title: string
      description: string
      href: string
      image: string
    }
  }
}

const ModernHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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

  const navigation: NavigationItem[] = [
    {
      name: 'L\'ONM',
      megaMenu: {
        sections: [
          {
            title: 'La Méthode',
            description: 'Découvrez l\'orthodontie neuro-musculaire',
            href: '/onm/methode',
            icon: AcademicCapIcon
          },
          {
            title: 'Science & Recherche',
            description: 'Bases scientifiques et études cliniques',
            href: '/onm/science',
            icon: InformationCircleIcon
          },
          {
            title: 'Cas Cliniques',
            description: 'Résultats et témoignages',
            href: '/onm/cas-cliniques',
            icon: PhotoIcon
          }
        ],
        featured: {
          title: 'L\'Innovation ONM',
          description: 'Révolutionnez votre pratique orthodontique avec une approche scientifique validée',
          href: '/onm',
          image: '/images/onm-featured.jpg'
        }
      }
    },
    {
      name: 'Formations',
      href: '/formations'
    },
    {
      name: 'CEPROF',
      megaMenu: {
        sections: [
          {
            title: 'Nos Experts',
            description: 'Rencontrez les spécialistes ONM',
            href: '/ceprof/experts',
            icon: UserGroupIcon
          },
          {
            title: 'Devenir Membre',
            description: 'Rejoignez le cercle d\'excellence',
            href: '/ceprof/rejoindre',
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
          title: 'Cercle d\'Excellence',
          description: 'Rejoignez l\'élite des orthodontistes formés à la méthode ONM',
          href: '/ceprof',
          image: '/images/ceprof-featured.jpg'
        }
      }
    },
    {
      name: 'Outils',
      megaMenu: {
        sections: [
          {
            title: 'Diagnostic Digital',
            description: 'Logiciels d\'analyse avancée',
            href: '/outils/diagnostic',
            icon: ComputerDesktopIcon
          },
          {
            title: 'App Mobile',
            description: 'Suivi patient et formation',
            href: '/outils/mobile',
            icon: ComputerDesktopIcon
          },
          {
            title: 'E-Learning',
            description: 'Plateforme de formation en ligne',
            href: '/outils/e-learning',
            icon: AcademicCapIcon
          }
        ]
      }
    },
    {
      name: 'Contact',
      href: '/contact'
    }
  ]

  const handleMegaMenuEnter = (itemName: string) => {
    setActiveMegaMenu(itemName)
  }

  const handleMegaMenuLeave = () => {
    setActiveMegaMenu(null)
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
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="flex flex-col">
                <span className={`font-bold text-xl transition-colors ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  Masterclass ONM
                </span>
                <span className={`text-xs transition-colors ${
                  isScrolled ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Orthodontie Neuro-Musculaire
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 ml-12">
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
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-screen max-w-4xl z-50">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-3 gap-0">
                        
                        {/* Menu Sections */}
                        <div className="col-span-2 p-8">
                          <div className="grid grid-cols-2 gap-6">
                            {item.megaMenu.sections.map((section) => {
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
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions: Auth, Cart, CTA */}
          <div className="hidden lg:flex items-center space-x-3">
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
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-md ${
                    isScrolled
                      ? 'text-gray-700 hover:text-blue-600 bg-white/70 hover:bg-blue-50/80 border border-gray-200/50'
                      : 'text-white hover:text-blue-200 bg-white/10 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  Se connecter
                </Link>
              )}
            </div>

            {/* Cart */}
            <div className="relative">
              <div className={`p-2 rounded-lg transition-all duration-200 backdrop-blur-md ${
                isScrolled
                  ? 'hover:bg-gray-100/80 border border-gray-200/50'
                  : 'hover:bg-white/10 border border-white/20'
              }`}>
                <CartDropdown />
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href="/formations"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Nos Formations
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