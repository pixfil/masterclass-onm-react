import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = 'w-44 sm:w-48' }) => {
  return (
    <Link href="/" className={`inline-block focus:ring-0 focus:outline-hidden ${className}`}>
      {/* Logo pour le mode normal (dark logo) */}
      <Image
        src="/logo-initiative-dark.png"
        alt="Initiative Immobilier"
        width={400}
        height={120}
        className="h-auto w-full block dark:hidden"
        priority
      />
      {/* Logo pour le mode dark (light logo) */}
      <Image
        src="/logo-initiative-light.png"
        alt="Initiative Immobilier"
        width={400}
        height={120}
        className="h-auto w-full hidden dark:block"
        priority
      />
    </Link>
  )
}

export default Logo
