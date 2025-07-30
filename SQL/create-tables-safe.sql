-- Script sécurisé pour créer les tables manquantes pour l'admin
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Créer la table property_estimations si elle n'existe pas
CREATE TABLE IF NOT EXISTS property_estimations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    property_type VARCHAR(100) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    zipcode VARCHAR(10),
    surface DECIMAL(10,2),
    rooms INTEGER,
    year_built INTEGER,
    condition VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    estimated_value DECIMAL(15,2),
    estimation_notes TEXT
);

-- 2. Créer la table contacts si elle n'existe pas
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    objet VARCHAR(255),
    message TEXT NOT NULL,
    property_id UUID,
    property_title VARCHAR(255),
    property_reference VARCHAR(50),
    agent_id UUID,
    agent_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'nouveau',
    read_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer la table newsletter_subscriptions si elle n'existe pas
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    source VARCHAR(100) DEFAULT 'website',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Désactiver RLS immédiatement sur les tables créées
DO $$
BEGIN
    -- Property estimations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_estimations') THEN
        ALTER TABLE property_estimations DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Contacts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
        ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Newsletter
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions') THEN
        ALTER TABLE newsletter_subscriptions DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- 5. Créer les index seulement si les colonnes existent
DO $$
BEGIN
    -- Index pour property_estimations
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_estimations' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_property_estimations_created_at ON property_estimations(created_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_estimations' AND column_name = 'processed') THEN
        CREATE INDEX IF NOT EXISTS idx_property_estimations_processed ON property_estimations(processed);
    END IF;
    
    -- Index pour contacts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
    END IF;
    
    -- Index pour newsletter  
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletter_subscriptions' AND column_name = 'email') THEN
        CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletter_subscriptions' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);
    END IF;
END
$$;

-- 6. Message de confirmation
SELECT 'Tables créées et RLS désactivé' as status;