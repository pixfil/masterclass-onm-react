'use client'

import React, { useState } from 'react'
import { Formation } from '@/lib/supabase/formations-types'
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, ClockIcon, CurrencyEuroIcon, CalendarIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import FormationPopup from './FormationPopup'
import { useRouter } from 'next/navigation'

interface FormationCalendarProps {
  formations: Formation[]
}

export default function FormationCalendar({ formations }: FormationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)) // Octobre 2025 par défaut
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const router = useRouter()
  
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                     'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }
  
  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment))
  }
  
  // Récupérer toutes les formations qui ont lieu pendant le mois actuel
  const getFormationsForMonth = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    return formations.filter(formation => {
      if (!formation.start_date || !formation.end_date) return false
      
      const startDate = new Date(formation.start_date)
      const endDate = new Date(formation.end_date)
      
      // Vérifier si la formation a lieu pendant ce mois
      return (startDate <= monthEnd && endDate >= monthStart)
    })
  }
  
  // Créer un objet avec toutes les dates où il y a des formations
  const getFormationDates = () => {
    const dates: { [key: number]: Formation[] } = {}
    const formationsThisMonth = getFormationsForMonth()
    
    formationsThisMonth.forEach(formation => {
      if (!formation.start_date || !formation.end_date) return
      
      const startDate = new Date(formation.start_date)
      const endDate = new Date(formation.end_date)
      
      // Pour chaque jour entre start et end
      const current = new Date(startDate)
      while (current <= endDate) {
        if (current.getMonth() === currentDate.getMonth() && 
            current.getFullYear() === currentDate.getFullYear()) {
          const day = current.getDate()
          if (!dates[day]) dates[day] = []
          
          // Éviter les doublons
          if (!dates[day].find(f => f.id === formation.id)) {
            dates[day].push(formation)
          }
        }
        current.setDate(current.getDate() + 1)
      }
    })
    
    return dates
  }
  
  const formationDates = getFormationDates()
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  
  // Créer le calendrier
  const calendar = []
  
  // Jours vides au début
  for (let i = 0; i < firstDay; i++) {
    calendar.push(null)
  }
  
  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    calendar.push({ 
      day, 
      formations: formationDates[day] || [],
      isToday: false // Pour styling futur
    })
  }
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendrier */}
        <div className="grid grid-cols-7 gap-2">
          {calendar.map((dayData, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 rounded-lg border transition-all ${
                dayData 
                  ? dayData.formations.length > 0
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                  : 'border-transparent'
              }`}
            >
              {dayData && (
                <>
                  <div className="font-medium text-sm text-neutral-700 dark:text-neutral-300 mb-1">
                    {dayData.day}
                  </div>
                  
                  {dayData.formations.length > 0 && (
                    <div className="space-y-1">
                      {dayData.formations.slice(0, 1).map((formation, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedFormation(formation)
                            setShowPopup(true)
                          }}
                          className="w-full text-left p-1.5 rounded bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all group transform hover:scale-105"
                        >
                          <p className="text-xs font-medium text-white truncate group-hover:text-white/90">
                            {formation.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {typeof formation.instructor === 'object' && formation.instructor?.name && (
                              <div className="flex items-center gap-1">
                                <AcademicCapIcon className="w-3 h-3 text-white/80" />
                                <p className="text-xs text-white/80 truncate">
                                  {formation.instructor.name}
                                </p>
                              </div>
                            )}
                            <p className="text-xs font-bold text-white ml-auto">
                              {formation.price}€
                            </p>
                          </div>
                        </button>
                      ))}
                      
                      {dayData.formations.length > 1 && (
                        <button
                          onClick={() => {
                            setSelectedFormation(dayData.formations[0])
                            setShowPopup(true)
                          }}
                          className="w-full text-xs text-blue-600 dark:text-blue-400 text-center hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          +{dayData.formations.length - 1} autre{dayData.formations.length > 2 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Légende et formations du mois */}
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Formations ce mois-ci
          </h4>
          
          <div className="space-y-3">
            {getFormationsForMonth().map((formation) => (
              <button
                key={formation.id}
                onClick={() => {
                  setSelectedFormation(formation)
                  setShowPopup(true)
                }}
                className="w-full text-left p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {formation.title}
                    </h5>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {formation.start_date && new Date(formation.start_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short'
                        })} - {formation.end_date && new Date(formation.end_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {formation.duration_days} jour{formation.duration_days > 1 ? 's' : ''}
                      </span>
                      {typeof formation.instructor === 'object' && formation.instructor?.name && (
                        <span className="flex items-center gap-1">
                          <AcademicCapIcon className="w-4 h-4" />
                          {formation.instructor.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formation.price} €
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Cliquez pour voir
                    </p>
                  </div>
                </div>
              </button>
            ))}
            
            {getFormationsForMonth().length === 0 && (
              <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                Aucune formation prévue ce mois-ci
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Popup */}
      {selectedFormation && (
        <FormationPopup
          formation={selectedFormation}
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false)
            setSelectedFormation(null)
          }}
          onAddToCart={(formation) => {
            // Ajouter au panier
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
            const existingItem = currentCart.find((item: any) => item.id === formation.id)
            
            if (!existingItem) {
              currentCart.push({
                id: formation.id,
                title: formation.title,
                price: formation.price,
                quantity: 1,
                start_date: formation.start_date,
                end_date: formation.end_date,
                slug: formation.slug
              })
              localStorage.setItem('cart', JSON.stringify(currentCart))
              
              // Dispatch event pour mettre à jour le compteur du panier
              window.dispatchEvent(new Event('cartUpdated'))
            }
            
            // Rediriger vers le panier
            router.push('/panier')
          }}
        />
      )}
    </div>
  )
}