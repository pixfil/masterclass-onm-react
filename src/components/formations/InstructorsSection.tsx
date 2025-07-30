'use client'

import React from 'react'
import Heading from '@/shared/Heading'
import InstructorCard from './InstructorCard'

// Données temporaires en attendant le chargement depuis la base
const instructors = [
  {
    id: '1',
    name: 'Dr. Jean Dupont',
    title: 'Orthodontiste spécialisé ONM',
    bio: 'Expert en orthodontie neuro-musculaire avec 15 ans d\'expérience',
    specialties: ['ONM', 'Orthodontie'],
    photo_url: '/images/instructor-1.jpg',
    rating: 4.8,
    formations_count: 12,
    total_students: 450
  },
  {
    id: '2',
    name: 'Dr. Marie Martin',
    title: 'Spécialiste en rééducation',
    bio: 'Pionnière de la rééducation oro-faciale',
    specialties: ['Rééducation', 'Orthophonie'],
    photo_url: '/images/instructor-2.jpg',
    rating: 4.9,
    formations_count: 8,
    total_students: 320
  },
  {
    id: '3',
    name: 'Dr. Pierre Bernard',
    title: 'Expert en diagnostic ONM',
    bio: 'Formateur certifié en diagnostic neuro-musculaire',
    specialties: ['Diagnostic', 'Imagerie'],
    photo_url: '/images/instructor-3.jpg',
    rating: 4.7,
    formations_count: 15,
    total_students: 580
  }
]

const InstructorsSection = () => {
  return (
    <div className="nc-InstructorsSection relative py-16 bg-neutral-50 dark:bg-neutral-800/30 rounded-3xl">
      <div className="px-6">
        <Heading
          desc="Apprenez auprès des meilleurs experts en orthodontie neuro-musculaire"
          isCenter
        >
          Nos formateurs d'excellence
        </Heading>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default InstructorsSection