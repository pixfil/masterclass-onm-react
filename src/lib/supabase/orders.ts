// Service Supabase pour les commandes - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  Order, 
  OrderItem,
  OrderFormData,
  OrderStatus,
  PaymentStatus,
  APIResponse,
  PaginatedResponse 
} from './formations-types'

export class OrdersService {
  // =============================================================================
  // CRÉATION DE COMMANDES
  // =============================================================================

  /**
   * Crée une nouvelle commande à partir du panier
   */
  static async createOrderFromCart(
    userId: string, 
    cartId: string, 
    orderData: OrderFormData
  ): Promise<APIResponse<Order>> {
    try {
      // Récupérer les items du panier
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          *,
          session:formation_sessions(
            *,
            formation:formations(title)
          )
        `)
        .eq('cart_id', cartId)

      if (cartError) throw cartError

      if (!cartItems || cartItems.length === 0) {
        return {
          data: null as any,
          success: false,
          message: 'Panier vide'
        }
      }

      // Calculer les montants
      const subtotalAmount = cartItems.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0)
      const taxAmount = subtotalAmount * 0.20 // TVA 20%
      const discountAmount = 0 // TODO: Gérer les coupons
      const totalAmount = subtotalAmount + taxAmount - discountAmount

      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          subtotal_amount: subtotalAmount,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          billing_address: orderData.billing_address,
          shipping_address: orderData.shipping_address,
          notes: orderData.notes,
          coupon_code: orderData.coupon_code,
          status: 'pending' as OrderStatus,
          payment_status: 'pending' as PaymentStatus
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Créer les items de commande
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        session_id: item.session_id,
        formation_title: item.session?.formation?.title || 'Formation',
        formation_dates: `${new Date(item.session?.start_date || '').toLocaleDateString()} - ${new Date(item.session?.end_date || '').toLocaleDateString()}`,
        quantity: item.quantity,
        unit_price: item.price_at_time,
        total_price: item.price_at_time * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Réserver les places dans les sessions
      for (const item of cartItems) {
        await this.reserveSessionSpots(item.session_id, item.quantity)
      }

      // Vider le panier
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)

      await supabase
        .from('carts')
        .delete()
        .eq('id', cartId)

      return {
        data: order,
        success: true,
        message: 'Commande créée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création de la commande'
      }
    }
  }

  // =============================================================================
  // LECTURE DES COMMANDES
  // =============================================================================

  /**
   * Récupère les commandes d'un utilisateur
   */
  static async getUserOrders(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            session:formation_sessions(
              start_date,
              end_date,
              city,
              formation:formations(title, featured_image)
            )
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        },
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Récupère une commande par ID
   */
  static async getOrderById(orderId: string, userId?: string): Promise<APIResponse<Order | null>> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:user_profiles(*),
          items:order_items(
            *,
            session:formation_sessions(
              *,
              formation:formations(*)
            )
          ),
          payments:payments(*),
          registrations:registrations(*)
        `)
        .eq('id', orderId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.single()

      if (error) throw error

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error)
      return {
        data: null,
        success: false,
        message: 'Commande non trouvée'
      }
    }
  }

  /**
   * Récupère toutes les commandes (admin)
   */
  static async getAllOrders(params: {
    status?: OrderStatus
    payment_status?: PaymentStatus
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Order>> {
    try {
      const { status, payment_status, page = 1, limit = 20 } = params
      const from = (page - 1) * limit
      const to = from + limit - 1

      let query = supabase
        .from('orders')
        .select(`
          *,
          user:user_profiles(first_name, last_name, email),
          items:order_items(count)
        `, { count: 'exact' })

      if (status) {
        query = query.eq('status', status)
      }
      if (payment_status) {
        query = query.eq('payment_status', payment_status)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        },
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  // =============================================================================
  // MISE À JOUR DES STATUTS
  // =============================================================================

  /**
   * Met à jour le statut d'une commande
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<APIResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'completed' && { completed_date: new Date().toISOString() })
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      // Actions spécifiques selon le statut
      if (status === 'confirmed') {
        await this.createRegistrationsFromOrder(orderId)
      }

      return {
        data,
        success: true,
        message: 'Statut mis à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Met à jour le statut de paiement
   */
  static async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<APIResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
          ...(paymentStatus === 'paid' && { payment_date: new Date().toISOString() })
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      // Si paiement confirmé, confirmer la commande
      if (paymentStatus === 'paid') {
        await this.updateOrderStatus(orderId, 'confirmed')
      }

      return {
        data,
        success: true,
        message: 'Statut de paiement mis à jour'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  // =============================================================================
  // ANNULATION ET REMBOURSEMENT
  // =============================================================================

  /**
   * Annule une commande
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<APIResponse<boolean>> {
    try {
      // Récupérer la commande et ses items
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      // Libérer les places réservées
      for (const item of order.items || []) {
        await this.releaseSessionSpots(item.session_id, item.quantity)
      }

      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (updateError) throw updateError

      // Supprimer les inscriptions si elles existent
      await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('order_id', orderId)

      return {
        data: true,
        success: true,
        message: 'Commande annulée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de l\'annulation'
      }
    }
  }

  // =============================================================================
  // STATISTIQUES
  // =============================================================================

  /**
   * Récupère les statistiques des commandes
   */
  static async getOrdersStats(): Promise<APIResponse<any>> {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('status, payment_status, total_amount, created_at')

      const { data: recentOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const stats = {
        total_orders: orders?.length || 0,
        pending_orders: orders?.filter(o => o.status === 'pending').length || 0,
        confirmed_orders: orders?.filter(o => o.status === 'confirmed').length || 0,
        total_revenue: orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0,
        monthly_revenue: recentOrders?.reduce((sum, o) => sum + o.total_amount, 0) || 0,
        paid_orders: orders?.filter(o => o.payment_status === 'paid').length || 0,
        conversion_rate: orders?.length 
          ? (orders.filter(o => o.payment_status === 'paid').length / orders.length) * 100 
          : 0
      }

      return {
        data: stats,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        data: null,
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      }
    }
  }

  // =============================================================================
  // UTILITAIRES PRIVÉS
  // =============================================================================

  /**
   * Réserve des places dans une session
   */
  private static async reserveSessionSpots(sessionId: string, quantity: number): Promise<void> {
    const { data: session } = await supabase
      .from('formation_sessions')
      .select('available_spots')
      .eq('id', sessionId)
      .single()

    if (session && session.available_spots >= quantity) {
      await supabase
        .from('formation_sessions')
        .update({ available_spots: session.available_spots - quantity })
        .eq('id', sessionId)
    }
  }

  /**
   * Libère des places dans une session
   */
  private static async releaseSessionSpots(sessionId: string, quantity: number): Promise<void> {
    const { data: session } = await supabase
      .from('formation_sessions')
      .select('available_spots, total_spots')
      .eq('id', sessionId)
      .single()

    if (session) {
      const newAvailableSpots = Math.min(
        session.available_spots + quantity,
        session.total_spots
      )
      
      await supabase
        .from('formation_sessions')
        .update({ available_spots: newAvailableSpots })
        .eq('id', sessionId)
    }
  }

  /**
   * Crée les inscriptions à partir d'une commande confirmée
   */
  private static async createRegistrationsFromOrder(orderId: string): Promise<void> {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        *,
        order:orders(user_id)
      `)
      .eq('order_id', orderId)

    if (!orderItems) return

    const registrations = orderItems.flatMap(item => 
      Array(item.quantity).fill(null).map(() => ({
        user_id: item.order?.user_id,
        order_id: orderId,
        session_id: item.session_id,
        status: 'confirmed'
      }))
    )

    await supabase
      .from('registrations')
      .insert(registrations)
  }
}