// Version temporaire du service commandes avec données fictives
// À utiliser en attendant que les tables soient correctement configurées

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

// Données fictives pour les tests
const fakeUsers = [
  {
    id: '1',
    first_name: 'Jean',
    last_name: 'Durand',
    email: 'jean.durand@email.com',
    phone: '01 23 45 67 89',
    company: 'Cabinet Dentaire Durand'
  },
  {
    id: '2',
    first_name: 'Marie',
    last_name: 'Leblanc',
    email: 'marie.leblanc@email.com',
    phone: '01 98 76 54 32',
    company: 'Clinique Orthodontique Paris'
  },
  {
    id: '3',
    first_name: 'Pierre',
    last_name: 'Moreau',
    email: 'pierre.moreau@email.com',
    phone: '01 56 78 90 12',
    company: null
  },
  {
    id: '4',
    first_name: 'Sophie',
    last_name: 'Bernard',
    email: 'sophie.bernard@email.com',
    phone: '01 34 56 78 90',
    company: 'Centre Orthodontique Lyon'
  }
]

const fakeOrders: Order[] = [
  {
    id: '1',
    order_number: 'CMD-2024-001',
    user_id: '1',
    total_amount: 1200.00,
    subtotal_amount: 1000.00,
    tax_amount: 200.00,
    discount_amount: 0,
    status: 'completed',
    payment_status: 'paid',
    currency: 'EUR',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    payment_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    completed_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Commande formation Paris - Janvier 2024',
    user: fakeUsers[0],
    items: [
      {
        id: '1',
        order_id: '1',
        session_id: '1',
        quantity: 1,
        unit_price: 1000.00,
        total_price: 1000.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session: {
          id: '1',
          city: 'Paris',
          start_date: '2024-02-15',
          end_date: '2024-02-17',
          formation: {
            id: '1',
            title: 'Formation Orthodontie Neuro-Musculaire - Niveau 1',
            slug: 'formation-onm-niveau-1',
            instructor: {
              id: '1',
              name: 'Dr. Marie Dupont'
            }
          }
        }
      }
    ],
    payments: [
      {
        id: '1',
        order_id: '1',
        amount: 1200.00,
        currency: 'EUR',
        status: 'paid',
        payment_method: 'LCL Sherlocks',
        lcl_transaction_id: 'LCL_abc123def456',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: '2',
    order_number: 'CMD-2024-002',
    user_id: '2',
    total_amount: 1500.00,
    subtotal_amount: 1250.00,
    tax_amount: 250.00,
    discount_amount: 0,
    status: 'processing',
    payment_status: 'paid',
    currency: 'EUR',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    payment_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Formation avancée Lyon',
    user: fakeUsers[1],
    items: [
      {
        id: '2',
        order_id: '2',
        session_id: '2',
        quantity: 1,
        unit_price: 1250.00,
        total_price: 1250.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session: {
          id: '2',
          city: 'Lyon',
          start_date: '2024-03-10',
          end_date: '2024-03-12',
          formation: {
            id: '1',
            title: 'Formation Orthodontie Neuro-Musculaire - Niveau 2',
            slug: 'formation-onm-niveau-2',
            instructor: {
              id: '1',
              name: 'Dr. Marie Dupont'
            }
          }
        }
      }
    ],
    payments: [
      {
        id: '2',
        order_id: '2',
        amount: 1500.00,
        currency: 'EUR',
        status: 'paid',
        payment_method: 'LCL Sherlocks',
        lcl_transaction_id: 'LCL_def456ghi789',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: '3',
    order_number: 'CMD-2024-003',
    user_id: '3',
    total_amount: 890.00,
    subtotal_amount: 741.67,
    tax_amount: 148.33,
    discount_amount: 0,
    status: 'pending',
    payment_status: 'pending',
    currency: 'EUR',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Formation initiation - En attente paiement',
    user: fakeUsers[2],
    items: [
      {
        id: '3',
        order_id: '3',
        session_id: '3',
        quantity: 1,
        unit_price: 741.67,
        total_price: 741.67,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session: {
          id: '3',
          city: 'Marseille',
          start_date: '2024-04-05',
          end_date: '2024-04-07',
          formation: {
            id: '2',
            title: 'Formation Initiation Posturologie',
            slug: 'formation-posturologie-initiation',
            instructor: {
              id: '2',
              name: 'Dr. Jean Martin'
            }
          }
        }
      }
    ],
    payments: []
  },
  {
    id: '4',
    order_number: 'CMD-2024-004',
    user_id: '4',
    total_amount: 1350.00,
    subtotal_amount: 1125.00,
    tax_amount: 225.00,
    discount_amount: 0,
    status: 'confirmed',
    payment_status: 'paid',
    currency: 'EUR',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    payment_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Formation spécialisée TMJ',
    user: fakeUsers[3],
    items: [
      {
        id: '4',
        order_id: '4',
        session_id: '4',
        quantity: 1,
        unit_price: 1125.00,
        total_price: 1125.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session: {
          id: '4',
          city: 'Bordeaux',
          start_date: '2024-05-20',
          end_date: '2024-05-22',
          formation: {
            id: '3',
            title: 'Formation TMJ Advanced',
            slug: 'formation-tmj-advanced',
            instructor: {
              id: '3',
              name: 'Dr. Sophie Leroy'
            }
          }
        }
      }
    ],
    payments: [
      {
        id: '4',
        order_id: '4',
        amount: 1350.00,
        currency: 'EUR',
        status: 'paid',
        payment_method: 'LCL Sherlocks',
        lcl_transaction_id: 'LCL_ghi789jkl012',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: '5',
    order_number: 'CMD-2024-005',
    user_id: '1',
    total_amount: 750.00,
    subtotal_amount: 625.00,
    tax_amount: 125.00,
    discount_amount: 0,
    status: 'cancelled',
    payment_status: 'refunded',
    currency: 'EUR',
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    payment_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Annulation demandée par le client - conflit d\'agenda',
    user: fakeUsers[0],
    items: [
      {
        id: '5',
        order_id: '5',
        session_id: '5',
        quantity: 1,
        unit_price: 625.00,
        total_price: 625.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session: {
          id: '5',
          city: 'Nice',
          start_date: '2024-01-25',
          end_date: '2024-01-27',
          formation: {
            id: '4',
            title: 'Formation Diagnostic Postural',
            slug: 'formation-diagnostic-postural',
            instructor: {
              id: '2',
              name: 'Dr. Jean Martin'
            }
          }
        }
      }
    ],
    payments: [
      {
        id: '5',
        order_id: '5',
        amount: 750.00,
        currency: 'EUR',
        status: 'refunded',
        payment_method: 'LCL Sherlocks',
        lcl_transaction_id: 'LCL_jkl012mno345',
        created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: '6',
    order_number: 'CMD-2024-006',
    user_id: '2',
    total_amount: 980.00,
    subtotal_amount: 816.67,
    tax_amount: 163.33,
    discount_amount: 0,
    status: 'pending',
    payment_status: 'failed',
    currency: 'EUR',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Échec de paiement - carte expirée',
    user: fakeUsers[1],
    items: [
      {
        id: '6',
        order_id: '6',
        session_id: '6',
        quantity: 1,
        unit_price: 816.67,
        total_price: 816.67,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session: {
          id: '6',
          city: 'Toulouse',
          start_date: '2024-06-15',
          end_date: '2024-06-17',
          formation: {
            id: '5',
            title: 'Formation Orthodontie Interceptive',
            slug: 'formation-orthodontie-interceptive',
            instructor: {
              id: '1',
              name: 'Dr. Marie Dupont'
            }
          }
        }
      }
    ],
    payments: [
      {
        id: '6',
        order_id: '6',
        amount: 980.00,
        currency: 'EUR',
        status: 'failed',
        payment_method: 'LCL Sherlocks',
        failure_reason: 'Carte bancaire expirée',
        failure_code: 'EXPIRED_CARD',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
]

export class OrdersAdminService {
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

      let filteredOrders = [...fakeOrders]

      // Filtres de recherche
      if (query) {
        const searchLower = query.toLowerCase()
        filteredOrders = filteredOrders.filter(order => 
          order.order_number.toLowerCase().includes(searchLower) ||
          order.user?.email.toLowerCase().includes(searchLower) ||
          order.user?.first_name.toLowerCase().includes(searchLower) ||
          order.user?.last_name.toLowerCase().includes(searchLower)
        )
      }

      if (status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === status)
      }

      if (payment_status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.payment_status === payment_status)
      }

      if (date_from) {
        filteredOrders = filteredOrders.filter(order => order.created_at >= date_from)
      }

      if (date_to) {
        filteredOrders = filteredOrders.filter(order => order.created_at <= date_to)
      }

      if (min_amount) {
        filteredOrders = filteredOrders.filter(order => order.total_amount >= min_amount)
      }

      if (max_amount) {
        filteredOrders = filteredOrders.filter(order => order.total_amount <= max_amount)
      }

      // Tri
      filteredOrders.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (sort_by) {
          case 'total_amount':
            aValue = a.total_amount
            bValue = b.total_amount
            break
          case 'order_number':
            aValue = a.order_number
            bValue = b.order_number
            break
          case 'payment_date':
            aValue = a.payment_date || '0000-01-01'
            bValue = b.payment_date || '0000-01-01'
            break
          default:
            aValue = a.created_at
            bValue = b.created_at
        }

        if (sort_order === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })

      // Pagination
      const total = filteredOrders.length
      const from = (page - 1) * limit
      const to = from + limit
      const paginatedOrders = filteredOrders.slice(from, to)

      return {
        data: paginatedOrders,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        },
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return {
        data: [],
        pagination: { page: 1, limit: params.limit || 20, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération des commandes'
      }
    }
  }

  /**
   * Récupère une commande par ID
   */
  static async getOrderById(id: string): Promise<APIResponse<Order | null>> {
    try {
      const order = fakeOrders.find(o => o.id === id)
      
      return {
        data: order || null,
        success: !!order,
        message: order ? undefined : 'Commande non trouvée'
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
      const stats: OrderStats = {
        total_orders: fakeOrders.length,
        total_revenue: fakeOrders.reduce((sum, order) => sum + order.total_amount, 0),
        pending_orders: fakeOrders.filter(o => o.status === 'pending').length,
        completed_orders: fakeOrders.filter(o => o.status === 'completed').length,
        cancelled_orders: fakeOrders.filter(o => o.status === 'cancelled').length,
        refunded_orders: fakeOrders.filter(o => o.payment_status === 'refunded').length,
        average_order_value: fakeOrders.length ? (fakeOrders.reduce((sum, order) => sum + order.total_amount, 0) / fakeOrders.length) : 0,
        orders_this_month: fakeOrders.filter(o => new Date(o.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
        revenue_this_month: fakeOrders.filter(o => new Date(o.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).reduce((sum, order) => sum + order.total_amount, 0)
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

  /**
   * Met à jour le statut d'une commande
   */
  static async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    notes?: string
  ): Promise<APIResponse<Order>> {
    try {
      const orderIndex = fakeOrders.findIndex(o => o.id === orderId)
      
      if (orderIndex === -1) {
        return {
          data: null as any,
          success: false,
          message: 'Commande non trouvée'
        }
      }

      fakeOrders[orderIndex] = {
        ...fakeOrders[orderIndex],
        status,
        notes: notes || fakeOrders[orderIndex].notes,
        updated_at: new Date().toISOString(),
        completed_date: status === 'completed' ? new Date().toISOString() : fakeOrders[orderIndex].completed_date
      }

      return {
        data: fakeOrders[orderIndex],
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
      const orderIndex = fakeOrders.findIndex(o => o.id === orderId)
      
      if (orderIndex === -1) {
        return {
          data: null as any,
          success: false,
          message: 'Commande non trouvée'
        }
      }

      fakeOrders[orderIndex] = {
        ...fakeOrders[orderIndex],
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
        payment_date: paymentStatus === 'paid' ? new Date().toISOString() : fakeOrders[orderIndex].payment_date
      }

      return {
        data: fakeOrders[orderIndex],
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
      const orderIndex = fakeOrders.findIndex(o => o.id === orderId)
      
      if (orderIndex === -1) {
        return {
          data: false,
          success: false,
          message: 'Commande non trouvée'
        }
      }

      fakeOrders[orderIndex] = {
        ...fakeOrders[orderIndex],
        status: 'cancelled',
        notes: reason || fakeOrders[orderIndex].notes,
        updated_at: new Date().toISOString()
      }

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
        ].map(field => `"${field}"`).join(','))
      ].join('\n')

      return csvContent
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      return ''
    }
  }
}