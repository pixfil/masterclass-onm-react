// Service Admin Supabase pour les commandes - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  Order, 
  OrderItem,
  Payment,
  Registration,
  APIResponse,
  PaginatedResponse,
  OrderStatus,
  PaymentStatus 
} from './formations-types'

export interface OrderSearchParams {
  query?: string
  status?: OrderStatus | 'all'
  payment_status?: PaymentStatus | 'all'
  date_from?: string
  date_to?: string
  min_amount?: number
  max_amount?: number
  page?: number
  limit?: number
  sort_by?: 'created_at' | 'total_amount' | 'order_number' | 'payment_date'
  sort_order?: 'asc' | 'desc'
}

export interface OrderStats {
  total_orders: number
  total_revenue: number
  pending_orders: number
  completed_orders: number
  cancelled_orders: number
  refunded_orders: number
  average_order_value: number
  orders_this_month: number
  revenue_this_month: number
}

export class OrdersAdminService {
  // =============================================================================
  // LECTURE DES COMMANDES
  // =============================================================================

  /**
   * Récupère toutes les commandes avec pagination et filtres
   */
  static async getOrders(params: OrderSearchParams = {}): Promise<PaginatedResponse<Order>> {
    try {
      const { 
        query = '', 
        status = 'all',
        payment_status = 'all',
        date_from,
        date_to,
        min_amount,
        max_amount,
        page = 1, 
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params

      // Version simplifiée d'abord pour identifier le problème
      let queryBuilder = supabase
        .from('orders')
        .select(`
          *,
          user:user_profiles(
            first_name,
            last_name,
            email,
            phone,
            company
          )
        `, { count: 'exact' })

      // Filtres de recherche
      if (query) {
        queryBuilder = queryBuilder.or(`order_number.ilike.%${query}%,user.email.ilike.%${query}%,user.first_name.ilike.%${query}%,user.last_name.ilike.%${query}%`)
      }

      if (status !== 'all') {
        queryBuilder = queryBuilder.eq('status', status)
      }

      if (payment_status !== 'all') {
        queryBuilder = queryBuilder.eq('payment_status', payment_status)
      }

      if (date_from) {
        queryBuilder = queryBuilder.gte('created_at', date_from)
      }

      if (date_to) {
        queryBuilder = queryBuilder.lte('created_at', date_to)
      }

      if (min_amount) {
        queryBuilder = queryBuilder.gte('total_amount', min_amount)
      }

      if (max_amount) {
        queryBuilder = queryBuilder.lte('total_amount', max_amount)
      }

      // Tri
      queryBuilder = queryBuilder.order(sort_by, { ascending: sort_order === 'asc' })

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data, error, count } = await queryBuilder.range(from, to)

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
      console.error('Détails de l\'erreur:', JSON.stringify(error, null, 2))
      return {
        data: [],
        pagination: { page: 1, limit: params.limit || 20, total: 0, total_pages: 0 },
        success: false,
        message: `Erreur lors de la récupération des commandes: ${error.message || 'Erreur inconnue'}`
      }
    }
  }

  /**
   * Récupère une commande par ID avec tous les détails
   */
  static async getOrderById(id: string): Promise<APIResponse<Order | null>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_profiles(
            *
          ),
          items:order_items(
            *,
            session:formation_sessions(
              *,
              formation:formations(
                *,
                instructor:instructors(*)
              )
            )
          ),
          payments:payments(*),
          registrations:registrations(
            *,
            session:formation_sessions(
              *,
              formation:formations(
                *,
                instructor:instructors(*)
              )
            )
          )
        `)
        .eq('id', id)
        .single()

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
   * Récupère les statistiques des commandes
   */
  static async getOrdersStats(): Promise<APIResponse<OrderStats>> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, payment_status, total_amount, created_at')

      if (error) throw error

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const stats: OrderStats = {
        total_orders: orders?.length || 0,
        total_revenue: orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        pending_orders: orders?.filter(o => o.status === 'pending').length || 0,
        completed_orders: orders?.filter(o => o.status === 'completed').length || 0,
        cancelled_orders: orders?.filter(o => o.status === 'cancelled').length || 0,
        refunded_orders: orders?.filter(o => o.payment_status === 'refunded').length || 0,
        average_order_value: orders?.length ? (orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length) : 0,
        orders_this_month: orders?.filter(o => new Date(o.created_at) >= startOfMonth).length || 0,
        revenue_this_month: orders?.filter(o => new Date(o.created_at) >= startOfMonth).reduce((sum, order) => sum + order.total_amount, 0) || 0
      }

      return {
        data: stats,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        data: {
          total_orders: 0,
          total_revenue: 0,
          pending_orders: 0,
          completed_orders: 0,
          cancelled_orders: 0,
          refunded_orders: 0,
          average_order_value: 0,
          orders_this_month: 0,
          revenue_this_month: 0
        },
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      }
    }
  }

  // =============================================================================
  // GESTION DES COMMANDES
  // =============================================================================

  /**
   * Met à jour le statut d'une commande
   */
  static async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    notes?: string
  ): Promise<APIResponse<Order>> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (notes) {
        updateData.notes = notes
      }

      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Statut de commande mis à jour'
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
   * Met à jour le statut de paiement d'une commande
   */
  static async updatePaymentStatus(
    orderId: string, 
    paymentStatus: PaymentStatus
  ): Promise<APIResponse<Order>> {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      }

      if (paymentStatus === 'paid') {
        updateData.payment_date = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

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

  /**
   * Annule une commande
   */
  static async cancelOrder(
    orderId: string, 
    reason?: string
  ): Promise<APIResponse<boolean>> {
    try {
      // Met à jour la commande
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (orderError) throw orderError

      // Annule les inscriptions associées
      const { error: registrationError } = await supabase
        .from('registrations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)

      if (registrationError) {
        console.warn('Erreur lors de l\'annulation des inscriptions:', registrationError)
      }

      // TODO: Libérer les places dans les sessions
      // TODO: Traiter le remboursement si nécessaire

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

  /**
   * Exporte les commandes au format CSV
   */
  static async exportOrders(params: OrderSearchParams = {}): Promise<string> {
    try {
      const result = await this.getOrders({ ...params, limit: 10000 })
      
      if (!result.success || !result.data.length) {
        return ''
      }

      const headers = [
        'Numéro de commande',
        'Date',
        'Client',
        'Email',
        'Téléphone',
        'Formations',
        'Montant total',
        'Statut commande',
        'Statut paiement',
        'Date paiement'
      ]

      const csvContent = [
        headers.join(','),
        ...result.data.map(order => [
          order.order_number,
          new Date(order.created_at).toLocaleDateString('fr-FR'),
          `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim(),
          order.user?.email || '',
          order.user?.phone || '',
          order.items?.map(item => item.session?.formation?.title).join(' | ') || '',
          order.total_amount.toFixed(2),
          order.status,
          order.payment_status,
          order.payment_date ? new Date(order.payment_date).toLocaleDateString('fr-FR') : ''
        ].join(','))
      ].join('\n')

      return csvContent
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      return ''
    }
  }
}