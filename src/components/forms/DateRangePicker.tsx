'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  minDate?: string
  maxDate?: string
  required?: boolean
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  required = false
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [selectingEndDate, setSelectingEndDate] = useState(false)

  // Si on a déjà des dates, afficher le mois de la date de début
  useEffect(() => {
    if (startDate) {
      setCurrentMonth(new Date(startDate))
    }
  }, [])

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    const start = new Date(startDate)
    const end = new Date(endDate)
    return date >= start && date <= end
  }

  const isInHoverRange = (date: Date) => {
    if (!startDate || !hoverDate || selectingEndDate) return false
    const start = new Date(startDate)
    return date >= start && date <= hoverDate
  }

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateForInput(date)
    
    if (!startDate || (startDate && endDate) || selectingEndDate === false) {
      // Première sélection ou reset
      onStartDateChange(dateStr)
      onEndDateChange('')
      setSelectingEndDate(true)
    } else {
      // Sélection de la date de fin
      const start = new Date(startDate)
      if (date >= start) {
        onEndDateChange(dateStr)
        setSelectingEndDate(false)
      } else {
        // Si la date de fin est avant la date de début, inverser
        onStartDateChange(dateStr)
        onEndDateChange(startDate)
        setSelectingEndDate(false)
      }
    }
  }

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment))
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Jours vides au début
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dateStr = formatDateForInput(date)
      const isStart = startDate && isSameDay(date, new Date(startDate))
      const isEnd = endDate && isSameDay(date, new Date(endDate))
      const isSelected = isStart || isEnd
      const inRange = isInRange(date)
      const inHoverRange = isInHoverRange(date)
      const isToday = isSameDay(date, new Date())
      
      // Vérifier si la date est désactivée
      let isDisabled = false
      if (minDate && date < new Date(minDate)) isDisabled = true
      if (maxDate && date > new Date(maxDate)) isDisabled = true

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateClick(date)}
          onMouseEnter={() => !isDisabled && setHoverDate(date)}
          onMouseLeave={() => setHoverDate(null)}
          disabled={isDisabled}
          className={`
            h-10 rounded-lg border relative transition-all
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
            ${isSelected ? 'bg-blue-600 text-white border-blue-600 font-semibold' : ''}
            ${inRange && !isSelected ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200' : ''}
            ${inHoverRange && !inRange && !isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            ${!isSelected && !inRange && !inHoverRange ? 'border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700' : ''}
            ${isToday && !isSelected ? 'font-bold text-blue-600 dark:text-blue-400' : ''}
            ${isStart ? 'rounded-r-none' : ''}
            ${isEnd ? 'rounded-l-none' : ''}
            ${inRange && !isStart && !isEnd ? 'rounded-none' : ''}
          `}
        >
          {day}
          {isStart && (
            <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
              Début
            </span>
          )}
          {isEnd && (
            <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
              Fin
            </span>
          )}
        </button>
      )
    }

    return days
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendrier */}
      <div className="grid grid-cols-7 gap-1 mb-8">
        {renderCalendar()}
      </div>

      {/* Instructions */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
          {!startDate || (startDate && endDate) || !selectingEndDate
            ? "👆 Cliquez pour sélectionner la date de début"
            : "👆 Cliquez maintenant pour sélectionner la date de fin"}
        </p>
        
        {/* Affichage des dates sélectionnées */}
        {(startDate || endDate) && (
          <div className="mt-3 flex items-center justify-center gap-4 text-sm">
            {startDate && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-600 dark:text-neutral-400">Début:</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {new Date(startDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
            {endDate && (
              <>
                <span className="text-neutral-400">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-600 dark:text-neutral-400">Fin:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {new Date(endDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}