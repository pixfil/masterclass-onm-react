'use client'

import { getStayCategories } from '@/data/categories'
import { getCurrencies, getLanguages, getNavMegaMenu } from '@/data/navigation'
import { Button } from '@/shared/Button'
import Logo from '@/shared/Logo'
import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'
import AuthButton from './AuthButton'
import CategoriesDropdown from './CategoriesDropdown'
import CurrLangDropdown from './CurrLangDropdown'
import HamburgerBtnMenu from './HamburgerBtnMenu'
import MegaMenuPopover from './MegaMenuPopover'
import NotifyDropdown from './NotifyDropdown'
import CartDropdown from '@/components/CartDropdown'
interface HeaderProps {
  hasBorderBottom?: boolean
  className?: string
}

const Header: FC<HeaderProps> = ({ hasBorderBottom = true, className }) => {
  const [megamenu, setMegamenu] = useState<any>(null)
  const [currencies, setCurrencies] = useState<any>(null)
  const [languages, setLanguages] = useState<any>(null)
  const [featuredCategory, setFeaturedCategory] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const [megaMenuData, currenciesData, languagesData, categoriesData] = await Promise.all([
        getNavMegaMenu(),
        getCurrencies(),
        getLanguages(),
        getStayCategories()
      ])
      
      setMegamenu(megaMenuData)
      setCurrencies(currenciesData)
      setLanguages(languagesData)
      setFeaturedCategory(categoriesData[7])
    }
    
    loadData()
  }, [])

  return (
    <div className={clsx('relative', className)}>
      <div className="container">
        <div
          className={clsx(
            'flex h-20 justify-between gap-x-2.5 border-neutral-200 dark:border-neutral-700',
            hasBorderBottom && 'border-b',
            !hasBorderBottom && 'has-[.header-popover-full-panel]:border-b'
          )}
        >
          <div className="flex items-center justify-center gap-x-3 sm:gap-x-8">
            <Logo />
            <div className="hidden h-7 border-l border-neutral-200 md:block dark:border-neutral-700"></div>
            <div className="hidden md:block">
              <CategoriesDropdown />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-x-2.5 sm:gap-x-6">
            <div className="block lg:hidden">
              <HamburgerBtnMenu />
            </div>
            <MegaMenuPopover megamenu={megamenu} featuredCategory={featuredCategory} />
            <CurrLangDropdown currencies={currencies} languages={languages} className="hidden md:block" />
            <Button className="-mx-1 py-1.75!" color="light" href={'/contact'}>
              Contact
            </Button>
            <CartDropdown />
            <NotifyDropdown />
            <AuthButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
