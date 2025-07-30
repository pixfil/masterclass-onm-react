-- Script pour ajouter des fausses commandes de test
-- À exécuter dans Supabase SQL Editor

-- D'abord, vérifier s'il y a des utilisateurs de test
-- Sinon en créer quelques-uns
INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    company,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'Jean',
    'Durand',
    'jean.durand@email.com',
    '01 23 45 67 89',
    'Cabinet Dentaire Durand',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
),
(
    gen_random_uuid(),
    'Marie',
    'Leblanc',
    'marie.leblanc@email.com',
    '01 98 76 54 32',
    'Clinique Orthodontique Paris',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
),
(
    gen_random_uuid(),
    'Pierre',
    'Moreau',
    'pierre.moreau@email.com',
    '01 56 78 90 12',
    NULL,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
),
(
    gen_random_uuid(),
    'Sophie',
    'Bernard',
    'sophie.bernard@email.com',
    '01 34 56 78 90',
    'Centre Orthodontique Lyon',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (email) DO NOTHING;

-- Récupérer les IDs des utilisateurs et sessions pour les commandes
WITH user_data AS (
  SELECT id as user_id, email FROM user_profiles 
  WHERE email IN ('jean.durand@email.com', 'marie.leblanc@email.com', 'pierre.moreau@email.com', 'sophie.bernard@email.com')
),
session_data AS (
  SELECT id as session_id, price FROM formation_sessions LIMIT 1
),
fake_orders AS (
  -- Commande 1 : Jean Durand - Payée et terminée
  SELECT 
    gen_random_uuid() as order_id,
    'CMD-2024-001' as order_number,
    u.user_id,
    1200.00 as total_amount,
    1000.00 as subtotal_amount,
    200.00 as tax_amount,
    0 as discount_amount,
    'completed' as status,
    'paid' as payment_status,
    NOW() - INTERVAL '25 days' as created_at,
    NOW() - INTERVAL '20 days' as payment_date,
    NOW() - INTERVAL '15 days' as completed_date,
    'EUR' as currency,
    'Commande formation Paris - Janvier 2024' as notes
  FROM user_data u WHERE u.email = 'jean.durand@email.com'
  
  UNION ALL
  
  -- Commande 2 : Marie Leblanc - Payée, en traitement
  SELECT 
    gen_random_uuid() as order_id,
    'CMD-2024-002' as order_number,
    u.user_id,
    1500.00 as total_amount,
    1250.00 as subtotal_amount,
    250.00 as tax_amount,
    0 as discount_amount,
    'processing' as status,
    'paid' as payment_status,
    NOW() - INTERVAL '12 days' as created_at,
    NOW() - INTERVAL '10 days' as payment_date,
    NULL as completed_date,
    'EUR' as currency,
    'Formation avancée Lyon' as notes
  FROM user_data u WHERE u.email = 'marie.leblanc@email.com'
  
  UNION ALL
  
  -- Commande 3 : Pierre Moreau - En attente de paiement
  SELECT 
    gen_random_uuid() as order_id,
    'CMD-2024-003' as order_number,
    u.user_id,
    890.00 as total_amount,
    741.67 as subtotal_amount,
    148.33 as tax_amount,
    0 as discount_amount,
    'pending' as status,
    'pending' as payment_status,
    NOW() - INTERVAL '5 days' as created_at,
    NULL as payment_date,
    NULL as completed_date,
    'EUR' as currency,
    'Formation initiation - En attente paiement' as notes
  FROM user_data u WHERE u.email = 'pierre.moreau@email.com'
  
  UNION ALL
  
  -- Commande 4 : Sophie Bernard - Confirmée, payée
  SELECT 
    gen_random_uuid() as order_id,
    'CMD-2024-004' as order_number,
    u.user_id,
    1350.00 as total_amount,
    1125.00 as subtotal_amount,
    225.00 as tax_amount,
    0 as discount_amount,
    'confirmed' as status,
    'paid' as payment_status,
    NOW() - INTERVAL '2 days' as created_at,
    NOW() - INTERVAL '1 day' as payment_date,
    NULL as completed_date,
    'EUR' as currency,
    'Formation spécialisée TMJ' as notes
  FROM user_data u WHERE u.email = 'sophie.bernard@email.com'
  
  UNION ALL
  
  -- Commande 5 : Jean Durand - Annulée
  SELECT 
    gen_random_uuid() as order_id,
    'CMD-2024-005' as order_number,
    u.user_id,
    750.00 as total_amount,
    625.00 as subtotal_amount,
    125.00 as tax_amount,
    0 as discount_amount,
    'cancelled' as status,
    'refunded' as payment_status,
    NOW() - INTERVAL '18 days' as created_at,
    NOW() - INTERVAL '16 days' as payment_date,
    NULL as completed_date,
    'EUR' as currency,
    'Annulation demandée par le client - conflit d''agenda' as notes
  FROM user_data u WHERE u.email = 'jean.durand@email.com'
  
  UNION ALL
  
  -- Commande 6 : Marie Leblanc - Échec de paiement
  SELECT 
    gen_random_uuid() as order_id,
    'CMD-2024-006' as order_number,
    u.user_id,
    980.00 as total_amount,
    816.67 as subtotal_amount,
    163.33 as tax_amount,
    0 as discount_amount,
    'pending' as status,
    'failed' as payment_status,
    NOW() - INTERVAL '8 days' as created_at,
    NULL as payment_date,
    NULL as completed_date,
    'EUR' as currency,
    'Échec de paiement - carte expirée' as notes
  FROM user_data u WHERE u.email = 'marie.leblanc@email.com'
)

-- Insérer les commandes
INSERT INTO orders (
    id,
    order_number,
    user_id,
    total_amount,
    subtotal_amount,
    tax_amount,
    discount_amount,
    status,
    payment_status,
    created_at,
    payment_date,
    completed_date,
    currency,
    notes,
    updated_at
)
SELECT 
    order_id,
    order_number,
    user_id,
    total_amount,
    subtotal_amount,
    tax_amount,
    discount_amount,
    status,
    payment_status,
    created_at,
    payment_date,
    completed_date,
    currency,
    notes,
    NOW()
FROM fake_orders
ON CONFLICT (order_number) DO NOTHING;

-- Ajouter des items de commande (en supposant qu'il y a des sessions)
WITH order_data AS (
  SELECT id as order_id, order_number FROM orders 
  WHERE order_number LIKE 'CMD-2024-%'
),
session_data AS (
  SELECT id as session_id, price FROM formation_sessions LIMIT 1
)
INSERT INTO order_items (
    id,
    order_id,
    session_id,
    quantity,
    unit_price,
    total_price,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    o.order_id,
    s.session_id,
    1,
    CASE 
        WHEN o.order_number = 'CMD-2024-001' THEN 1000.00
        WHEN o.order_number = 'CMD-2024-002' THEN 1250.00
        WHEN o.order_number = 'CMD-2024-003' THEN 741.67
        WHEN o.order_number = 'CMD-2024-004' THEN 1125.00
        WHEN o.order_number = 'CMD-2024-005' THEN 625.00
        WHEN o.order_number = 'CMD-2024-006' THEN 816.67
        ELSE s.price
    END,
    CASE 
        WHEN o.order_number = 'CMD-2024-001' THEN 1000.00
        WHEN o.order_number = 'CMD-2024-002' THEN 1250.00
        WHEN o.order_number = 'CMD-2024-003' THEN 741.67
        WHEN o.order_number = 'CMD-2024-004' THEN 1125.00
        WHEN o.order_number = 'CMD-2024-005' THEN 625.00
        WHEN o.order_number = 'CMD-2024-006' THEN 816.67
        ELSE s.price
    END,
    NOW(),
    NOW()
FROM order_data o
CROSS JOIN session_data s
ON CONFLICT DO NOTHING;

-- Ajouter des paiements pour les commandes payées
WITH order_data AS (
  SELECT id as order_id, order_number, payment_date, total_amount, payment_status FROM orders 
  WHERE order_number LIKE 'CMD-2024-%' AND payment_status IN ('paid', 'refunded', 'failed')
)
INSERT INTO payments (
    id,
    order_id,
    amount,
    currency,
    status,
    payment_method,
    lcl_transaction_id,
    created_at,
    updated_at,
    failure_reason,
    failure_code
)
SELECT 
    gen_random_uuid(),
    order_id,
    total_amount,
    'EUR',
    CASE 
        WHEN payment_status = 'paid' THEN 'paid'
        WHEN payment_status = 'refunded' THEN 'refunded'
        ELSE 'failed'
    END,
    'LCL Sherlocks',
    CASE 
        WHEN payment_status != 'failed' THEN 'LCL_' || SUBSTR(MD5(order_number), 1, 12)
        ELSE NULL
    END,
    COALESCE(payment_date, NOW()),
    NOW(),
    CASE 
        WHEN payment_status = 'failed' THEN 'Carte bancaire expirée'
        ELSE NULL
    END,
    CASE 
        WHEN payment_status = 'failed' THEN 'EXPIRED_CARD'
        ELSE NULL
    END
FROM order_data
ON CONFLICT DO NOTHING;

-- Vérifier les données créées
SELECT 
    o.order_number,
    u.first_name || ' ' || u.last_name as client,
    u.email,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at::date as date_commande
FROM orders o
JOIN user_profiles u ON o.user_id = u.id
WHERE o.order_number LIKE 'CMD-2024-%'
ORDER BY o.created_at DESC;