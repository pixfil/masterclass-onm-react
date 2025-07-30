'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/shared/Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
}

export const BackButton = ({ 
  href, 
  label = 'Retour', 
  className = '', 
  variant = 'outline' 
}: BackButtonProps) => {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size="sm"
      className={`flex items-center gap-2 bg-white/90 backdrop-blur-sm shadow-lg border-neutral-300 hover:bg-white hover:shadow-xl transition-all duration-200 ${className}`}
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {label}
    </Button>
  )
}