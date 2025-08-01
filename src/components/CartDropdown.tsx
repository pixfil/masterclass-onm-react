'use client'

import React, { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import Image from 'next/image'
import Link from 'next/link'

interface CartDropdownProps {
  isScrolled?: boolean
}

const CartDropdown: React.FC<CartDropdownProps> = ({ isScrolled = true }) => {
  const { cart, itemsCount, total, removeFromCart, updateItemQuantity } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="relative group focus:outline-none p-2">
            <ShoppingCartIcon className={`w-5 h-5 transition-colors ${
              isScrolled 
                ? 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400' 
                : 'text-white group-hover:text-blue-200'
            }`} />
            {itemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                {itemsCount}
              </span>
            )}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-10 mt-4 w-80 px-4 sm:px-0">
              <div className="overflow-hidden rounded-2xl shadow-xl backdrop-blur-sm">
                <div className="relative bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-neutral-200/50 dark:border-neutral-700/50 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-full">
                        <ShoppingCartIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Mon panier</h3>
                      <span className="ml-auto px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">{itemsCount}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="max-h-96 overflow-y-auto">
                    {cart?.items && cart.items.length > 0 ? (
                      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {cart.items.map((item) => (
                          <div key={item.id} className="px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors duration-200">
                            <div className="flex gap-4">
                              {/* Image */}
                              <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600 shadow-md">
                                {item.session?.formation?.featured_image ? (
                                  <Image
                                    src={item.session.formation.featured_image}
                                    alt={item.session.formation.title}
                                    fill
                                    className="object-cover hover:scale-110 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    <ShoppingCartIcon className="w-8 h-8" />
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold truncate text-neutral-900 dark:text-white">
                                  {item.session?.formation?.title}
                                </h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  {item.session?.city} • {new Date(item.session?.start_date || '').toLocaleDateString('fr-FR')}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700 rounded-full p-1">
                                    <button
                                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                      className="w-7 h-7 rounded-full bg-white dark:bg-neutral-600 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-neutral-600 dark:text-neutral-300 hover:text-blue-600 transition-all duration-200 shadow-sm"
                                      disabled={item.quantity <= 1}
                                    >
                                      −
                                    </button>
                                    <span className="text-sm font-semibold w-8 text-center text-neutral-900 dark:text-white">{item.quantity}</span>
                                    <button
                                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                      className="w-7 h-7 rounded-full bg-white dark:bg-neutral-600 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-neutral-600 dark:text-neutral-300 hover:text-blue-600 transition-all duration-200 shadow-sm"
                                      disabled={item.quantity >= (item.session?.available_spots || 0)}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 text-right">
                              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatPrice(item.price_at_time * item.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <ShoppingCartIcon className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                        <p className="text-neutral-500 dark:text-neutral-400">
                          Votre panier est vide
                        </p>
                        <Link href="/formations">
                          <ButtonSecondary className="mt-4" sizeClass="px-4 py-2">
                            Découvrir nos formations
                          </ButtonSecondary>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Footer avec total et actions */}
                  {cart?.items && cart.items.length > 0 && (
                    <div className="px-6 py-5 border-t border-neutral-200/50 dark:border-neutral-700/50 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-700/50">
                      <div className="flex justify-between items-center mb-5 p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                        <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">Total TTC</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(total)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <Link href="/panier" className="block">
                          <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                            Voir le panier complet
                          </button>
                        </Link>
                        <Link href="/formations" className="block">
                          <button className="w-full bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium py-3 px-6 rounded-xl border border-neutral-200 dark:border-neutral-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                            Continuer les achats
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default CartDropdown