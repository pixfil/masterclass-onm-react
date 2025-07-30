-- Insérer simplement les comptes admin
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

-- Vérifier les données
SELECT * FROM admin_accounts;