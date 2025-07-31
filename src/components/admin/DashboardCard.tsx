import React from 'react'
import { IconType } from 'react-icons'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  color?: 'indigo' | 'cyan' | 'green' | 'orange' | 'red' | 'purple'
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const colorClasses = {
  indigo: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'text-blue-100',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300'
  },
  cyan: {
    bg: 'from-cyan-500 to-cyan-600',
    icon: 'text-cyan-100',
    border: 'border-cyan-200 dark:border-cyan-800',
    text: 'text-cyan-700 dark:text-cyan-300'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    icon: 'text-green-100',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    icon: 'text-orange-100',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-300'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    icon: 'text-red-100',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300'
  },
  purple: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'text-blue-100',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300'
  }
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend,
  className = ''
}) => {
  const colors = colorClasses[color]

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border ${colors.border} hover:shadow-lg transition-all duration-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                vs mois dernier
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colors.bg} shadow-lg`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  )
}