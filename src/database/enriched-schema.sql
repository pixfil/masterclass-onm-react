-- Structure enrichie pour Initiative Immobilier
-- Suppression et recréation complète des tables

-- Supprimer les anciennes tables dans l'ordre des dépendances
DROP TABLE IF EXISTS property_reviews CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS property_amenities CASCADE;
DROP TABLE IF EXISTS property_favorites CASCADE;
DROP TABLE IF EXISTS contact_requests CASCADE;
DROP TABLE IF EXISTS property_estimations CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- Supprimer les vues
DROP VIEW IF EXISTS property_statistics CASCADE;

-- Table principale des propriétés enrichie
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations de base
  title VARCHAR(255) NOT NULL,
  description TEXT,
  handle VARCHAR(255) UNIQUE, -- URL slug
  
  -- Informations immobilières
  price INTEGER NOT NULL,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('vente', 'location')) NOT NULL,
  property_type VARCHAR(50) CHECK (property_type IN ('maison', 'appartement', 'locaux_commerciaux', 'parking', 'terrain', 'autres')) NOT NULL,
  status VARCHAR(30) CHECK (status IN ('disponible', 'sous_offre', 'vendu', 'loue')) DEFAULT 'disponible',
  
  -- Localisation
  address VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10),
  latitude DECIMAL(10, 8) DEFAULT 0,
  longitude DECIMAL(11, 8) DEFAULT 0,
  
  -- Caractéristiques physiques
  surface DECIMAL(10, 2), -- Surface en m²
  acreage DECIMAL(10, 2), -- Surface terrain
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor INTEGER,
  max_guests INTEGER, -- Pour locations saisonnières
  
  -- Équipements booléens
  balcony BOOLEAN DEFAULT false,
  terrace BOOLEAN DEFAULT false,
  garden BOOLEAN DEFAULT false,
  elevator BOOLEAN DEFAULT false,
  furnished BOOLEAN DEFAULT false,
  parking INTEGER DEFAULT 0,
  
  -- Performance énergétique
  energy_class VARCHAR(10),
  heating_type VARCHAR(100),
  construction_year INTEGER,
  
  -- Informations financières
  charges DECIMAL(10, 2), -- Charges mensuelles
  tax_fonciere DECIMAL(10, 2), -- Taxe foncière annuelle
  sale_off VARCHAR(50), -- Promo type "-10% today"
  
  -- Image principale
  featured_image TEXT,
  
  -- Metadata et SEO
  slug VARCHAR(255) UNIQUE,
  published BOOLEAN DEFAULT true,
  is_ads BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  -- Reviews aggregate
  review_rating DECIMAL(2,1) DEFAULT 0, -- Note moyenne sur 5
  review_count INTEGER DEFAULT 0,
  
  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  listing_date DATE DEFAULT CURRENT_DATE
);

-- Table des images pour chaque propriété
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 0, -- Ordre d'affichage
  alt_text VARCHAR(255),
  caption TEXT,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des équipements/caractéristiques
CREATE TABLE property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  amenity_type VARCHAR(50) NOT NULL, -- 'feature', 'equipment', 'service'
  amenity_name VARCHAR(100) NOT NULL, -- 'WiFi', 'Piscine', 'Climatisation'
  amenity_value TEXT, -- Valeur optionnelle
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des avis/reviews
CREATE TABLE property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Auteur de l'avis
  reviewer_name VARCHAR(255) NOT NULL,
  reviewer_email VARCHAR(255),
  reviewer_avatar TEXT,
  
  -- Contenu de l'avis
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title VARCHAR(255),
  comment TEXT,
  
  -- Metadata
  verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des favoris (existante, améliorée)
CREATE TABLE property_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, property_id)
);

-- Table des demandes de contact (existante, améliorée)
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Informations du demandeur
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  
  -- Type de demande
  request_type VARCHAR(50) CHECK (request_type IN ('information', 'visite', 'estimation', 'autre')) DEFAULT 'information',
  preferred_contact VARCHAR(20) CHECK (preferred_contact IN ('email', 'phone', 'both')) DEFAULT 'email',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  processed_by VARCHAR(255),
  notes TEXT,
  
  -- Données de session
  user_agent TEXT,
  ip_address INET
);

-- Table des estimations (existante, améliorée)
CREATE TABLE property_estimations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations du demandeur
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  
  -- Informations du bien à estimer
  property_type VARCHAR(50) CHECK (property_type IN ('maison', 'appartement', 'locaux_commerciaux', 'parking', 'terrain', 'autres')) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  
  -- Caractéristiques
  surface DECIMAL(10, 2),
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  construction_year INTEGER,
  condition VARCHAR(50) CHECK (condition IN ('neuf', 'tres_bon', 'bon', 'a_rafraichir', 'a_renover')),
  
  -- Description et contexte
  description TEXT,
  estimation_reason VARCHAR(100), -- 'vente', 'achat', 'succession', 'divorce', etc.
  urgency VARCHAR(20) CHECK (urgency IN ('low', 'medium', 'high')) DEFAULT 'medium',
  
  -- Résultat de l'estimation
  estimated_value_min DECIMAL(12, 2),
  estimated_value_max DECIMAL(12, 2),
  estimated_value_avg DECIMAL(12, 2),
  estimation_notes TEXT,
  estimation_method VARCHAR(50), -- 'comparative', 'cost', 'income'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  processed_by VARCHAR(255),
  
  -- Suivi commercial
  follow_up_date DATE,
  converted_to_listing BOOLEAN DEFAULT false,
  converted_property_id UUID REFERENCES properties(id)
);

-- Index pour optimiser les performances
CREATE INDEX idx_properties_location ON properties(city, postal_code);
CREATE INDEX idx_properties_type_transaction ON properties(property_type, transaction_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_geo ON properties(latitude, longitude);
CREATE INDEX idx_properties_status ON properties(status, published);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_handle ON properties(handle);

CREATE INDEX idx_property_images_property ON property_images(property_id, image_order);
CREATE INDEX idx_property_amenities_property ON property_amenities(property_id, amenity_type);
CREATE INDEX idx_property_reviews_property ON property_reviews(property_id, published);
CREATE INDEX idx_property_reviews_rating ON property_reviews(rating, created_at);

-- Triggers pour automatiser certaines actions

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour les statistiques de review
CREATE OR REPLACE FUNCTION update_property_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer les stats pour la propriété concernée
    UPDATE properties SET 
        review_rating = (
            SELECT ROUND(AVG(rating::numeric), 1) 
            FROM property_reviews 
            WHERE property_id = COALESCE(NEW.property_id, OLD.property_id) 
            AND published = true
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM property_reviews 
            WHERE property_id = COALESCE(NEW.property_id, OLD.property_id) 
            AND published = true
        )
    WHERE id = COALESCE(NEW.property_id, OLD.property_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_review_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON property_reviews
    FOR EACH ROW EXECUTE FUNCTION update_property_review_stats();

-- Fonction pour générer automatiquement un slug
CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = lower(
            regexp_replace(
                regexp_replace(
                    unaccent(NEW.title), 
                    '[^a-zA-Z0-9\s]', '', 'g'
                ), 
                '\s+', '-', 'g'
            )
        ) || '-' || substring(NEW.id::text from 1 for 8);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_property_slug_trigger
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION generate_property_slug();

-- Politiques de sécurité RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_estimations ENABLE ROW LEVEL SECURITY;

-- Politiques publiques pour la consultation
CREATE POLICY "Properties are viewable by everyone" ON properties
    FOR SELECT USING (published = true);

CREATE POLICY "Property images are viewable by everyone" ON property_images
    FOR SELECT USING (
        property_id IN (SELECT id FROM properties WHERE published = true)
    );

CREATE POLICY "Property amenities are viewable by everyone" ON property_amenities
    FOR SELECT USING (
        property_id IN (SELECT id FROM properties WHERE published = true)
    );

CREATE POLICY "Property reviews are viewable by everyone" ON property_reviews
    FOR SELECT USING (published = true);

-- Politique pour les favoris (utilisateurs authentifiés)
CREATE POLICY "Users can manage their own favorites" ON property_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Vue des statistiques enrichie
CREATE OR REPLACE VIEW property_statistics AS
SELECT 
    COUNT(*) as total_properties,
    COUNT(*) FILTER (WHERE transaction_type = 'vente') as for_sale,
    COUNT(*) FILTER (WHERE transaction_type = 'location') as for_rent,
    COUNT(*) FILTER (WHERE status = 'disponible') as available,
    COUNT(*) FILTER (WHERE status = 'sous_offre') as under_offer,
    COUNT(*) FILTER (WHERE status IN ('vendu', 'loue')) as sold_rented,
    AVG(price) FILTER (WHERE transaction_type = 'vente') as avg_sale_price,
    AVG(price) FILTER (WHERE transaction_type = 'location') as avg_rent_price,
    AVG(review_rating) as avg_rating,
    SUM(views_count) as total_views,
    SUM(review_count) as total_reviews
FROM properties
WHERE published = true;

-- Vue pour les propriétés avec leurs images
CREATE OR REPLACE VIEW properties_with_images AS
SELECT 
    p.*,
    array_agg(pi.image_url ORDER BY pi.image_order) FILTER (WHERE pi.image_url IS NOT NULL) as gallery_images,
    array_agg(DISTINCT pa.amenity_name) FILTER (WHERE pa.amenity_name IS NOT NULL) as amenities_list
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id
LEFT JOIN property_amenities pa ON p.id = pa.property_id
GROUP BY p.id;

-- Fonctions utilitaires

-- Fonction pour rechercher des propriétés
CREATE OR REPLACE FUNCTION search_properties(
    search_query TEXT DEFAULT NULL,
    min_price INTEGER DEFAULT NULL,
    max_price INTEGER DEFAULT NULL,
    property_types TEXT[] DEFAULT NULL,
    transaction_types TEXT[] DEFAULT NULL,
    cities TEXT[] DEFAULT NULL,
    min_rooms INTEGER DEFAULT NULL,
    min_surface DECIMAL DEFAULT NULL,
    amenities TEXT[] DEFAULT NULL,
    sort_by TEXT DEFAULT 'created_at',
    sort_order TEXT DEFAULT 'DESC',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    price INTEGER,
    transaction_type VARCHAR,
    property_type VARCHAR,
    city VARCHAR,
    featured_image TEXT,
    review_rating DECIMAL,
    review_count INTEGER,
    surface DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.title, p.price, p.transaction_type, p.property_type, 
        p.city, p.featured_image, p.review_rating, p.review_count, p.surface
    FROM properties p
    WHERE 
        p.published = true
        AND (search_query IS NULL OR p.title ILIKE '%' || search_query || '%' OR p.description ILIKE '%' || search_query || '%')
        AND (min_price IS NULL OR p.price >= min_price)
        AND (max_price IS NULL OR p.price <= max_price)
        AND (property_types IS NULL OR p.property_type = ANY(property_types))
        AND (transaction_types IS NULL OR p.transaction_type = ANY(transaction_types))
        AND (cities IS NULL OR p.city = ANY(cities))
        AND (min_rooms IS NULL OR p.rooms >= min_rooms)
        AND (min_surface IS NULL OR p.surface >= min_surface)
    ORDER BY 
        CASE WHEN sort_by = 'price' AND sort_order = 'ASC' THEN p.price END ASC,
        CASE WHEN sort_by = 'price' AND sort_order = 'DESC' THEN p.price END DESC,
        CASE WHEN sort_by = 'created_at' AND sort_order = 'ASC' THEN p.created_at END ASC,
        CASE WHEN sort_by = 'created_at' AND sort_order = 'DESC' THEN p.created_at END DESC,
        CASE WHEN sort_by = 'rating' AND sort_order = 'DESC' THEN p.review_rating END DESC NULLS LAST
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Les données d'équipements seront ajoutées lors de la migration des propriétés
-- Pas d'insertion ici car il n'y a pas encore de propriétés

-- Indexes pour la recherche full-text
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('french', title || ' ' || COALESCE(description, '')));

COMMENT ON TABLE properties IS 'Table principale des biens immobiliers avec toutes les caractéristiques';
COMMENT ON TABLE property_images IS 'Images associées à chaque propriété avec ordre et métadonnées';
COMMENT ON TABLE property_amenities IS 'Équipements et caractéristiques spéciales de chaque propriété';
COMMENT ON TABLE property_reviews IS 'Avis et notes des clients/visiteurs';
COMMENT ON TABLE contact_requests IS 'Demandes de contact et d''information sur les propriétés';
COMMENT ON TABLE property_estimations IS 'Demandes d''estimation de biens immobiliers';