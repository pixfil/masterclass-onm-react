import ButtonSecondary from '@/shared/ButtonSecondary'
import { Link } from '@/shared/link'
import Image from 'next/image'
import { FC } from 'react'
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline'

interface FormationCardProps {
  className?: string
  formation?: {
    title: string
    date: string
    city: string
    price: number
    href: string
    image?: string
  }
}

const FormationCard: FC<FormationCardProps> = ({ className = '', formation }) => {
  // Formation par défaut si aucune n'est fournie
  const defaultFormation = {
    title: "Formation ONM Niveau 1",
    date: "3-5 Octobre 2025",
    city: "Paris",
    price: 2500,
    href: "/formations",
    image: "/images/formation-default.svg"
  }

  const data = formation || defaultFormation

  return (
    <div className={className}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 p-6 h-full">
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="relative z-10">
          <div className="text-white mb-4">
            <p className="text-sm font-medium mb-1">Prochaine session</p>
            <h3 className="text-2xl font-bold mb-3">{data.title}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>{data.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="w-4 h-4" />
                <span>{data.city}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-3xl font-bold">{data.price} €</p>
              <p className="text-sm opacity-90">Places limitées</p>
            </div>
          </div>
          
          <ButtonSecondary 
            className="w-full bg-white text-orange-600 hover:bg-orange-50 border-0" 
            href={data.href}
          >
            En savoir plus
          </ButtonSecondary>
        </div>
      </div>
    </div>
  )
}

export default FormationCard