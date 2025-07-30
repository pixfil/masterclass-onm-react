import React from 'react'
import { Metadata } from 'next'
import CartPageContent from './CartPageContent'

export const metadata: Metadata = {
  title: 'Mon panier | Masterclass ONM',
  description: 'Finalisez votre inscription aux formations en orthodontie neuro-musculaire',
}

export default function CartPage() {
  return (
    <div className="nc-CartPage">
      <main className="container relative overflow-hidden">
        <div className="max-w-5xl mx-auto py-24">
          <h1 className="text-3xl lg:text-4xl font-semibold mb-8">Mon panier</h1>
          <CartPageContent />
        </div>
      </main>
    </div>
  )
}