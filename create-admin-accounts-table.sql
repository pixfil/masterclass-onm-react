-- Création de la table admin_accounts pour gérer les comptes administrateurs
CREATE TABLE IF NOT EXISTS admin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_role ON admin_accounts(role);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_status ON admin_accounts(status);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_accounts_updated_at 
    BEFORE UPDATE ON admin_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer les comptes super admin existants
INSERT INTO admin_accounts (email, name, role, status) VALUES
    ('philippe@gclicke.com', 'Philippe G.', 'super_admin', 'active'),
    ('philippe@initiative-immo.fr', 'Philippe Initiative', 'super_admin', 'active'),
    ('admin@initiative-immo.fr', 'Admin Initiative', 'super_admin', 'active'),
    ('coual.philippe@gmail.com', 'Philippe Coual', 'super_admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- RLS (Row Level Security) pour sécuriser l'accès
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux super admins de voir tous les comptes
CREATE POLICY "Super admins can view all admin accounts" ON admin_accounts
    FOR SELECT USING (
        auth.email() IN (
            'philippe@gclicke.com',
            'philippe@initiative-immo.fr', 
            'admin@initiative-immo.fr',
            'coual.philippe@gmail.com'
        )
    );

-- Politique pour permettre aux super admins de modifier tous les comptes
CREATE POLICY "Super admins can modify all admin accounts" ON admin_accounts
    FOR ALL USING (
        auth.email() IN (
            'philippe@gclicke.com',
            'philippe@initiative-immo.fr', 
            'admin@initiative-immo.fr',
            'coual.philippe@gmail.com'
        )
    );

COMMENT ON TABLE admin_accounts IS 'Table des comptes administrateurs de la plateforme';