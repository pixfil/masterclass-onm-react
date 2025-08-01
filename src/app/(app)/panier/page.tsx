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
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Mon <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Panier</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Finalisez votre inscription aux formations d'excellence en orthodontie neuro-musculaire
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <main className="relative">
        <CartPageContent />
      </main>
    </div>
  )
}