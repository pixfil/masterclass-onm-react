'use client'

import React, { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import Image from 'next/image'
import Link from 'next/link'

const CartDropdown = () => {
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
          <Popover.Button className="relative p-2 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none">
            <ShoppingCartIcon className="w-6 h-6" />
            {itemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
            <Popover.Panel className="absolute right-0 z-10 mt-3 w-96 px-4 sm:px-0">
              <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5">
                <div className="relative bg-white dark:bg-neutral-800">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold">Mon panier ({itemsCount})</h3>
                  </div>

                  {/* Items */}
                  <div className="max-h-96 overflow-y-auto">
                    {cart?.items && cart.items.length > 0 ? (
                      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {cart.items.map((item) => (
                          <div key={item.id} className="px-6 py-4">
                            <div className="flex gap-4">
                              {/* Image */}
                              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                                {item.session?.formation?.featured_image ? (
                                  <Image
                                    src={item.session.formation.featured_image}
                                    alt={item.session.formation.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    <ShoppingCartIcon className="w-8 h-8" />
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate">
                                  {item.session?.formation?.title}
                                </h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                  {item.session?.city} - {new Date(item.session?.start_date || '').toLocaleDateString('fr-FR')}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                      className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                      disabled={item.quantity <= 1}
                                    >
                                      -
                                    </button>
                                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                    <button
                                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                      className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                      disabled={item.quantity >= (item.session?.available_spots || 0)}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-right">
                              <span className="text-sm font-semibold">
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
                    <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total TTC</span>
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(total)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Link href="/panier" className="block">
                          <ButtonPrimary className="w-full">
                            Voir le panier
                          </ButtonPrimary>
                        </Link>
                        <Link href="/formations" className="block">
                          <ButtonSecondary className="w-full">
                            Continuer les achats
                          </ButtonSecondary>
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