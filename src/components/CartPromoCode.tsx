'use client'

import { useState, useEffect } from 'react'
import { PromoCodesService } from '@/lib/supabase/promo-codes'
import { PromoCodeValidation } from '@/lib/supabase/promo-codes-types'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import Input from '@/shared/Input'
import ButtonSecondary from '@/shared/ButtonSecondary'
import { 
  CheckCircleIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  TagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface CartPromoCodeProps {
  onPromoApplied?: (validation: PromoCodeValidation) => void
  onPromoRemoved?: () => void
  className?: string
}

export const CartPromoCode: React.FC<CartPromoCodeProps> = ({
  onPromoApplied,
  onPromoRemoved,
  className = ''
}) => {
  const { user } = useAuth()
  const { cart, subtotal } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeValidation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoAppliedCodes, setAutoAppliedCodes] = useState<any[]>([])

  // Charger les codes auto-applicables au chargement
  useEffect(() => {
    if (user && cart?.items?.length && subtotal > 0) {
      loadAutoApplicableCodes()
    }
  }, [user, cart?.items, subtotal])

  const loadAutoApplicableCodes = async () => {
    try {
      if (!user || !cart?.items?.length) return

      const cartItems = cart.items.map(item => ({
        formation_id: item.session?.formation?.id,
        quantity: item.quantity,
        price: item.price_at_time
      }))

      const codes = await PromoCodesService.getAutoApplicableCodes(
        user.id,
        cartItems,
        subtotal
      )

      setAutoAppliedCodes(codes)

      // Appliquer automatiquement le meilleur code s'il n'y en a pas déjà un
      if (codes.length > 0 && !appliedPromo) {
        const bestCode = codes[0] // Le premier est le meilleur (trié par valeur de remise)
        await validateAndApplyCode(bestCode.code, true)
      }
    } catch (err) {
      console.error('Erreur chargement codes auto:', err)
    }
  }

  const validateAndApplyCode = async (code: string, isAutoApply = false) => {
    if (!user || !cart?.items?.length) {
      setError('Panier vide ou utilisateur non connecté')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const cartItems = cart.items.map(item => ({
        formation_id: item.session?.formation?.id,
        quantity: item.quantity,
        price: item.price_at_time
      }))

      const validation = await PromoCodesService.validatePromoCode(
        code,
        user.id,
        cartItems,
        subtotal
      )

      if (validation.valid) {
        setAppliedPromo(validation)
        if (!isAutoApply) {
          setPromoCode('')
        }
        onPromoApplied?.(validation)
      } else {
        setError(validation.error || 'Code promo invalide')
        setAppliedPromo(null)
      }
    } catch (err) {
      console.error('Erreur validation code promo:', err)
      setError('Erreur lors de la validation du code promo')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyCode = async () => {
    if (!promoCode.trim()) {
      setError('Veuillez saisir un code promo')
      return
    }

    await validateAndApplyCode(promoCode.trim().toUpperCase())
  }

  const handleRemoveCode = () => {
    setAppliedPromo(null)
    setError(null)
    setPromoCode('')
    onPromoRemoved?.()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApplyCode()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Code promo appliqué */}
      {appliedPromo && appliedPromo.valid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Code promo appliqué : {appliedPromo.applied_code?.code}
                </p>
                <p className="text-xs text-green-600 dark:text-green-300">
                  Économie : {appliedPromo.discount_amount?.toFixed(2)}€
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCode}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Codes auto-applicables disponibles */}
      {autoAppliedCodes.length > 0 && !appliedPromo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-start">
            <SparklesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                Codes promo disponibles :
              </p>
              <div className="space-y-2">
                {autoAppliedCodes.slice(0, 3).map((code) => (
                  <button
                    key={code.id}
                    onClick={() => validateAndApplyCode(code.code)}
                    className="block w-full text-left p-2 bg-white dark:bg-neutral-800 rounded border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-medium text-neutral-900 dark:text-white">
                        {code.code}
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {code.discount_type === 'percentage' ? `${code.discount_value}%` : `${code.discount_value}€`}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {code.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Saisie code promo */}
      {!appliedPromo && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <TagIcon className="h-4 w-4 inline mr-1" />
            Code promo
          </label>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase())
                setError(null)
              }}
              onKeyPress={handleKeyPress}
              placeholder="Entrer un code promo"
              className="flex-1 font-mono"
              disabled={loading}
            />
            <ButtonSecondary
              onClick={handleApplyCode}
              disabled={loading || !promoCode.trim()}
              className="px-4"
            >
              {loading ? 'Vérification...' : 'Appliquer'}
            </ButtonSecondary>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Saisissez votre code promo pour bénéficier d'une réduction
          </p>
        </div>
      )}

      {/* Suggestions visuelles */}
      {!appliedPromo && !error && autoAppliedCodes.length === 0 && (
        <div className="text-center py-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            💡 Astuce : Certains codes se déclenchent automatiquement selon votre panier
          </p>
        </div>
      )}
    </div>
  )
}