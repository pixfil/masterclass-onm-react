'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import Input from '@/shared/Input'

const CartPageContent = () => {
  const { cart, loading, total, removeFromCart, updateItemQuantity } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0) || 0
  const tax = subtotal * 0.20
  const shipping = 0 // Gratuit pour les formations
  const finalTotal = subtotal + tax + shipping

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-primary-500 transition ease-in-out duration-150">
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
      <div className="text-center py-16">
        <ShoppingCartIcon className="w-24 h-24 mx-auto text-neutral-400 mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Votre panier est vide</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          Découvrez nos formations en orthodontie neuro-musculaire
        </p>
        <Link href="/formations">
          <ButtonPrimary sizeClass="px-8 py-3">
            Découvrir nos formations
          </ButtonPrimary>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Liste des items */}
      <div className="lg:col-span-2 space-y-6">
        {cart.items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-6">
              {/* Image */}
              <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                {item.session?.formation?.featured_image ? (
                  <Image
                    src={item.session.formation.featured_image}
                    alt={item.session.formation.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <ShoppingCartIcon className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  {item.session?.formation?.title}
                </h3>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-1 mb-4">
                  <p>Ville : {item.session?.city}</p>
                  <p>Dates : {new Date(item.session?.start_date || '').toLocaleDateString('fr-FR')} - {new Date(item.session?.end_date || '').toLocaleDateString('fr-FR')}</p>
                  <p>Durée : {item.session?.formation?.duration_days} jours</p>
                  <p>Formateur : {item.session?.formation?.instructor?.name}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">Quantité :</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                        disabled={item.quantity >= (item.session?.available_spots || 0)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-600 flex items-center gap-2 text-sm"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Retirer
                  </button>
                </div>
              </div>

              {/* Prix */}
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  {formatPrice(item.price_at_time * item.quantity)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formatPrice(item.price_at_time)} / personne
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé de commande */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm sticky top-24">
          <h3 className="text-xl font-semibold mb-6">Résumé de commande</h3>

          {/* Code promo */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Code promo</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Entrer un code"
                className="flex-1"
              />
              <ButtonSecondary sizeClass="px-4">
                Appliquer
              </ButtonSecondary>
            </div>
          </div>

          {/* Totaux */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Sous-total</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">TVA (20%)</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Frais de dossier</span>
              <span className="font-medium text-green-600">Gratuit</span>
            </div>
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total TTC</span>
                <span className="text-2xl font-bold text-primary-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/checkout" className="block">
              <ButtonPrimary className="w-full" sizeClass="px-6 py-3">
                Procéder au paiement
              </ButtonPrimary>
            </Link>
            <Link href="/formations" className="block">
              <ButtonSecondary className="w-full" sizeClass="px-6 py-3">
                Continuer les achats
              </ButtonSecondary>
            </Link>
          </div>

          {/* Sécurité */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Paiement 100% sécurisé
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Garantie satisfaction
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPageContent