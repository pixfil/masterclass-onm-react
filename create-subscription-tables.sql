-- ==============================================
-- TABLES POUR LE SYSTÈME D'ABONNEMENT STRIPE
-- ==============================================

-- 1. Table des plans d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  interval VARCHAR(20) DEFAULT 'month', -- 'month', 'year'
  features JSONB DEFAULT '{}', -- {"analytics": true, "ai": true, "max_properties": 100}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des abonnements des agents
CREATE TABLE IF NOT EXISTS agent_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents_immobiliers(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due', 'incomplete'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des factures
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES agent_subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  amount_paid DECIMAL(10,2),
  amount_due DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50), -- 'paid', 'open', 'void', 'uncollectible'
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des événements de paiement (pour l'historique)
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES agent_subscriptions(id) ON DELETE CASCADE,
  stripe_event_id VARCHAR(255) UNIQUE,
  event_type VARCHAR(100) NOT NULL, -- 'payment_succeeded', 'payment_failed', etc.
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des fonctionnalités débloquées
CREATE TABLE IF NOT EXISTS agent_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents_immobiliers(id) ON DELETE CASCADE UNIQUE,
  analytics_enabled BOOLEAN DEFAULT false,
  ai_enabled BOOLEAN DEFAULT false,
  max_properties INTEGER DEFAULT 10,
  max_ai_generations INTEGER DEFAULT 0,
  custom_domain BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  features JSONB DEFAULT '{}', -- Fonctionnalités supplémentaires
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- DONNÉES INITIALES POUR LES PLANS
-- ==============================================

INSERT INTO subscription_plans (stripe_price_id, name, description, price, features) VALUES
  ('price_basic_monthly', 'Basique', 'Idéal pour démarrer', 29.00, 
   '{"analytics": false, "ai": false, "max_properties": 20, "support": "email"}'::jsonb),
  
  ('price_pro_monthly', 'Professionnel', 'Pour les agents actifs', 79.00, 
   '{"analytics": true, "ai": true, "max_properties": 100, "max_ai_generations": 50, "support": "email"}'::jsonb),
  
  ('price_premium_monthly', 'Premium', 'Toutes les fonctionnalités', 149.00, 
   '{"analytics": true, "ai": true, "max_properties": -1, "max_ai_generations": -1, "custom_domain": true, "priority_support": true}'::jsonb)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- ==============================================
-- INDEXES POUR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_agent_id ON agent_subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_status ON agent_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_stripe_customer ON agent_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_subscription_id ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_subscription_id ON payment_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_agent_features_agent_id ON agent_features(agent_id);

-- ==============================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ==============================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE
    ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_subscriptions_updated_at BEFORE UPDATE
    ON agent_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_features_updated_at BEFORE UPDATE
    ON agent_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- FONCTION POUR VÉRIFIER L'ACCÈS AUX FONCTIONNALITÉS
-- ==============================================

CREATE OR REPLACE FUNCTION check_agent_feature_access(
  p_agent_id UUID,
  p_feature VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN := false;
BEGIN
  SELECT 
    CASE p_feature
      WHEN 'analytics' THEN af.analytics_enabled
      WHEN 'ai' THEN af.ai_enabled
      WHEN 'custom_domain' THEN af.custom_domain
      WHEN 'priority_support' THEN af.priority_support
      ELSE false
    END INTO v_has_access
  FROM agent_features af
  JOIN agent_subscriptions sub ON sub.agent_id = af.agent_id
  WHERE af.agent_id = p_agent_id
    AND sub.status = 'active'
    AND sub.current_period_end > NOW();
    
  RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql;

-- Message de confirmation
SELECT 'Tables d''abonnement créées avec succès!' as status;