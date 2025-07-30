-- Adaptation de la table agents_immobiliers existante pour l'authentification
-- Exécuter ce script en premier dans Supabase Dashboard > SQL Editor

-- Ajouter les colonnes manquantes à la table agents_immobiliers existante
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'agent'; -- 'admin', 'agent'
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'; -- 'pending', 'approved', 'rejected'
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES agents_immobiliers(id);
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Renommer/mapper les colonnes existantes si nécessaire
-- email, prenom, nom existent déjà
-- Ajouter des colonnes pour la compatibilité avec notre système
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS siret VARCHAR(14);

-- Mettre à jour les données existantes
UPDATE agents_immobiliers 
SET 
  first_name = prenom,
  last_name = nom,
  phone = telephone,
  status = 'approved',
  approved_at = NOW(),
  role = 'agent'
WHERE first_name IS NULL OR last_name IS NULL;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_agents_immobiliers_email ON agents_immobiliers(email);
CREATE INDEX IF NOT EXISTS idx_agents_immobiliers_status ON agents_immobiliers(status);
CREATE INDEX IF NOT EXISTS idx_agents_immobiliers_role ON agents_immobiliers(role);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_immobiliers_updated_at 
    BEFORE UPDATE ON agents_immobiliers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE agents_immobiliers ENABLE ROW LEVEL SECURITY;

-- Politique pour les agents : ils peuvent voir leurs propres données
CREATE POLICY "Agents can view own data" ON agents_immobiliers
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Agents can update own data" ON agents_immobiliers
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Politique pour les admins : ils peuvent tout voir et modifier
CREATE POLICY "Admins can manage all agents" ON agents_immobiliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM agents_immobiliers 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
            AND status = 'approved'
        )
    );

-- Insérer l'agent admin principal (Julien Lindenau)
INSERT INTO agents_immobiliers (
  email, 
  prenom,
  nom,
  first_name, 
  last_name, 
  phone, 
  company, 
  role, 
  status, 
  approved_at,
  annees_experience,
  description_agent
) VALUES (
  'julien.lindenau@initiative-immobilier.fr',
  'Julien',
  'Lindenau',
  'Julien',
  'Lindenau',
  '03 88 XX XX XX',
  'Initiative Immobilier',
  'admin',
  'approved',
  NOW(),
  10,
  'Fondateur et directeur d''Initiative Immobilier, spécialisé dans l''accompagnement personnalisé des projets immobiliers en Alsace.'
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  status = 'approved',
  approved_at = NOW(),
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

COMMENT ON TABLE agents_immobiliers IS 'Table des agents immobiliers et administrateurs';
COMMENT ON COLUMN agents_immobiliers.status IS 'Statut de l''agent: pending, approved, rejected';
COMMENT ON COLUMN agents_immobiliers.role IS 'Rôle: admin, agent';
COMMENT ON COLUMN agents_immobiliers.requested_at IS 'Date de demande d''inscription comme agent';
COMMENT ON COLUMN agents_immobiliers.approved_at IS 'Date d''approbation du compte agent';