'use client'

import React, { useState } from 'react'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { Order } from '@/lib/supabase/formations-types'
import { InvoiceGenerator } from '@/lib/invoice/invoice-generator'
import { toast } from 'react-hot-toast'

interface InvoiceDownloadButtonProps {
  order: Order
  variant?: 'button' | 'icon'
  className?: string
}

export const InvoiceDownloadButton: React.FC<InvoiceDownloadButtonProps> = ({ 
  order, 
  variant = 'button',
  className = '' 
}) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadInvoice = async () => {
    if (order.payment_status !== 'paid' || order.status === 'cancelled') {
      toast.error('La facture n\'est disponible que pour les commandes payées')
      return
    }

    setIsGenerating(true)
    
    try {
      // Générer la facture
      const generator = new InvoiceGenerator()
      const invoiceNumber = InvoiceGenerator.generateInvoiceNumber(order)
      const invoiceDate = order.payment_date ? new Date(order.payment_date) : new Date()
      
      const pdfBlob = generator.generateInvoice({
        order,
        invoiceNumber,
        invoiceDate
      })
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Facture_${invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Facture téléchargée avec succès')
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error)
      toast.error('Erreur lors de la génération de la facture')
    } finally {
      setIsGenerating(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDownloadInvoice}
        disabled={isGenerating}
        className={`p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Télécharger la facture"
      >
        <DocumentArrowDownIcon className={`h-5 w-5 ${isGenerating ? 'animate-pulse' : ''}`} />
      </button>
    )
  }

  return (
    <button
      onClick={handleDownloadInvoice}
      disabled={isGenerating}
      className={`inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <DocumentArrowDownIcon className={`h-4 w-4 mr-1.5 ${isGenerating ? 'animate-pulse' : ''}`} />
      {isGenerating ? 'Génération...' : 'Facture'}
    </button>
  )
}