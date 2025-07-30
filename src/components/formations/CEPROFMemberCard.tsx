'use client'

import React from 'react'
import Image from 'next/image'
import { MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/shared/Badge'

interface CEPROFMemberCardProps {
  member: {
    id: string
    name: string
    title: string
    profession: string
    speciality: string
    bio: string
    photo_url: string
    city: string
    contributions: string[]
  }
}

const CEPROFMemberCard: React.FC<CEPROFMemberCardProps> = ({ member }) => {
  return (
    <div className="nc-CEPROFMemberCard bg-white dark:bg-neutral-900 rounded-2xl p-4 hover:shadow-lg transition-all group">
      <div className="relative h-48 w-full mb-4 rounded-xl overflow-hidden">
        <Image
          src={member.photo_url}
          alt={member.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <Badge name="CEPROF" color="green" />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{member.name}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {member.title}
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1">
            <BriefcaseIcon className="w-4 h-4" />
            <span>{member.profession}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-4 h-4" />
            <span>{member.city}</span>
          </div>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {member.bio}
        </p>

        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
            Contributions ONM :
          </p>
          <div className="space-y-1">
            {member.contributions.slice(0, 2).map((contrib, index) => (
              <p key={index} className="text-xs text-primary-600 dark:text-primary-400">
                • {contrib}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CEPROFMemberCard