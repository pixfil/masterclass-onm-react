-- Script pour créer les tables manquantes pour l'admin
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents_immobiliers(id) ON DELETE SET NULL
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

-- 4. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_property_estimations_created_at ON property_estimations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_estimations_processed ON property_estimations(processed);

CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_property_id ON contacts(property_id);
CREATE INDEX IF NOT EXISTS idx_contacts_agent_id ON contacts(agent_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscriptions(created_at DESC);

-- 5. Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contacts_updated_at') THEN
        CREATE TRIGGER update_contacts_updated_at 
            BEFORE UPDATE ON contacts 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_newsletter_updated_at') THEN
        CREATE TRIGGER update_newsletter_updated_at 
            BEFORE UPDATE ON newsletter_subscriptions 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- 6. Désactiver temporairement RLS pour éviter les erreurs admin
ALTER TABLE property_estimations DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;  
ALTER TABLE newsletter_subscriptions DISABLE ROW LEVEL SECURITY;

-- 7. Commentaires
COMMENT ON TABLE property_estimations IS 'Demandes d''estimation immobilière reçues via le site web';
COMMENT ON TABLE contacts IS 'Messages de contact reçus via le site web';
COMMENT ON TABLE newsletter_subscriptions IS 'Abonnements à la newsletter';