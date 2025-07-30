-- MASTERCLASS ONM - Schéma E-commerce Formations
-- Base de données complète pour plateforme de formations présentielles orthodontiques

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- =============================================================================
-- 1. AUTHENTIFICATION & PROFILS UTILISATEURS
-- =============================================================================

-- Table profils utilisateurs (étend auth.users de Supabase)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(200),
    profession VARCHAR(100),
    experience_level VARCHAR(20) CHECK (experience_level IN ('debutant', 'intermediaire', 'avance', 'expert')),
    
    -- Adresses
    billing_address JSONB,
    shipping_address JSONB,
    
    -- Certifications obtenues
    certificates TEXT[],
    
    -- Programme fidélité
    loyalty_points INTEGER DEFAULT 0,
    total_formations_completed INTEGER DEFAULT 0,
    
    -- Préférences
    language VARCHAR(5) DEFAULT 'fr',
    newsletter_subscribed BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index sur profils
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_profession ON user_profiles(profession);
CREATE INDEX idx_user_profiles_experience ON user_profiles(experience_level);

-- =============================================================================
-- 2. FORMATEURS / INSTRUCTEURS
-- =============================================================================

CREATE TABLE instructors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    title VARCHAR(200),
    bio TEXT,
    specialties TEXT[],
    photo_url TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    
    -- Statistiques
    rating DECIMAL(2,1) DEFAULT 0,
    formations_count INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    
    -- Visibilité
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index formateurs
CREATE INDEX idx_instructors_active ON instructors(active);
CREATE INDEX idx_instructors_featured ON instructors(featured);

-- =============================================================================
-- 3. CEPROF - CERCLE DE SPÉCIALISTES
-- =============================================================================

CREATE TABLE ceprof_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    title VARCHAR(200),
    profession VARCHAR(100),
    speciality VARCHAR(100),
    bio TEXT,
    photo_url TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    
    -- Localisation
    city VARCHAR(100),
    country VARCHAR(100),
    
    -- Contributions à l'ONM
    contributions TEXT[],
    testimonials JSONB,
    
    -- Affichage
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index CEPROF
CREATE INDEX idx_ceprof_active ON ceprof_members(active);
CREATE INDEX idx_ceprof_featured ON ceprof_members(featured);
CREATE INDEX idx_ceprof_profession ON ceprof_members(profession);

-- =============================================================================
-- 4. FORMATIONS (PRODUITS)
-- =============================================================================

CREATE TABLE formations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    
    -- Détails formation
    duration_days INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    capacity INTEGER DEFAULT 20,
    level VARCHAR(20) CHECK (level IN ('debutant', 'intermediaire', 'avance', 'expert')),
    module_number INTEGER,
    
    -- Contenu pédagogique
    prerequisites TEXT[],
    learning_objectives TEXT[],
    program_details TEXT[],
    
    -- Formateur
    instructor_id UUID REFERENCES instructors(id),
    
    -- Médias
    featured_image TEXT,
    gallery_images TEXT[],
    
    -- SEO
    seo_title VARCHAR(300),
    seo_description TEXT,
    seo_keywords TEXT[],
    
    -- Statut
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    
    -- Statistiques
    total_sessions INTEGER DEFAULT 0,
    total_registrations INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index formations
CREATE INDEX idx_formations_status ON formations(status);
CREATE INDEX idx_formations_level ON formations(level);
CREATE INDEX idx_formations_instructor ON formations(instructor_id);
CREATE INDEX idx_formations_slug ON formations(slug);

-- =============================================================================
-- 5. SESSIONS DE FORMATIONS (DATES/VILLES)
-- =============================================================================

CREATE TABLE formation_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    formation_id UUID REFERENCES formations(id) ON DELETE CASCADE NOT NULL,
    
    -- Dates
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Lieu
    city VARCHAR(100) NOT NULL,
    venue_name VARCHAR(200),
    venue_address JSONB,
    
    -- Capacité
    available_spots INTEGER NOT NULL,
    total_spots INTEGER NOT NULL DEFAULT 20,
    
    -- Prix spécifique (surcharge éventuelle)
    price_override DECIMAL(10,2),
    
    -- Statut
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    
    -- Informations pratiques
    practical_info TEXT,
    materials_included TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index sessions
CREATE INDEX idx_sessions_formation ON formation_sessions(formation_id);
CREATE INDEX idx_sessions_dates ON formation_sessions(start_date, end_date);
CREATE INDEX idx_sessions_city ON formation_sessions(city);
CREATE INDEX idx_sessions_status ON formation_sessions(status);

-- =============================================================================
-- 6. SYSTÈME DE PANIER
-- =============================================================================

CREATE TABLE carts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- Pour paniers anonymes
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES formation_sessions(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index panier
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- =============================================================================
-- 7. COMMANDES
-- =============================================================================

CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Montants
    subtotal_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Statuts
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial')),
    
    -- Adresses
    billing_address JSONB NOT NULL,
    shipping_address JSONB,
    
    -- Informations complémentaires
    notes TEXT,
    coupon_code VARCHAR(50),
    
    -- Dates importantes
    payment_date TIMESTAMP WITH TIME ZONE,
    shipped_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES formation_sessions(id) NOT NULL,
    formation_title VARCHAR(300) NOT NULL,
    formation_dates VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);

-- Index commandes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =============================================================================
-- 8. INSCRIPTIONS (POST-COMMANDE)
-- =============================================================================

CREATE TABLE registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    order_id UUID REFERENCES orders(id) NOT NULL,
    session_id UUID REFERENCES formation_sessions(id) NOT NULL,
    
    -- Statut inscription
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'attended', 'absent', 'cancelled')),
    
    -- Présence et évaluation
    attendance_status VARCHAR(20) CHECK (attendance_status IN ('present', 'absent', 'partial')),
    attendance_percentage INTEGER CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),
    
    -- Certification
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    certificate_date TIMESTAMP WITH TIME ZONE,
    
    -- Notes formateur
    instructor_notes TEXT,
    final_score INTEGER CHECK (final_score >= 0 AND final_score <= 100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index inscriptions
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_session ON registrations(session_id);
CREATE INDEX idx_registrations_order ON registrations(order_id);

-- =============================================================================
-- 9. QUESTIONNAIRES PRÉ/POST FORMATION
-- =============================================================================

CREATE TABLE questionnaires (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    formation_id UUID REFERENCES formations(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('pre_formation', 'post_formation', 'satisfaction')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL, -- Structure: [{ type, question, options, required }]
    is_required BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE questionnaire_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    registration_id UUID REFERENCES registrations(id),
    questionnaire_id UUID REFERENCES questionnaires(id) NOT NULL,
    responses JSONB NOT NULL, -- Réponses structurées
    score INTEGER, -- Score calculé si applicable
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index questionnaires
CREATE INDEX idx_questionnaires_formation ON questionnaires(formation_id);
CREATE INDEX idx_questionnaire_responses_user ON questionnaire_responses(user_id);
CREATE INDEX idx_questionnaire_responses_registration ON questionnaire_responses(registration_id);

-- =============================================================================
-- 10. PAIEMENTS LCL SHERLOCKS
-- =============================================================================

CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) NOT NULL,
    
    -- Montant
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Données LCL
    lcl_transaction_id VARCHAR(100),
    lcl_payment_id VARCHAR(100),
    lcl_response JSONB, -- Réponse complète de LCL
    
    -- Statut
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Méthode
    payment_method VARCHAR(50), -- carte, virement, etc.
    
    -- 3D Secure
    three_d_secure_status VARCHAR(20),
    
    -- Dates
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Informations échec
    failure_reason TEXT,
    failure_code VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index paiements
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_lcl_transaction ON payments(lcl_transaction_id);

-- =============================================================================
-- 11. AVIS & ÉVALUATIONS
-- =============================================================================

CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    formation_id UUID REFERENCES formations(id) ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES registrations(id),
    
    -- Évaluation
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Critères détaillés
    content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
    instructor_rating INTEGER CHECK (instructor_rating >= 1 AND instructor_rating <= 5),
    organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
    venue_rating INTEGER CHECK (venue_rating >= 1 AND venue_rating <= 5),
    
    -- Vérifications
    verified_purchase BOOLEAN DEFAULT false,
    moderated BOOLEAN DEFAULT false,
    approved BOOLEAN DEFAULT true,
    
    -- Utilité
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index avis
CREATE INDEX idx_reviews_formation ON reviews(formation_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_approved ON reviews(approved);

-- =============================================================================
-- 12. COUPONS & PROMOTIONS
-- =============================================================================

CREATE TABLE coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200),
    description TEXT,
    
    -- Type de réduction
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
    value DECIMAL(10,2) NOT NULL,
    
    -- Conditions
    min_amount DECIMAL(10,2),
    max_discount DECIMAL(10,2),
    
    -- Limitations d'usage
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    
    -- Applicabilité
    applicable_formations UUID[], -- IDs formations spécifiques
    applicable_categories TEXT[], -- Catégories
    first_time_only BOOLEAN DEFAULT false,
    
    -- Validité
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE coupon_uses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coupon_id UUID REFERENCES coupons(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    order_id UUID REFERENCES orders(id) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index coupons
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(active);
CREATE INDEX idx_coupon_uses_user ON coupon_uses(user_id);

-- =============================================================================
-- 13. FONCTIONS UTILITAIRES
-- =============================================================================

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ONM-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Séquence pour numéros de commande
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger pour auto-générer le numéro de commande
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at sur toutes les tables principales
CREATE TRIGGER trigger_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_instructors_updated_at BEFORE UPDATE ON instructors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_ceprof_members_updated_at BEFORE UPDATE ON ceprof_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_formations_updated_at BEFORE UPDATE ON formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_formation_sessions_updated_at BEFORE UPDATE ON formation_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 14. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceprof_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS basiques (à affiner selon besoins)

-- Profils utilisateurs : utilisateur peut voir/modifier son profil
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Formations publiques : lecture libre
CREATE POLICY "Formations are viewable by everyone" ON formations FOR SELECT USING (status = 'active');
CREATE POLICY "Sessions are viewable by everyone" ON formation_sessions FOR SELECT USING (status IN ('scheduled', 'confirmed'));

-- Instructeurs publics
CREATE POLICY "Instructors are viewable by everyone" ON instructors FOR SELECT USING (active = true);

-- CEPROF public
CREATE POLICY "CEPROF members are viewable by everyone" ON ceprof_members FOR SELECT USING (active = true);

-- Paniers : utilisateur propriétaire seulement
CREATE POLICY "Users can manage own carts" ON carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage cart items" ON cart_items FOR ALL USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- Commandes : utilisateur propriétaire seulement
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inscriptions : utilisateur propriétaire seulement
CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (auth.uid() = user_id);

-- Avis : lecture libre, création par propriétaire
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 15. DONNÉES DE TEST (OPTIONNEL)
-- =============================================================================

-- Quelques formateurs de test
INSERT INTO instructors (name, title, bio, specialties, rating, active) VALUES
('Dr. Jean Dupont', 'Orthodontiste spécialisé ONM', 'Expert en orthodontie neuro-musculaire avec 15 ans d''expérience', ARRAY['ONM', 'Orthodontie'], 4.8, true),
('Dr. Marie Martin', 'Spécialiste en rééducation', 'Pionnière de la rééducation oro-faciale', ARRAY['Rééducation', 'Orthophonie'], 4.9, true);

-- Formation exemple
INSERT INTO formations (title, slug, description, duration_days, price, level, instructor_id) VALUES
('Initiation à l''Orthodontie Neuro-Musculaire', 'initiation-onm', 'Formation complète d''introduction aux concepts fondamentaux de l''ONM', 2, 890.00, 'debutant', (SELECT id FROM instructors WHERE name = 'Dr. Jean Dupont' LIMIT 1));

-- Session exemple
INSERT INTO formation_sessions (formation_id, start_date, end_date, city, venue_name, available_spots, total_spots) VALUES
((SELECT id FROM formations WHERE slug = 'initiation-onm' LIMIT 1), '2024-03-15 09:00:00+01', '2024-03-16 17:00:00+01', 'Paris', 'Centre de Formation Médical Paris', 18, 20);

-- Membre CEPROF exemple
INSERT INTO ceprof_members (name, title, profession, speciality, bio, city, country, active) VALUES
('Dr. Sophie Durand', 'Kinésithérapeute spécialisée', 'Kinésithérapeute', 'Rééducation oro-faciale', 'Experte en rééducation des troubles oro-faciaux chez l''enfant et l''adulte', 'Lyon', 'France', true);

-- =============================================================================
-- FIN DU SCHÉMA
-- =============================================================================