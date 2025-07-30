-- Insertion de données de test pour les agents et clients
-- Exécuter après avoir créé les tables avec les scripts précédents

-- ===== AGENTS IMMOBILIERS DE TEST =====

-- Agent 1 : Sophie Bernard (approuvée)
INSERT INTO agents_immobiliers (
  email, 
  prenom,
  nom,
  first_name, 
  last_name, 
  telephone,
  phone,
  company, 
  role, 
  status, 
  approved_at,
  annees_experience,
  specialites,
  description_agent,
  photo_agent,
  est_actif,
  est_verifie,
  note_moyenne,
  nombre_avis_agent,
  nombre_proprietes_gerees,
  taux_reponse
) VALUES (
  'sophie.bernard@immobilier-alsace.fr',
  'Sophie',
  'Bernard',
  'Sophie',
  'Bernard',
  '03 88 25 67 89',
  '03 88 25 67 89',
  'Immobilier Alsace',
  'agent',
  'approved',
  NOW() - INTERVAL '2 months',
  8,
  ARRAY['residentiel', 'investissement'],
  'Spécialiste du marché résidentiel strasbourgeois depuis 8 ans. Experte en investissement locatif et accompagnement des primo-accédants.',
  'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=400&h=400&fit=crop&crop=face',
  true,
  true,
  4.7,
  23,
  45,
  95
) ON CONFLICT (email) DO NOTHING;

-- Agent 2 : Marc Dubois (en attente d'approbation)
INSERT INTO agents_immobiliers (
  email, 
  prenom,
  nom,
  first_name, 
  last_name, 
  telephone,
  phone,
  address,
  city,
  postal_code,
  company, 
  siret,
  role, 
  status, 
  requested_at,
  annees_experience,
  specialites,
  description_agent,
  photo_agent,
  est_actif
) VALUES (
  'marc.dubois@century21-alsace.fr',
  'Marc',
  'Dubois',
  'Marc',
  'Dubois',
  '03 89 45 12 78',
  '03 89 45 12 78',
  '15 Avenue de Colmar',
  'Mulhouse',
  '68100',
  'Century 21 Alsace',
  '12345678901234',
  'agent',
  'pending',
  NOW() - INTERVAL '5 days',
  12,
  ARRAY['commercial', 'luxe'],
  'Agent expérimenté spécialisé dans l''immobilier commercial et le haut de gamme. Ancien directeur d''agence souhaitant rejoindre votre équipe.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  true
) ON CONFLICT (email) DO NOTHING;

-- Agent 3 : Amélie Martin (approuvée)
INSERT INTO agents_immobiliers (
  email, 
  prenom,
  nom,
  first_name, 
  last_name, 
  telephone,
  phone,
  address,
  city,
  postal_code,
  company, 
  role, 
  status, 
  approved_at,
  approved_by,
  annees_experience,
  specialites,
  description_agent,
  photo_agent,
  est_actif,
  est_verifie,
  note_moyenne,
  nombre_avis_agent,
  nombre_proprietes_gerees,
  taux_reponse
) VALUES (
  'amelie.martin@initiative-immobilier.fr',
  'Amélie',
  'Martin',
  'Amélie',
  'Martin',
  '03 88 76 54 32',
  '03 88 76 54 32',
  '5 Rue des Vosges',
  'Strasbourg',
  '67000',
  'Initiative Immobilier',
  'agent',
  'approved',
  NOW() - INTERVAL '6 months',
  (SELECT id FROM agents_immobiliers WHERE email = 'julien.lindenau@initiative-immobilier.fr' LIMIT 1),
  5,
  ARRAY['neuf', 'residentiel'],
  'Conseillère spécialisée dans l''immobilier neuf et les programmes de défiscalisation. Diplômée en droit immobilier.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  true,
  true,
  4.9,
  18,
  32,
  98
) ON CONFLICT (email) DO NOTHING;

-- ===== CLIENTS DE TEST =====

-- Client 1 : Marie Rousseau (famille recherche maison)
INSERT INTO clients (
  email, 
  first_name, 
  last_name, 
  phone,
  address,
  city,
  postal_code,
  preferences,
  newsletter_consent,
  birth_date,
  last_login
) VALUES (
  'marie.rousseau@gmail.com',
  'Marie',
  'Rousseau',
  '06 12 34 56 78',
  '12 Rue de la Paix',
  'Strasbourg',
  '67000',
  '{
    "budget_max": 380000,
    "transaction_type": "vente",
    "property_types": ["maison"],
    "rooms_min": 4,
    "surface_min": 120,
    "garden": true,
    "parking": true,
    "preferred_cities": ["Strasbourg", "Schiltigheim", "Bischheim"]
  }',
  true,
  '1985-03-15',
  NOW() - INTERVAL '2 days'
) ON CONFLICT (email) DO NOTHING;

-- Client 2 : Thomas Leroy (jeune professionnel, appartement)
INSERT INTO clients (
  email, 
  first_name, 
  last_name, 
  phone,
  city,
  postal_code,
  preferences,
  newsletter_consent,
  birth_date,
  last_login
) VALUES (
  'thomas.leroy@outlook.fr',
  'Thomas',
  'Leroy',
  '07 89 65 43 21',
  'Colmar',
  '68000',
  '{
    "budget_max": 180000,
    "transaction_type": "vente",
    "property_types": ["appartement"],
    "rooms_min": 2,
    "rooms_max": 3,
    "surface_min": 60,
    "elevator": true,
    "preferred_cities": ["Colmar", "Strasbourg"],
    "primo_accedant": true
  }',
  true,
  '1992-11-28',
  NOW() - INTERVAL '1 week'
) ON CONFLICT (email) DO NOTHING;

-- Client 3 : Isabelle Moreau (investisseur locatif)
INSERT INTO clients (
  email, 
  first_name, 
  last_name, 
  phone,
  address,
  city,
  postal_code,
  preferences,
  newsletter_consent,
  birth_date,
  last_login
) VALUES (
  'isabelle.moreau@yahoo.fr',
  'Isabelle',
  'Moreau',
  '06 77 88 99 00',
  '8 Avenue Foch',
  'Mulhouse',
  '68100',
  '{
    "budget_max": 250000,
    "transaction_type": "vente",
    "property_types": ["appartement"],
    "rooms_min": 2,
    "surface_min": 50,
    "investment_purpose": true,
    "rental_yield_min": 5,
    "preferred_cities": ["Mulhouse", "Colmar", "Strasbourg"]
  }',
  false,
  '1978-07-04',
  NOW() - INTERVAL '3 days'
) ON CONFLICT (email) DO NOTHING;

-- Client 4 : Jean-Pierre Schneider (retraité, maison avec jardin)
INSERT INTO clients (
  email, 
  first_name, 
  last_name, 
  phone,
  address,
  city,
  postal_code,
  preferences,
  newsletter_consent,
  birth_date,
  last_login
) VALUES (
  'jp.schneider@free.fr',
  'Jean-Pierre',
  'Schneider',
  '03 88 55 44 33',
  '25 Rue des Tilleuls',
  'Haguenau',
  '67500',
  '{
    "budget_max": 320000,
    "transaction_type": "vente",
    "property_types": ["maison"],
    "rooms_min": 3,
    "surface_min": 100,
    "garden": true,
    "ground_floor": true,
    "quiet_area": true,
    "preferred_cities": ["Haguenau", "Bischwiller", "Brumath"]
  }',
  true,
  '1958-12-10',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (email) DO NOTHING;

-- Client 5 : Céline Dubois (location étudiant/jeune actif)
INSERT INTO clients (
  email, 
  first_name, 
  last_name, 
  phone,
  city,
  postal_code,
  preferences,
  newsletter_consent,
  birth_date,
  last_login
) VALUES (
  'celine.dubois@student.unistra.fr',
  'Céline',
  'Dubois',
  '06 33 22 11 44',
  'Strasbourg',
  '67000',
  '{
    "budget_max": 800,
    "transaction_type": "location",
    "property_types": ["appartement"],
    "rooms_min": 1,
    "rooms_max": 2,
    "surface_min": 25,
    "furnished": true,
    "public_transport": true,
    "student_friendly": true,
    "preferred_cities": ["Strasbourg"]
  }',
  true,
  '1999-05-20',
  NOW() - INTERVAL '1 day'
) ON CONFLICT (email) DO NOTHING;

-- ===== WISHLIST DE TEST =====

-- Créer quelques éléments de wishlist pour les clients
-- (En supposant qu'il y a des propriétés existantes dans la base)

-- Wishlist pour Marie Rousseau (quelques maisons)
INSERT INTO client_wishlist (
  client_id,
  property_id,
  notes,
  added_at
)
SELECT 
  (SELECT id FROM clients WHERE email = 'marie.rousseau@gmail.com'),
  p.id,
  CASE 
    WHEN p.property_type = 'maison' AND p.rooms >= 4 THEN 'Parfait pour la famille, à visiter !'
    WHEN p.property_type = 'maison' AND p.rooms >= 3 THEN 'Intéressant mais un peu petit'
    ELSE 'À étudier'
  END,
  NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY p.created_at DESC)))
FROM properties p
WHERE p.property_type = 'maison' 
  AND p.transaction_type = 'vente'
  AND p.price <= 400000
  AND p.published = true
  AND p.deleted_at IS NULL
LIMIT 3
ON CONFLICT (client_id, property_id) DO NOTHING;

-- Wishlist pour Thomas Leroy (appartements)
INSERT INTO client_wishlist (
  client_id,
  property_id,
  notes,
  added_at
)
SELECT 
  (SELECT id FROM clients WHERE email = 'thomas.leroy@outlook.fr'),
  p.id,
  'Bien dans mon budget primo-accédant',
  NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY p.created_at DESC)))
FROM properties p
WHERE p.property_type = 'appartement' 
  AND p.transaction_type = 'vente'
  AND p.price <= 200000
  AND p.published = true
  AND p.deleted_at IS NULL
LIMIT 5
ON CONFLICT (client_id, property_id) DO NOTHING;

-- Wishlist pour Isabelle Moreau (investissement)
INSERT INTO client_wishlist (
  client_id,
  property_id,
  notes,
  added_at
)
SELECT 
  (SELECT id FROM clients WHERE email = 'isabelle.moreau@yahoo.fr'),
  p.id,
  'Bon potentiel locatif',
  NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY p.created_at DESC)))
FROM properties p
WHERE p.property_type = 'appartement' 
  AND p.transaction_type = 'vente'
  AND p.price <= 250000
  AND p.published = true
  AND p.deleted_at IS NULL
LIMIT 2
ON CONFLICT (client_id, property_id) DO NOTHING;

-- ===== MISE À JOUR DES STATISTIQUES =====

-- Mettre à jour le nombre de propriétés gérées par les agents
UPDATE agents_immobiliers 
SET nombre_proprietes_gerees = (
  SELECT COUNT(*)
  FROM properties p
  WHERE p.agent_id = agents_immobiliers.id
    AND p.published = true
    AND p.deleted_at IS NULL
)
WHERE role = 'agent' AND status = 'approved';

-- Mise à jour des dernières connexions (simulation)
UPDATE agents_immobiliers 
SET last_login = NOW() - (INTERVAL '1 day' * (RANDOM() * 30))
WHERE status = 'approved';

UPDATE clients 
SET last_login = NOW() - (INTERVAL '1 hour' * (RANDOM() * 168))
WHERE is_active = true;

COMMENT ON TABLE agents_immobiliers IS 'Agents immobiliers avec données de test complètes';
COMMENT ON TABLE clients IS 'Clients avec profils variés et préférences réalistes';
COMMENT ON TABLE client_wishlist IS 'Listes de favoris avec notes personnalisées';