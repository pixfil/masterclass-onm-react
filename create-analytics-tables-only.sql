-- ==============================================
-- CRÉATION DES TABLES ANALYTICS UNIQUEMENT
-- ==============================================

-- 1. Table des événements analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID,
  property_id UUID,
  agent_id UUID,
  session_id VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  page_url TEXT,
  search_query TEXT,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  country VARCHAR(2),
  city VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des sessions utilisateur
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(2),
  city VARCHAR(100),
  referer TEXT,
  landing_page TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  session_duration INTEGER,
  page_views INTEGER DEFAULT 0,
  properties_viewed INTEGER DEFAULT 0,
  forms_submitted INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des conversions (leads)
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100),
  user_id UUID,
  property_id UUID,
  agent_id UUID,
  conversion_type VARCHAR(50) NOT NULL,
  form_type VARCHAR(50),
  contact_info JSONB,
  source_page TEXT,
  conversion_value DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'new',
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des performances de vente
CREATE TABLE IF NOT EXISTS sales_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID,
  agent_id UUID,
  sale_type VARCHAR(20) NOT NULL,
  listing_date DATE NOT NULL,
  sale_date DATE NOT NULL,
  listing_price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(10,2),
  days_on_market INTEGER,
  lead_source VARCHAR(50) DEFAULT 'website',
  client_type VARCHAR(20),
  negotiation_rounds INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des métriques de performance par agent
CREATE TABLE IF NOT EXISTS agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  date DATE NOT NULL,
  properties_listed INTEGER DEFAULT 0,
  properties_sold INTEGER DEFAULT 0,
  properties_rented INTEGER DEFAULT 0,
  total_sales_value DECIMAL(15,2) DEFAULT 0,
  total_rental_value DECIMAL(15,2) DEFAULT 0,
  commission_earned DECIMAL(12,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  avg_response_time INTEGER,
  client_satisfaction_score DECIMAL(3,2),
  properties_viewed INTEGER DEFAULT 0,
  contact_requests INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, date)
);

-- ==============================================
-- INDEX POUR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_property_id ON analytics_events(property_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

CREATE INDEX IF NOT EXISTS idx_sales_performance_sale_date ON sales_performance(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_performance_agent_id ON sales_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_sales_performance_property_id ON sales_performance(property_id);

CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_conversion_type ON conversion_events(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_status ON conversion_events(status);

CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

-- ==============================================
-- COMMENTAIRES
-- ==============================================

COMMENT ON TABLE analytics_events IS 'Événements de tracking pour analytics en temps réel';
COMMENT ON TABLE sales_performance IS 'Performance des ventes et locations avec métriques business';
COMMENT ON TABLE user_sessions IS 'Sessions utilisateur avec informations de navigation';
COMMENT ON TABLE conversion_events IS 'Événements de conversion et leads générés';
COMMENT ON TABLE agent_performance IS 'Métriques de performance quotidiennes par agent';

-- Message de confirmation
SELECT 'Tables analytics créées avec succès!' as status;