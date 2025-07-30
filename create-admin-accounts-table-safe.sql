-- Création sécurisée de la table admin_accounts
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

-- Index pour performance (seulement si ils n'existent pas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_accounts_email') THEN
        CREATE INDEX idx_admin_accounts_email ON admin_accounts(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_accounts_role') THEN
        CREATE INDEX idx_admin_accounts_role ON admin_accounts(role);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_accounts_status') THEN
        CREATE INDEX idx_admin_accounts_status ON admin_accounts(status);
    END IF;
END $$;

-- Fonction pour mettre à jour updated_at (remplacer si existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer le trigger s'il existe, puis le recréer
DROP TRIGGER IF EXISTS update_admin_accounts_updated_at ON admin_accounts;
CREATE TRIGGER update_admin_accounts_updated_at 
    BEFORE UPDATE ON admin_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer les comptes super admin (ignorer si ils existent déjà)
INSERT INTO admin_accounts (email, name, role, status) VALUES
    ('philippe@gclicke.com', 'Philippe G.', 'super_admin', 'active'),
    ('philippe@initiative-immo.fr', 'Philippe Initiative', 'super_admin', 'active'),
    ('admin@initiative-immo.fr', 'Admin Initiative', 'super_admin', 'active'),
    ('coual.philippe@gmail.com', 'Philippe Coual', 'super_admin', 'active')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Activer RLS
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Super admins can view all admin accounts" ON admin_accounts;
DROP POLICY IF EXISTS "Super admins can modify all admin accounts" ON admin_accounts;

-- Recréer les politiques
CREATE POLICY "Super admins can view all admin accounts" ON admin_accounts
    FOR SELECT USING (
        auth.email() IN (
            'philippe@gclicke.com',
            'philippe@initiative-immo.fr', 
            'admin@initiative-immo.fr',
            'coual.philippe@gmail.com'
        )
    );

CREATE POLICY "Super admins can modify all admin accounts" ON admin_accounts
    FOR ALL USING (
        auth.email() IN (
            'philippe@gclicke.com',
            'philippe@initiative-immo.fr', 
            'admin@initiative-immo.fr',
            'coual.philippe@gmail.com'
        )
    );

-- Vérifier que les données ont été insérées
SELECT 'Comptes admin créés:' as info, count(*) as total FROM admin_accounts;