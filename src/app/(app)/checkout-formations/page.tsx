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
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import Input from '@/shared/Input'
import Checkbox from '@/shared/Checkbox'
import { toast } from 'react-hot-toast'

const CheckoutFormationsPage = () => {
  const router = useRouter()
  const { cart, itemsCount, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  
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
      // Ici on intégrerait l'API LCL Sherlocks
      // Pour la démo, on simule un paiement réussi
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Succès du paiement
      clearCart()
      router.push('/pay-done?type=formation')
      
    } catch (error) {
      console.error('Erreur paiement:', error)
      toast.error('Une erreur est survenue lors du paiement')
    } finally {
      setLoading(false)
    }
  }

  if (!cart || itemsCount === 0) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">Votre panier est vide</h2>
        <Link href="/formations">
          <ButtonPrimary>Voir nos formations</ButtonPrimary>
        </Link>
      </div>
    )
  }

  return (
    <div className="nc-CheckoutFormationsPage">
      <div className="container py-10 lg:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Finalisation de votre commande</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Dernière étape avant de valider votre inscription
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit}>
              {/* Informations personnelles */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl mb-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <InformationCircleIcon className="w-6 h-6 text-primary-600" />
                  Informations personnelles
                </h3>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <Input
                    label="Prénom"
                    required
                    value={billingInfo.firstName}
                    onChange={handleInputChange('firstName')}
                  />
                  <Input
                    label="Nom"
                    required
                    value={billingInfo.lastName}
                    onChange={handleInputChange('lastName')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={billingInfo.email}
                    onChange={handleInputChange('email')}
                  />
                  <Input
                    label="Téléphone"
                    type="tel"
                    required
                    value={billingInfo.phone}
                    onChange={handleInputChange('phone')}
                  />
                  <Input
                    label="Société (optionnel)"
                    value={billingInfo.company}
                    onChange={handleInputChange('company')}
                  />
                  <Input
                    label="N° RPPS"
                    required
                    value={billingInfo.rpps}
                    onChange={handleInputChange('rpps')}
                    placeholder="Numéro RPPS à 11 chiffres"
                  />
                </div>
              </div>

              {/* Adresse de facturation */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl mb-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <TruckIcon className="w-6 h-6 text-primary-600" />
                  Adresse de facturation
                </h3>
                
                <div className="space-y-5">
                  <Input
                    label="Adresse"
                    required
                    value={billingInfo.address}
                    onChange={handleInputChange('address')}
                  />
                  <div className="grid md:grid-cols-3 gap-5">
                    <Input
                      label="Code postal"
                      required
                      value={billingInfo.postalCode}
                      onChange={handleInputChange('postalCode')}
                    />
                    <Input
                      label="Ville"
                      required
                      value={billingInfo.city}
                      onChange={handleInputChange('city')}
                    />
                    <Input
                      label="Pays"
                      value={billingInfo.country}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Méthode de paiement */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl mb-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <CreditCardIcon className="w-6 h-6 text-primary-600" />
                  Paiement sécurisé
                </h3>
                
                <div className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <LockClosedIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Paiement sécurisé par LCL Sherlocks avec 3D Secure
                    </span>
                  </div>
                  
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Vous allez être redirigé vers la plateforme de paiement sécurisée de notre partenaire bancaire LCL.
                  </p>
                  
                  <div className="flex gap-3">
                    <Image 
                      src="/lcl-logo.png" 
                      alt="LCL" 
                      width={60} 
                      height={24}
                      className="opacity-60"
                    />
                    <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl">
                <Checkbox
                  name="terms"
                  label={
                    <span>
                      J'accepte les{' '}
                      <Link href="/cgv" className="text-primary-600 hover:underline">
                        conditions générales de vente
                      </Link>{' '}
                      et la{' '}
                      <Link href="/politique-confidentialite" className="text-primary-600 hover:underline">
                        politique de confidentialité
                      </Link>
                    </span>
                  }
                  checked={acceptTerms}
                  onChange={(checked) => setAcceptTerms(checked)}
                />
                
                <div className="mt-6">
                  <ButtonPrimary 
                    type="submit" 
                    disabled={loading || !acceptTerms}
                    loading={loading}
                    className="w-full"
                  >
                    {loading ? 'Traitement en cours...' : 'Procéder au paiement sécurisé'}
                  </ButtonPrimary>
                </div>
              </div>
            </form>
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl sticky top-24">
              <h3 className="text-xl font-semibold mb-6">Résumé de votre commande</h3>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                      {item.session?.formation?.featured_image ? (
                        <Image
                          src={item.session.formation.featured_image}
                          alt={item.session.formation.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <AcademicCapIcon className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.session?.formation?.title}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {item.session?.city} • {new Date(item.session?.start_date || '').toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm font-semibold mt-2">
                        {formatPrice(item.price_at_time)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TVA (20%)</span>
                  <span>{formatPrice(total * 0.2)}</span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total TTC</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p className="font-semibold mb-1">Inclus dans votre inscription :</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Supports de formation numériques</li>
                      <li>• Certificat de participation</li>
                      <li>• Accès au groupe privé</li>
                      <li>• Pauses café et déjeuner</li>
                    </ul>
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