-- ==============================================
-- TABLE DE SUIVI DE L'USAGE IA
-- ==============================================

-- Table pour tracker l'usage des fonctionnalités IA
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  agent_id UUID REFERENCES agents_immobiliers(id) ON DELETE SET NULL,
  feature_type VARCHAR(50) NOT NULL, -- 'description_generation', 'highlights_generation', 'image_analysis'
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_euros DECIMAL(8,4) DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  model_used VARCHAR(50), -- 'gpt-4', 'claude-3', etc.
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes de performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature_date ON ai_usage(feature_type, created_at);

-- Vue pour les statistiques mensuelles par utilisateur
CREATE OR REPLACE VIEW ai_usage_monthly AS
SELECT 
  user_id,
  DATE_TRUNC('month', created_at) as month,
  feature_type,
  COUNT(*) as generations_count,
  SUM(tokens_used) as total_tokens,
  SUM(cost_euros) as total_cost,
  COUNT(*) FILTER (WHERE success = true) as successful_generations,
  COUNT(*) FILTER (WHERE success = false) as failed_generations
FROM ai_usage 
GROUP BY user_id, DATE_TRUNC('month', created_at), feature_type;

-- Vue pour l'usage quotidien (pour les limites)
CREATE OR REPLACE VIEW ai_usage_daily AS
SELECT 
  user_id,
  DATE_TRUNC('day', created_at) as day,
  feature_type,
  COUNT(*) as generations_today,
  SUM(tokens_used) as tokens_today
FROM ai_usage 
WHERE created_at >= CURRENT_DATE
GROUP BY user_id, DATE_TRUNC('day', created_at), feature_type;

-- Vue pour l'usage du mois en cours (pour affichage dans header)
CREATE OR REPLACE VIEW ai_usage_current_month AS
SELECT 
  user_id,
  COUNT(*) as generations_this_month,
  SUM(tokens_used) as tokens_this_month,
  COUNT(*) FILTER (WHERE feature_type = 'description_generation') as descriptions_generated,
  COUNT(*) FILTER (WHERE feature_type = 'highlights_generation') as highlights_generated
FROM ai_usage 
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY user_id;

-- Fonction pour obtenir l'usage IA d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_ai_usage(p_user_id UUID)
RETURNS TABLE (
  generations_this_month INTEGER,
  tokens_this_month INTEGER,
  descriptions_generated INTEGER,
  highlights_generated INTEGER,
  last_generation TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(cum.generations_this_month, 0)::INTEGER,
    COALESCE(cum.tokens_this_month, 0)::INTEGER,
    COALESCE(cum.descriptions_generated, 0)::INTEGER,
    COALESCE(cum.highlights_generated, 0)::INTEGER,
    (SELECT MAX(created_at) FROM ai_usage WHERE user_id = p_user_id)
  FROM ai_usage_current_month cum
  WHERE cum.user_id = p_user_id
  UNION ALL
  SELECT 0, 0, 0, 0, NULL::TIMESTAMP WITH TIME ZONE
  WHERE NOT EXISTS (SELECT 1 FROM ai_usage_current_month WHERE user_id = p_user_id)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir seulement leur propre usage
CREATE POLICY "Users can view own AI usage" ON ai_usage FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leur propre usage
CREATE POLICY "Users can insert own AI usage" ON ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les super admins peuvent tout voir
CREATE POLICY "Super admins can view all AI usage" ON ai_usage FOR ALL USING (
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

COMMENT ON TABLE ai_usage IS 'Suivi de l''utilisation des fonctionnalités IA par utilisateur';
COMMENT ON COLUMN ai_usage.feature_type IS 'Type de fonctionnalité IA utilisée';
COMMENT ON COLUMN ai_usage.tokens_used IS 'Nombre de tokens consommés pour cette génération';
COMMENT ON COLUMN ai_usage.cost_euros IS 'Coût en euros de cette génération';