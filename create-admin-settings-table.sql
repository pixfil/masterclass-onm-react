-- ==============================================
-- TABLE PARAMÈTRES ADMIN SÉCURISÉE
-- ==============================================

-- Table pour stocker les paramètres admin de façon sécurisée
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'ai', 'email', 'analytics', 'stripe'
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, category, setting_key)
);

-- Index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_admin_settings_user_category ON admin_settings(user_id, category);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- RLS Policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent gérer leurs propres paramètres
CREATE POLICY "Users can manage own settings" ON admin_settings
  USING (auth.uid() = user_id);

-- Les super admins peuvent accéder à tous les paramètres
CREATE POLICY "Super admins can access all settings" ON admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'philippe@gclicke.com',
        'philippe@initiative-immo.fr', 
        'admin@initiative-immo.fr',
        'coual.philippe@gmail.com'
      )
    )
  );

-- Fonction pour obtenir un paramètre
CREATE OR REPLACE FUNCTION get_admin_setting(p_category VARCHAR, p_key VARCHAR)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT setting_value INTO result
  FROM admin_settings
  WHERE user_id = auth.uid()
    AND category = p_category
    AND setting_key = p_key;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour définir un paramètre
CREATE OR REPLACE FUNCTION set_admin_setting(p_category VARCHAR, p_key VARCHAR, p_value TEXT, p_encrypted BOOLEAN DEFAULT false)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO admin_settings (user_id, category, setting_key, setting_value, is_encrypted)
  VALUES (auth.uid(), p_category, p_key, p_value, p_encrypted)
  ON CONFLICT (user_id, category, setting_key)
  DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    is_encrypted = EXCLUDED.is_encrypted,
    updated_at = NOW();
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir tous les paramètres d'une catégorie
CREATE OR REPLACE FUNCTION get_admin_settings_by_category(p_category VARCHAR)
RETURNS TABLE(setting_key VARCHAR, setting_value TEXT, is_encrypted BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT s.setting_key, s.setting_value, s.is_encrypted
  FROM admin_settings s
  WHERE s.user_id = auth.uid()
    AND s.category = p_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE admin_settings IS 'Paramètres administrateur stockés de façon sécurisée';
COMMENT ON COLUMN admin_settings.is_encrypted IS 'Indique si la valeur doit être chiffrée côté application';
COMMENT ON COLUMN admin_settings.category IS 'Catégorie : ai, email, analytics, stripe';
COMMENT ON COLUMN admin_settings.setting_key IS 'Clé du paramètre (ex: openai_api_key, brevo_api_key)';