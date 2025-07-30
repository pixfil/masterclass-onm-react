'use client'

import React from 'react'
import Heading from '@/shared/Heading'
import CEPROFMemberCard from './CEPROFMemberCard'
import ButtonPrimary from '@/shared/ButtonPrimary'

// Données temporaires
const ceprofMembers = [
  {
    id: '1',
    name: 'Dr. Sophie Durand',
    title: 'Kinésithérapeute spécialisée',
    profession: 'Kinésithérapeute',
    speciality: 'Rééducation oro-faciale',
    bio: 'Experte en rééducation des troubles oro-faciaux chez l\'enfant et l\'adulte',
    photo_url: '/images/ceprof-1.jpg',
    city: 'Lyon',
    contributions: ['Protocoles de rééducation ONM', 'Formation des praticiens']
  },
  {
    id: '2',
    name: 'Dr. Laurent Petit',
    title: 'Ostéopathe D.O.',
    profession: 'Ostéopathe',
    speciality: 'Ostéopathie cranio-sacrée',
    bio: 'Spécialiste des dysfonctions cranio-mandibulaires',
    photo_url: '/images/ceprof-2.jpg',
    city: 'Paris',
    contributions: ['Approche holistique ONM', 'Techniques manuelles complémentaires']
  },
  {
    id: '3',
    name: 'Dr. Claire Moreau',
    title: 'Orthophoniste',
    profession: 'Orthophoniste',
    speciality: 'Troubles de la déglutition',
    bio: 'Rééducation des fonctions oro-myo-faciales',
    photo_url: '/images/ceprof-3.jpg',
    city: 'Bordeaux',
    contributions: ['Diagnostic fonctionnel', 'Exercices de rééducation']
  },
  {
    id: '4',
    name: 'Dr. Marc Dubois',
    title: 'Chirurgien-dentiste',
    profession: 'Chirurgien-dentiste',
    speciality: 'Occlusodontie',
    bio: 'Expert en réhabilitation occlusale globale',
    photo_url: '/images/ceprof-4.jpg',
    city: 'Marseille',
    contributions: ['Équilibration occlusale', 'Gouttières thérapeutiques']
  }
]

const CEPROFSection = () => {
  return (
    <div className="nc-CEPROFSection relative py-16">
      <Heading
        desc="Des spécialistes pluridisciplinaires contribuant à l'excellence de l'orthodontie neuro-musculaire"
        isCenter
      >
        CEPROF - Cercle d'Experts
      </Heading>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {ceprofMembers.map((member) => (
          <CEPROFMemberCard key={member.id} member={member} />
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-3xl mx-auto">
          Le CEPROF rassemble des professionnels de santé d'horizons variés, 
          tous unis par leur expertise en orthodontie neuro-musculaire et leur 
          engagement dans la formation continue.
        </p>
        
        <ButtonPrimary href="/ceprof">
          Découvrir tous les membres CEPROF
        </ButtonPrimary>
      </div>
    </div>
  )
}

export default CEPROFSection