'use client'

import React, { useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'

const CartDebug: React.FC = () => {
  const { cart, itemsCount, loading } = useCart()

  useEffect(() => {
    console.log('=== CartDebug Component ===')
    console.log('Loading:', loading)
    console.log('Cart:', cart)
    console.log('Items count:', itemsCount)
    console.log('Cart items:', cart?.items)
    console.log('========================')
  }, [cart, itemsCount, loading])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md z-50 text-xs">
      <h3 className="font-bold mb-2">Cart Debug</h3>
      <div className="space-y-1">
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Cart ID: {cart?.id || 'None'}</p>
        <p>Items Count: {itemsCount}</p>
        <p>Items Array Length: {cart?.items?.length || 0}</p>
        {cart?.items && cart.items.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">Items:</p>
            {cart.items.map((item, index) => (
              <div key={item.id} className="ml-2">
                <p>#{index + 1}: {item.session?.formation?.title || 'No title'}</p>
                <p className="ml-2">Session ID: {item.session_id}</p>
                <p className="ml-2">Qty: {item.quantity}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CartDebug