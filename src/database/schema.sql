-- Script de création des tables Supabase pour Initiative Immobilier

-- Table des propriétés (biens immobiliers)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations générales
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('vente', 'location')) NOT NULL,
  property_type VARCHAR(50) CHECK (property_type IN ('maison', 'appartement', 'locaux_commerciaux', 'parking', 'terrain', 'autres')) NOT NULL,
  status VARCHAR(30) CHECK (status IN ('disponible', 'sous_offre', 'vendu', 'loue')) DEFAULT 'disponible',
  
  -- Localisation
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  zipcode VARCHAR(10) NOT NULL,
  department VARCHAR(50),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Caractéristiques physiques
  living_area DECIMAL(10, 2), -- Surface habitable en m²
  land_area DECIMAL(10, 2), -- Surface terrain en m²
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  year_built INTEGER,
  
  -- Features et équipements (JSON)
  features JSONB DEFAULT '{}', -- {heating: 'gas', air_conditioning: true, fireplace: true, etc.}
  amenities TEXT[] DEFAULT '{}', -- ['terrace', 'garden', 'parking', 'cave', 'attic']
  
  -- Performance énergétique
  energy_class VARCHAR(1) CHECK (energy_class IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  energy_consumption INTEGER,
  ges_class VARCHAR(1) CHECK (ges_class IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  ges_emissions INTEGER,
  
  -- Charges et taxes
  property_tax INTEGER,
  monthly_charges INTEGER, -- pour location
  
  -- Images
  featured_image VARCHAR(500),
  gallery_images TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  
  -- SEO
  slug VARCHAR(255) UNIQUE,
  meta_title VARCHAR(255),
  meta_description TEXT
);

-- Index pour optimiser les recherches
CREATE INDEX idx_properties_location ON properties(city, department);
CREATE INDEX idx_properties_type_transaction ON properties(property_type, transaction_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_geo ON properties(latitude, longitude);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_published ON properties(published);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des favoris (savelists)
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
  zipcode VARCHAR(10) NOT NULL,
  
  -- Caractéristiques
  surface DECIMAL(10, 2),
  rooms INTEGER,
  year_built INTEGER,
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

-- Politique pour les propriétés (lecture publique pour les biens publiés)
CREATE POLICY "Properties are viewable by everyone" ON properties
  FOR SELECT USING (published = true);

-- Politique pour les favoris (utilisateurs authentifiés seulement)
CREATE POLICY "Users can manage their own favorites" ON property_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Vue pour les statistiques
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