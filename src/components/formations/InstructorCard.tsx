'use client'

import React from 'react'
import Image from 'next/image'
import { StarIcon, AcademicCapIcon, UsersIcon } from '@heroicons/react/24/solid'
import { Badge } from '@/shared/Badge'
import ButtonSecondary from '@/shared/ButtonSecondary'

interface InstructorCardProps {
  instructor: {
    id: string
    name: string
    title: string
    bio: string
    specialties: string[]
    photo_url: string
    rating: number
    formations_count: number
    total_students: number
  }
}

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor }) => {
  return (
    <div className="nc-InstructorCard bg-white dark:bg-neutral-900 rounded-3xl p-6 hover:shadow-xl transition-shadow">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <Image
            src={instructor.photo_url}
            alt={instructor.name}
            fill
            className="object-cover rounded-full"
          />
        </div>

        <h3 className="text-xl font-semibold">{instructor.name}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {instructor.title}
        </p>

        <div className="flex items-center justify-center gap-1 mt-3">
          <StarIcon className="w-5 h-5 text-yellow-400" />
          <span className="font-medium">{instructor.rating}</span>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 line-clamp-2">
          {instructor.bio}
        </p>

        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {instructor.specialties.map((specialty) => (
            <Badge key={specialty} name={specialty} color="blue" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary-600">
              <AcademicCapIcon className="w-4 h-4" />
              <span className="font-semibold">{instructor.formations_count}</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Formations</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary-600">
              <UsersIcon className="w-4 h-4" />
              <span className="font-semibold">{instructor.total_students}</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Participants</p>
          </div>
        </div>

        <ButtonSecondary 
          href={`/formateurs/${instructor.id}`}
          className="mt-6 w-full"
          sizeClass="py-2.5"
        >
          Voir le profil
        </ButtonSecondary>
      </div>
    </div>
  )
}

export default InstructorCard