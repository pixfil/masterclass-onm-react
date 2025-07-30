-- Script de création des tables Supabase pour Initiative Immobilier
-- Version mise à jour pour correspondre au code TypeScript

-- Table des propriétés (biens immobiliers)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations générales
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('vente', 'location')) NOT NULL,
  property_type VARCHAR(50) CHECK (property_type IN ('maison', 'appartement', 'locaux_commerciaux', 'parking', 'terrain', 'autres')) NOT NULL,
  status VARCHAR(30) CHECK (status IN ('disponible', 'sous_offre', 'vendu')) DEFAULT 'disponible',
  
  -- Localisation
  address VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10),
  latitude DECIMAL(10, 8) NOT NULL DEFAULT 0,
  longitude DECIMAL(11, 8) NOT NULL DEFAULT 0,
  
  -- Caractéristiques physiques
  surface DECIMAL(10, 2), -- Surface en m²
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor INTEGER,
  parking INTEGER,
  construction_year INTEGER,
  
  -- Équipements booléens
  balcony BOOLEAN DEFAULT false,
  terrace BOOLEAN DEFAULT false,
  garden BOOLEAN DEFAULT false,
  elevator BOOLEAN DEFAULT false,
  furnished BOOLEAN DEFAULT false,
  
  -- Performance énergétique
  energy_class VARCHAR(10),
  heating_type VARCHAR(100),
  
  -- Charges et taxes
  charges DECIMAL(10, 2), -- Charges mensuelles
  tax_fonciere DECIMAL(10, 2), -- Taxe foncière annuelle
  
  -- Images et features
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  
  -- SEO
  slug VARCHAR(255) UNIQUE
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type_transaction ON properties(property_type, transaction_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_geo ON properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(published);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des favoris
CREATE TABLE IF NOT EXISTS property_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, property_id)
);

-- Table des demandes de contact
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Informations du demandeur
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  
  -- Type de demande
  request_type VARCHAR(50) CHECK (request_type IN ('information', 'visite', 'estimation', 'autre')) DEFAULT 'information',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  notes TEXT
);

-- Table des estimations
CREATE TABLE IF NOT EXISTS property_estimations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations du demandeur
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  
  -- Informations du bien
  property_type VARCHAR(50) CHECK (property_type IN ('maison', 'appartement', 'locaux_commerciaux', 'parking', 'terrain', 'autres')) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  
  -- Caractéristiques
  surface DECIMAL(10, 2),
  rooms INTEGER,
  construction_year INTEGER,
  condition VARCHAR(50) CHECK (condition IN ('neuf', 'tres_bon', 'bon', 'a_rafraichir', 'a_renover')),
  
  -- Description et notes
  description TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  estimated_value DECIMAL(12, 2),
  estimation_notes TEXT
);

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_estimations ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON property_favorites;

-- Politique pour les propriétés (lecture publique pour les biens publiés)
CREATE POLICY "Properties are viewable by everyone" ON properties
  FOR SELECT USING (published = true);

-- Politique pour les favoris (utilisateurs authentifiés seulement)
CREATE POLICY "Users can manage their own favorites" ON property_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Vue pour les statistiques
DROP VIEW IF EXISTS property_statistics;
CREATE OR REPLACE VIEW property_statistics AS
SELECT 
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE transaction_type = 'vente') as for_sale,
  COUNT(*) FILTER (WHERE transaction_type = 'location') as for_rent,
  COUNT(*) FILTER (WHERE status = 'disponible') as available,
  COUNT(*) FILTER (WHERE status = 'sous_offre') as under_offer,
  AVG(price) FILTER (WHERE transaction_type = 'vente') as avg_sale_price,
  AVG(price) FILTER (WHERE transaction_type = 'location') as avg_rent_price
FROM properties
WHERE published = true;