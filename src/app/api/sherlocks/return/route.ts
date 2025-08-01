import { NextRequest, NextResponse } from 'next/server'

// Cette route gère le retour du client après paiement
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const status = searchParams.get('status')
  const orderId = searchParams.get('order_id')

  // Rediriger vers la page appropriée
  if (status === 'success') {
    return NextResponse.redirect(new URL(`/pay-done?type=formation&order=${orderId}`, req.url))
  } else if (status === 'cancel') {
    return NextResponse.redirect(new URL(`/pay-cancel?order=${orderId}`, req.url))
  } else {
    return NextResponse.redirect(new URL('/formations', req.url))
  }
}