import { CustomLink } from '@/data/types'
import Logo from '@/shared/Logo'
import SocialsList1 from '@/shared/SocialsList1'
import { NewsletterForm } from './NewsletterForm'
import React from 'react'

interface WidgetFooterMenu {
  id: string
  title: string
  menus: CustomLink[]
}

const widgetMenus: WidgetFooterMenu[] = [
  {
    id: '1',
    title: 'Services',
    menus: [
      { href: '/real-estate-categories?type=vente', label: 'Acheter' },
      { href: '/real-estate-categories?type=location', label: 'Louer' },
      { href: '/estimer-mon-bien', label: 'Estimer mon bien' },
      { href: '/admin/login', label: 'Espace professionnel' },
    ],
  },
  {
    id: '2',
    title: 'À propos',
    menus: [
      { href: '/about', label: 'Notre agence' },
      { href: '/admin/agents', label: 'Notre équipe' },
      { href: '/contact', label: 'Contact' },
      { href: '/mentions-legales', label: 'Mentions légales' },
    ],
  },
  {
    id: '3',
    title: 'Aide',
    menus: [
      { href: '/faq', label: 'FAQ' },
      { href: '/guide-acheteur', label: 'Guide acheteur' },
      { href: '/guide-vendeur', label: 'Guide vendeur' },
      { href: '/contact', label: 'Support' },
    ],
  },
]

const Footer: React.FC = () => {
  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">{menu.title}</h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <a
                key={index}
                className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="relative border-t border-neutral-200 py-24 lg:py-28 dark:border-neutral-700">
      <div className="container grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
        <div className="col-span-2 grid grid-cols-4 gap-5 md:col-span-4 lg:flex lg:flex-col lg:md:col-span-1">
          <div className="col-span-2 md:col-span-1">
            <Logo className="w-20" />
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <SocialsList1 className="flex items-center gap-x-3 lg:flex-col lg:items-start lg:gap-x-0 lg:gap-y-2.5" />
          </div>
        </div>
        {widgetMenus.map(renderWidgetMenuItem)}
        <div className="col-span-2 md:col-span-1">
          <NewsletterForm />
        </div>
      </div>
    </div>
  )
}

export default Footer
