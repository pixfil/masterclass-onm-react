'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  CheckCircleIcon, 
  CreditCardIcon, 
  LockClosedIcon,
  ShieldCheckIcon,
  TruckIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapIcon,
  IdentificationIcon,
  CheckBadgeIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const CheckoutFormationsPage = () => {
  const router = useRouter()
  const { cart, itemsCount, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState('card')
  
  // Informations de facturation
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    profession: 'Orthodontiste',
    address: '',
    postalCode: '',
    city: '',
    country: 'France',
    rpps: ''
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0) || 0
  const tax = subtotal * 0.20
  const finalTotal = subtotal + tax

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!acceptTerms) {
      toast.error('Veuillez accepter les conditions générales de vente')
      return
    }

    setLoading(true)
    
    try {
      // Créer la commande dans la base de données
      const orderData = {
        user_id: null, // TODO: Récupérer l'ID utilisateur si connecté
        items: cart.items.map(item => ({
          session_id: item.session_id,
          quantity: item.quantity,
          unit_price: item.price_at_time,
          formation_title: item.session?.formation?.title || '',
          formation_dates: `${new Date(item.session?.start_date || '').toLocaleDateString('fr-FR')} - ${new Date(item.session?.end_date || '').toLocaleDateString('fr-FR')}`
        })),
        subtotal_amount: subtotal,
        tax_amount: tax,
        discount_amount: 0,
        total_amount: finalTotal,
        billing_address: {
          firstName: billingInfo.firstName,
          lastName: billingInfo.lastName,
          email: billingInfo.email,
          phone: billingInfo.phone,
          company: billingInfo.company,
          address: billingInfo.address,
          postalCode: billingInfo.postalCode,
          city: billingInfo.city,
          country: billingInfo.country
        },
        payment_method: selectedPayment
      }

      // Créer la commande via l'API
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!orderResponse.ok) {
        throw new Error('Erreur création commande')
      }

      const { order } = await orderResponse.json()

      if (selectedPayment === 'card') {
        // Paiement par carte - Redirection vers Sherlock's
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = '/api/sherlocks/request'
        form.target = '_self'

        const fields = {
          orderId: order.order_number,
          amount: finalTotal,
          customerData: JSON.stringify({
            email: billingInfo.email,
            firstName: billingInfo.firstName,
            lastName: billingInfo.lastName,
            phone: billingInfo.phone,
            address: billingInfo.address,
            zipCode: billingInfo.postalCode,
            city: billingInfo.city
          })
        }

        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value.toString()
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      } else {
        // Paiement par virement
        clearCart()
        router.push(`/pay-done?type=formation&order=${order.order_number}&method=transfer`)
      }
      
    } catch (error) {
      console.error('Erreur paiement:', error)
      toast.error('Une erreur est survenue lors du traitement')
      setLoading(false)
    }
  }

  if (!cart || itemsCount === 0) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          
          <div className="relative container mx-auto px-4 py-24">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Finalisation de <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">commande</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12">
            <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Votre panier est vide</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Découvrez nos formations pour commencer votre parcours
            </p>
            <Link href="/formations">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                Voir nos formations
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="nc-CheckoutFormationsPage">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Finalisation de <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">commande</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Dernière étape avant de valider votre inscription aux formations
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500" style={{ width: '66%' }}></div>
              
              <div className="relative flex flex-col items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <span className="text-sm mt-2 font-medium text-gray-900 dark:text-white">Panier</span>
              </div>
              
              <div className="relative flex flex-col items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  2
                </div>
                <span className="text-sm mt-2 font-medium text-gray-900 dark:text-white">Paiement</span>
              </div>
              
              <div className="relative flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
                  3
                </div>
                <span className="text-sm mt-2 text-gray-500 dark:text-gray-400">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Back to cart */}
          <Link href="/panier" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors duration-200">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Retour au panier</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulaire principal */}
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit}>
                {/* Informations personnelles */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      Informations personnelles
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Prénom <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={billingInfo.firstName}
                            onChange={handleInputChange('firstName')}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={billingInfo.lastName}
                            onChange={handleInputChange('lastName')}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={billingInfo.email}
                            onChange={handleInputChange('email')}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <EnvelopeIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            value={billingInfo.phone}
                            onChange={handleInputChange('phone')}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <PhoneIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Société <span className="text-gray-400 text-xs">(optionnel)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={billingInfo.company}
                            onChange={handleInputChange('company')}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <BuildingOfficeIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          N° RPPS <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={billingInfo.rpps}
                            onChange={handleInputChange('rpps')}
                            placeholder="11 chiffres"
                            maxLength={11}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <IdentificationIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adresse de facturation */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <MapIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      Adresse de facturation
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Adresse <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={billingInfo.address}
                            onChange={handleInputChange('address')}
                            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <MapPinIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Code postal <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={billingInfo.postalCode}
                            onChange={handleInputChange('postalCode')}
                            maxLength={5}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ville <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={billingInfo.city}
                            onChange={handleInputChange('city')}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pays
                          </label>
                          <input
                            type="text"
                            value={billingInfo.country}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Méthode de paiement */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <CreditCardIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      Méthode de paiement
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Option Carte bancaire */}
                      <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedPayment === 'card' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={selectedPayment === 'card'}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedPayment === 'card' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedPayment === 'card' && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <CreditCardIcon className="w-8 h-8 text-gray-600 dark:text-gray-400 mr-3" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Carte bancaire</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Paiement sécurisé via LCL Sherlocks</p>
                          </div>
                        </div>
                      </label>

                      {/* Option Virement */}
                      <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedPayment === 'transfer' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="transfer"
                          checked={selectedPayment === 'transfer'}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedPayment === 'transfer' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedPayment === 'transfer' && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <DocumentTextIcon className="w-8 h-8 text-gray-600 dark:text-gray-400 mr-3" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Virement bancaire</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Paiement sous 48h</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Sécurité */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-200">Paiement 100% sécurisé</p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Vos informations de paiement sont protégées par un cryptage SSL 256 bits et la technologie 3D Secure.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditions et validation */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        J'accepte les{' '}
                        <Link href="/cgv" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                          conditions générales de vente
                        </Link>{' '}
                        et la{' '}
                        <Link href="/politique-confidentialite" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                          politique de confidentialité
                        </Link>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newsletter}
                        onChange={(e) => setNewsletter(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Je souhaite recevoir les actualités et offres spéciales de Masterclass ONM
                      </span>
                    </label>
                  </div>
                  
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={loading || !acceptTerms}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl shadow-lg transition-all duration-200 ${
                        loading || !acceptTerms
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="w-5 h-5" />
                          Procéder au paiement sécurisé
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl sticky top-24">
                <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingCartIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    Résumé de commande
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                          {item.session?.formation?.featured_image ? (
                            <Image
                              src={item.session.formation.featured_image}
                              alt={item.session.formation.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <AcademicCapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                            {item.session?.formation?.title}
                          </h4>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              <span>{item.session?.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>{new Date(item.session?.start_date || '').toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {item.quantity} × {formatPrice(item.price_at_time)}
                            </span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(item.price_at_time * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sous-total HT</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal / 1.2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Frais de dossier</span>
                      <span className="font-medium text-green-600 dark:text-green-400">Gratuit</span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-end">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Total TTC</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {formatPrice(finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Avantages inclus */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckBadgeIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200 text-sm">Inclus dans votre inscription :</p>
                        <ul className="mt-2 space-y-1 text-xs text-green-700 dark:text-green-300">
                          <li className="flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Supports de formation numériques
                          </li>
                          <li className="flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Certificat de participation
                          </li>
                          <li className="flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Accès au groupe privé CEPROF
                          </li>
                          <li className="flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Pauses café et déjeuner inclus
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Garanties */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <LockClosedIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Paiement sécurisé SSL 256 bits</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <ShieldCheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>Garantie satisfaction 30 jours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutFormationsPage