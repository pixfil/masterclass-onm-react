'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  TrashIcon, 
  ShoppingCartIcon, 
  CheckCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  AcademicCapIcon,
  TagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'react-hot-toast'

const CartPageContent = () => {
  const { cart, loading, removeFromCart, updateItemQuantity } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [discount, setDiscount] = useState(0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const handlePromoCode = () => {
    // Simulation de codes promo
    const promoCodes: Record<string, number> = {
      'ONM2025': 10,
      'CEPROF': 15,
      'MASTER': 20
    }

    if (promoCodes[promoCode.toUpperCase()]) {
      setDiscount(promoCodes[promoCode.toUpperCase()])
      setPromoApplied(true)
      toast.success(`Code promo appliqué : -${promoCodes[promoCode.toUpperCase()]}%`)
    } else {
      toast.error('Code promo invalide')
    }
  }

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0) || 0
  const discountAmount = promoApplied ? (subtotal * discount) / 100 : 0
  const tax = (subtotal - discountAmount) * 0.20
  const finalTotal = subtotal - discountAmount + tax

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[600px]">
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 font-semibold leading-6 text-sm shadow-lg rounded-full text-white bg-gradient-to-r from-blue-600 to-cyan-600 transition ease-in-out duration-150">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Chargement du panier...
          </div>
        </div>
      </div>
    )
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mb-8">
              <ShoppingCartIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Votre panier est vide</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Découvrez nos formations d'excellence en orthodontie neuro-musculaire et commencez votre parcours d'apprentissage
            </p>
            <Link href="/formations">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                Découvrir nos formations
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500" style={{ width: '33%' }}></div>
            
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                1
              </div>
              <span className="text-sm mt-2 font-medium text-gray-900 dark:text-white">Panier</span>
            </div>
            
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
                2
              </div>
              <span className="text-sm mt-2 text-gray-500 dark:text-gray-400">Paiement</span>
            </div>
            
            <div className="relative flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
                3
              </div>
              <span className="text-sm mt-2 text-gray-500 dark:text-gray-400">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Vos formations ({cart.items.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 shadow-md group">
                        {item.session?.formation?.featured_image ? (
                          <Image
                            src={item.session.formation.featured_image}
                            alt={item.session.formation.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <AcademicCapIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {item.session?.formation?.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>{item.session?.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>{new Date(item.session?.start_date || '').toLocaleDateString('fr-FR')} - {new Date(item.session?.end_date || '').toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>{item.session?.formation?.instructor?.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantité :</span>
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity >= (item.session?.available_spots || 0)}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              removeFromCart(item.id)
                              toast.success('Formation retirée du panier')
                            }}
                            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2 text-sm font-medium transition-colors duration-200"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Retirer
                          </button>
                        </div>
                      </div>

                      {/* Prix */}
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {formatPrice(item.price_at_time * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatPrice(item.price_at_time)} / personne
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avantages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 text-center">
                <ShieldCheckIcon className="w-10 h-10 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Paiement sécurisé</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transactions 100% sécurisées</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 text-center">
                <CheckCircleIcon className="w-10 h-10 mx-auto mb-3 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Garantie satisfaction</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">30 jours pour changer d'avis</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 text-center">
                <TruckIcon className="w-10 h-10 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Documents inclus</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Supports de cours offerts</p>
              </div>
            </div>
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <TagIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Résumé de commande
              </h3>

              {/* Code promo */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Code promotionnel</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Entrer un code"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    disabled={promoApplied}
                  />
                  <button
                    onClick={handlePromoCode}
                    disabled={promoApplied || !promoCode}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {promoApplied ? 'Appliqué' : 'Appliquer'}
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    Code promo appliqué : -{discount}%
                  </p>
                )}
              </div>

              {/* Totaux */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                
                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Réduction ({discount}%)</span>
                    <span className="font-medium text-green-600 dark:text-green-400">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">TVA (20%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(tax)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Frais de dossier</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Gratuit</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total TTC</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link href="/checkout-formations" className="block">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                    Procéder au paiement
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </Link>
                
                <Link href="/formations" className="block">
                  <button className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                    Continuer les achats
                  </button>
                </Link>
              </div>

              {/* Sécurité */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <LockClosedIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span>Paiement 100% sécurisé par LCL</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span>Garantie satisfaction ou remboursé</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span>Formation certifiante reconnue</span>
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

export default CartPageContent