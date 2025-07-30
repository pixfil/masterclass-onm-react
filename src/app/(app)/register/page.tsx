'use client'

import { UnifiedRegistrationForm } from '@/components/UnifiedRegistrationForm'
import { Heading } from '@/shared/Heading'

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Heading level={1} className="mb-4">
          Rejoignez Initiative Immobilier
        </Heading>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Créez votre compte pour accéder à nos services immobiliers. 
          Que vous soyez client à la recherche du bien idéal ou professionnel de l'immobilier, 
          nous avons la solution adaptée à vos besoins.
        </p>
      </div>
      
      <UnifiedRegistrationForm />
    </div>
  )
}