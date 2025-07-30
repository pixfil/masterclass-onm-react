-- Création des tables pour la gestion des utilisateurs et wishlist
-- Exécuter ce script dans Supabase Dashboard > SQL Editor

-- Table des clients/visiteurs
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'France',
  birth_date DATE,
  preferences JSONB, -- Préférences de recherche (type de bien, budget, etc.)
  newsletter_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Table pour la wishlist des clients
CREATE TABLE IF NOT EXISTS client_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT, -- Notes personnelles du client sur le bien
  UNIQUE(client_id, property_id)
);

-- La table agents_immobiliers doit être adaptée avec le script 00_create_agents_table.sql en premier
-- Vérifier que la table agents_immobiliers existe avant de continuer
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agents_immobiliers') THEN
        RAISE EXCEPTION 'La table agents_immobiliers n''existe pas. Veuillez d''abord exécuter le script 00_create_agents_table.sql';
    END IF;
END $$;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);
CREATE INDEX IF NOT EXISTS idx_wishlist_client ON client_wishlist(client_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_property ON client_wishlist(property_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_wishlist ENABLE ROW LEVEL SECURITY;

-- Politique pour les clients : ils ne peuvent voir que leurs propres données
CREATE POLICY "Clients can view own data" ON clients
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Clients can update own data" ON clients
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Politique pour la wishlist : les clients ne voient que leur wishlist
CREATE POLICY "Clients can view own wishlist" ON client_wishlist
    FOR ALL USING (client_id::text = auth.uid()::text);

-- Politique pour les agents : ils peuvent voir les clients pour les contacter
CREATE POLICY "Agents can view clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agents_immobiliers 
            WHERE id::text = auth.uid()::text 
            AND status = 'approved'
        )
    );

-- Les admins peuvent tout voir et modifier
CREATE POLICY "Admins can manage all" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM agents_immobiliers 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage wishlist" ON client_wishlist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM agents_immobiliers 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Insertion de données de test pour les clients
INSERT INTO clients (email, first_name, last_name, phone, city, preferences, newsletter_consent) VALUES
('marie.martin@email.com', 'Marie', 'Martin', '06 12 34 56 78', 'Strasbourg', 
 '{"budget_max": 300000, "property_types": ["appartement"], "rooms_min": 3}', true),
('jean.dupont@email.com', 'Jean', 'Dupont', '06 87 65 43 21', 'Colmar', 
 '{"budget_max": 500000, "property_types": ["maison"], "rooms_min": 4}', false),
('sophie.bernard@email.com', 'Sophie', 'Bernard', '06 11 22 33 44', 'Mulhouse', 
 '{"budget_max": 1200, "transaction_type": "location", "property_types": ["appartement"]}', true)
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE clients IS 'Table des clients/visiteurs du site';
COMMENT ON TABLE client_wishlist IS 'Liste de souhaits des clients pour les biens immobiliers';
COMMENT ON COLUMN agents.status IS 'Statut de l''agent: pending, approved, rejected';
COMMENT ON COLUMN agents.requested_at IS 'Date de demande d''inscription comme agent';
COMMENT ON COLUMN agents.approved_at IS 'Date d''approbation du compte agent';