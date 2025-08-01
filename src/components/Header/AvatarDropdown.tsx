'use client'

import avatarImage from '@/images/avatars/Image-1.png'
import Avatar from '@/shared/Avatar'
import { Divider } from '@/shared/divider'
import { Link } from '@/shared/link'
import SwitchDarkMode2 from '@/shared/SwitchDarkMode2'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import {
  BulbChargingIcon,
  FavouriteIcon,
  Idea01Icon,
  Logout01Icon,
  Task01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { getCurrentUserProfile, UserProfile } from '@/lib/supabase/profiles'

interface Props {
  className?: string
  user?: User | null
}

export default function AvatarDropdown({ className, user }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      getCurrentUserProfile().then(setProfile)
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Déterminer si l'utilisateur est admin en vérifiant le rôle
  const isAdmin = profile?.role === 'admin' || user?.email === 'philippe@gclicke.com'
  
  // Informations utilisateur basées sur le profil réel
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name.charAt(0).toUpperCase()}.`.trim()
    : profile?.first_name || user?.email?.split('@')[0] || 'Utilisateur'
  
  const location = profile?.location || (isAdmin ? 'Strasbourg, France' : 'Utilisateur')
  const avatarSrc = profile?.avatar_url || (isAdmin ? '/default-avatar.png' : avatarImage.src)

  return (
    <div className={className}>
      <Popover>
        <PopoverButton className="-m-1.5 flex cursor-pointer items-center justify-center rounded-full p-1.5 hover:bg-neutral-100 focus-visible:outline-hidden dark:hover:bg-neutral-800">
          <Avatar src={avatarSrc} className="size-8" />
        </PopoverButton>

        <PopoverPanel
          transition
          anchor={{
            to: 'bottom end',
            gap: 16,
          }}
          className="z-40 w-80 rounded-3xl shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0"
        >
          <div className="relative grid grid-cols-1 gap-6 bg-white px-6 py-7 dark:bg-neutral-800">
            <div className="flex items-center space-x-3">
              <Avatar src={avatarSrc} className="size-12" />

              <div className="grow">
                <h4 className="font-semibold">{displayName}</h4>
                <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">{location}</p>
              </div>
            </div>

            <Divider />

            {/* Mon compte */}
            <Link
              href={'/account'}
              className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
            >
              <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                <HugeiconsIcon icon={UserIcon} size={24} strokeWidth={1.5} />
              </div>
              <p className="ms-4 text-sm font-medium">Mon compte</p>
            </Link>

            {/* Administration (admin) ou Mes formations (client) */}
            {isAdmin ? (
              <Link
                href={'/admin/dashboard'}
                className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
              >
                <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                  <HugeiconsIcon icon={Task01Icon} size={24} strokeWidth={1.5} />
                </div>
                <p className="ms-4 text-sm font-medium">Administration</p>
              </Link>
            ) : (
              <Link
                href={'/account/mes-formations'}
                className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
              >
                <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                  <HugeiconsIcon icon={Task01Icon} size={24} strokeWidth={1.5} />
                </div>
                <p className="ms-4 text-sm font-medium">Mes formations</p>
              </Link>
            )}

            {/* Favoris */}
            <Link
              href={'/wishlist'}
              className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
            >
              <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                <HugeiconsIcon icon={FavouriteIcon} size={24} strokeWidth={1.5} />
              </div>
              <p className="ms-4 text-sm font-medium">Favoris</p>
            </Link>

            <Divider />

            {/* Mode sombre */}
            <div className="focus-visible:ring-opacity-50 -m-3 flex items-center justify-between rounded-lg p-2 hover:bg-neutral-100 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 dark:hover:bg-neutral-700">
              <div className="flex items-center">
                <div className="flex flex-shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                  <HugeiconsIcon icon={Idea01Icon} size={24} strokeWidth={1.5} />
                </div>
                <p className="ms-4 text-sm font-medium">Mode sombre</p>
              </div>
              <SwitchDarkMode2 />
            </div>

            {/* Aide */}
            <Link
              href={'/contact'}
              className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
            >
              <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                <HugeiconsIcon icon={BulbChargingIcon} size={24} strokeWidth={1.5} />
              </div>
              <p className="ms-4 text-sm font-medium">Aide</p>
            </Link>

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700 w-full text-left"
            >
              <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                <HugeiconsIcon icon={Logout01Icon} size={24} strokeWidth={1.5} />
              </div>
              <p className="ms-4 text-sm font-medium">Se déconnecter</p>
            </button>
          </div>
        </PopoverPanel>
      </Popover>
    </div>
  )
}
