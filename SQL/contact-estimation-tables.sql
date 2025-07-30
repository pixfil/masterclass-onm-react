-- Script pour créer les tables de contacts et demandes d'estimation
-- À exécuter dans le SQL Editor de Supabase

-- 1. Table des contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    status VARCHAR(50) DEFAULT 'nouveau', -- nouveau, lu, traité, archivé
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Clés étrangères optionnelles
    CONSTRAINT fk_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents_immobiliers(id) ON DELETE SET NULL
);

-- 2. Table des demandes d'estimation
CREATE TABLE IF NOT EXISTS estimation_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- Informations client
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    
    -- Informations sur le bien
    type_bien VARCHAR(50) NOT NULL, -- appartement, maison, terrain, etc.
    adresse VARCHAR(500) NOT NULL,
    ville VARCHAR(255) NOT NULL,
    code_postal VARCHAR(10),
    surface_habitable DECIMAL(10,2),
    surface_terrain DECIMAL(10,2),
    nombre_pieces INTEGER,
    nombre_chambres INTEGER,
    nombre_salles_bain INTEGER,
    annee_construction INTEGER,
    
    -- Détails supplémentaires
    description_travaux TEXT,
    delai_vente VARCHAR(50), -- immédiat, 3 mois, 6 mois, 1 an, plus
    raison_vente TEXT,
    estimation_prix DECIMAL(15,2), -- estimation du propriétaire
    
    -- État et suivi
    status VARCHAR(50) DEFAULT 'nouveau', -- nouveau, contacté, visite_planifiée, estimé, archivé
    agent_assigned_id UUID,
    agent_assigned_name VARCHAR(255),
    notes_internes TEXT,
    estimation_finale DECIMAL(15,2),
    date_visite TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées
    source VARCHAR(50) DEFAULT 'site_web', -- site_web, telephone, email, agence
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    contacted_at TIMESTAMP WITH TIME ZONE,
    estimated_at TIMESTAMP WITH TIME ZONE,
    
    -- Clé étrangère optionnelle
    CONSTRAINT fk_agent_assigned FOREIGN KEY (agent_assigned_id) REFERENCES agents_immobiliers(id) ON DELETE SET NULL
);

-- 3. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_property_id ON contacts(property_id);
CREATE INDEX IF NOT EXISTS idx_contacts_agent_id ON contacts(agent_id);

CREATE INDEX IF NOT EXISTS idx_estimation_status ON estimation_requests(status);
CREATE INDEX IF NOT EXISTS idx_estimation_created_at ON estimation_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimation_agent_id ON estimation_requests(agent_assigned_id);
CREATE INDEX IF NOT EXISTS idx_estimation_ville ON estimation_requests(ville);

-- 4. Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimation_requests_updated_at BEFORE UPDATE ON estimation_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Politiques RLS (Row Level Security)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs authentifiés de créer des contacts (formulaire public)
CREATE POLICY "Allow public to create contacts" ON contacts
    FOR INSERT TO anon
    WITH CHECK (true);

-- Politique pour permettre aux utilisateurs authentifiés de créer des demandes d'estimation
CREATE POLICY "Allow public to create estimation requests" ON estimation_requests
    FOR INSERT TO anon
    WITH CHECK (true);

-- Politique pour permettre aux utilisateurs authentifiés (admin) de tout voir et modifier
CREATE POLICY "Allow authenticated to manage contacts" ON contacts
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated to manage estimation requests" ON estimation_requests
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Commentaires pour la documentation
COMMENT ON TABLE contacts IS 'Messages de contact reçus via le site web';
COMMENT ON TABLE estimation_requests IS 'Demandes d''estimation immobilière reçues via le site web';

COMMENT ON COLUMN contacts.status IS 'Statut du contact: nouveau, lu, traité, archivé';
COMMENT ON COLUMN estimation_requests.status IS 'Statut de la demande: nouveau, contacté, visite_planifiée, estimé, archivé';
COMMENT ON COLUMN estimation_requests.delai_vente IS 'Délai souhaité pour la vente: immédiat, 3 mois, 6 mois, 1 an, plus';