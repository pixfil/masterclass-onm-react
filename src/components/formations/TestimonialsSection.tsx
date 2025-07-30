'use client'

import React from 'react'
import Heading from '@/shared/Heading'
import { StarIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

const testimonials = [
  {
    id: 1,
    name: 'Dr. Antoine Leroy',
    profession: 'Orthodontiste - Paris',
    rating: 5,
    comment: 'Une formation exceptionnelle qui a transformé ma pratique. Les concepts ONM sont expliqués avec clarté et les cas cliniques sont très pertinents.',
    formation: 'Initiation à l\'ONM',
    photo: '/images/testimonial-1.jpg'
  },
  {
    id: 2,
    name: 'Dr. Julie Roux',
    profession: 'Dentiste - Lyon',
    rating: 5,
    comment: 'L\'approche pédagogique est remarquable. J\'ai pu immédiatement appliquer les techniques apprises dans mon cabinet.',
    formation: 'Diagnostic neuro-musculaire',
    photo: '/images/testimonial-2.jpg'
  },
  {
    id: 3,
    name: 'Dr. Michel Blanc',
    profession: 'Orthodontiste - Bordeaux',
    rating: 5,
    comment: 'Formateurs passionnés et compétents. Le niveau d\'expertise partagé est exceptionnel. Je recommande vivement.',
    formation: 'Perfectionnement ONM',
    photo: '/images/testimonial-3.jpg'
  }
]

const TestimonialsSection = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <StarIcon 
        key={index} 
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  return (
    <div className="nc-TestimonialsSection relative py-16 bg-neutral-50 dark:bg-neutral-800/30 rounded-3xl">
      <div className="px-6">
        <Heading
          desc="Découvrez les retours de praticiens formés à l'orthodontie neuro-musculaire"
          isCenter
        >
          Témoignages de nos participants
        </Heading>

        <div className="grid md:grid-cols-3 gap-8 mt-10">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.photo}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {testimonial.profession}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {renderStars(testimonial.rating)}
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 italic mb-4">
                "{testimonial.comment}"
              </p>

              <p className="text-sm text-primary-600 font-medium">
                Formation : {testimonial.formation}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
            <div>
              <div className="text-3xl font-bold text-primary-600">4.9/5</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Note moyenne</p>
            </div>
            <div className="w-px h-12 bg-primary-200 dark:bg-primary-800" />
            <div>
              <div className="text-3xl font-bold text-primary-600">98%</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Satisfaction</p>
            </div>
            <div className="w-px h-12 bg-primary-200 dark:bg-primary-800" />
            <div>
              <div className="text-3xl font-bold text-primary-600">2500+</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Praticiens formés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestimonialsSection