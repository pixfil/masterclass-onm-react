-- ==============================================
-- SYSTÈME ANALYTICS COMPLET POUR INITIATIVE IMMOBILIER
-- ==============================================

-- 1. Table des événements analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'property_view', 'contact_form', 'estimation_request', 'phone_click', 'email_click'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents_immobiliers(id) ON DELETE SET NULL,
  session_id VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  page_url TEXT,
  search_query TEXT,
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),
  country VARCHAR(2),
  city VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des performances de vente
CREATE TABLE IF NOT EXISTS sales_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) NOT NULL,
  agent_id UUID REFERENCES agents_immobiliers(id) ON DELETE SET NULL,
  sale_type VARCHAR(20) NOT NULL, -- 'sale', 'rent'
  listing_date DATE NOT NULL,
  sale_date DATE NOT NULL,
  listing_price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2), -- Pourcentage de commission
  commission_amount DECIMAL(10,2),
  days_on_market INTEGER GENERATED ALWAYS AS (sale_date - listing_date) STORED,
  lead_source VARCHAR(50) DEFAULT 'website', -- 'website', 'direct', 'referral', 'social'
  client_type VARCHAR(20), -- 'buyer', 'seller', 'tenant', 'landlord'
  negotiation_rounds INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des sessions utilisateur
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
  session_duration INTEGER, -- En secondes
  page_views INTEGER DEFAULT 0,
  properties_viewed INTEGER DEFAULT 0,
  forms_submitted INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des conversions (leads)
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) REFERENCES user_sessions(session_id),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents_immobiliers(id) ON DELETE SET NULL,
  conversion_type VARCHAR(50) NOT NULL, -- 'contact_form', 'estimation_request', 'phone_call', 'email_sent', 'visit_scheduled'
  form_type VARCHAR(50), -- 'property_inquiry', 'general_contact', 'valuation_request'
  contact_info JSONB, -- {"name": "", "email": "", "phone": "", "message": ""}
  source_page TEXT,
  conversion_value DECIMAL(10,2), -- Valeur estimée de la conversion
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des métriques de performance par agent
CREATE TABLE IF NOT EXISTS agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents_immobiliers(id) NOT NULL,
  date DATE NOT NULL,
  properties_listed INTEGER DEFAULT 0,
  properties_sold INTEGER DEFAULT 0,
  properties_rented INTEGER DEFAULT 0,
  total_sales_value DECIMAL(15,2) DEFAULT 0,
  total_rental_value DECIMAL(15,2) DEFAULT 0,
  commission_earned DECIMAL(12,2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  avg_response_time INTEGER, -- En minutes
  client_satisfaction_score DECIMAL(3,2), -- Sur 5.00
  properties_viewed INTEGER DEFAULT 0,
  contact_requests INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, date)
);

-- ==============================================
-- VUES POUR LES ANALYTICS
-- ==============================================

-- Vue dashboard général
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
  COUNT(*) FILTER (WHERE event_type = 'property_view') as property_views,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as logged_users,
  COUNT(*) FILTER (WHERE event_type = 'contact_form') as contact_requests,
  COUNT(*) FILTER (WHERE event_type = 'estimation_request') as estimation_requests,
  COUNT(*) FILTER (WHERE event_type = 'phone_click') as phone_clicks,
  COUNT(*) FILTER (WHERE event_type = 'email_click') as email_clicks,
  COUNT(DISTINCT property_id) FILTER (WHERE event_type = 'property_view' AND property_id IS NOT NULL) as unique_properties_viewed
FROM analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Vue des propriétés les plus populaires
CREATE OR REPLACE VIEW popular_properties AS
SELECT 
  p.id,
  p.title,
  p.city,
  p.property_type,
  p.price,
  COUNT(ae.id) as total_views,
  COUNT(DISTINCT ae.session_id) as unique_views,
  COUNT(ce.id) as conversions,
  ROUND(COUNT(ce.id)::DECIMAL / NULLIF(COUNT(DISTINCT ae.session_id), 0) * 100, 2) as conversion_rate,
  MAX(ae.created_at) as last_viewed
FROM properties p
LEFT JOIN analytics_events ae ON p.id = ae.property_id AND ae.event_type = 'property_view'
LEFT JOIN conversion_events ce ON p.id = ce.property_id
WHERE p.published = true
GROUP BY p.id, p.title, p.city, p.property_type, p.price
ORDER BY total_views DESC, unique_views DESC;

-- Vue performance des agents
CREATE OR REPLACE VIEW agent_analytics AS
SELECT 
  a.id,
  a.prenom,
  a.nom,
  COUNT(DISTINCT p.id) FILTER (WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days') as properties_listed_30d,
  COUNT(sp.id) FILTER (WHERE sp.sale_date >= CURRENT_DATE - INTERVAL '30 days') as sales_30d,
  COALESCE(SUM(sp.sale_price) FILTER (WHERE sp.sale_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as sales_value_30d,
  COALESCE(SUM(sp.commission_amount) FILTER (WHERE sp.sale_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as commission_30d,
  COUNT(ce.id) FILTER (WHERE ce.created_at >= CURRENT_DATE - INTERVAL '30 days') as leads_30d,
  ROUND(AVG(sp.days_on_market) FILTER (WHERE sp.sale_date >= CURRENT_DATE - INTERVAL '90 days'), 1) as avg_days_on_market,
  a.note_moyenne as avg_rating,
  a.nombre_avis_agent as review_count
FROM agents_immobiliers a
LEFT JOIN properties p ON a.id = p.agent_id
LEFT JOIN sales_performance sp ON a.id = sp.agent_id
LEFT JOIN conversion_events ce ON a.id = ce.agent_id
GROUP BY a.id, a.prenom, a.nom, a.note_moyenne, a.nombre_avis_agent
ORDER BY sales_value_30d DESC, sales_30d DESC;

-- Vue métriques par quartier
CREATE OR REPLACE VIEW location_analytics AS
SELECT 
  p.city,
  COUNT(DISTINCT p.id) as total_properties,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'disponible') as available_properties,
  COUNT(sp.id) FILTER (WHERE sp.sale_date >= CURRENT_DATE - INTERVAL '30 days') as sales_30d,
  ROUND(AVG(p.price), 0) as avg_price,
  ROUND(AVG(sp.sale_price) FILTER (WHERE sp.sale_date >= CURRENT_DATE - INTERVAL '90 days'), 0) as avg_sale_price_90d,
  ROUND(AVG(sp.days_on_market) FILTER (WHERE sp.sale_date >= CURRENT_DATE - INTERVAL '90 days'), 1) as avg_days_on_market,
  COUNT(ae.id) FILTER (WHERE ae.event_type = 'property_view' AND ae.created_at >= CURRENT_DATE - INTERVAL '30 days') as views_30d,
  COUNT(ce.id) FILTER (WHERE ce.created_at >= CURRENT_DATE - INTERVAL '30 days') as leads_30d
FROM properties p
LEFT JOIN sales_performance sp ON p.id = sp.property_id
LEFT JOIN analytics_events ae ON p.id = ae.property_id
LEFT JOIN conversion_events ce ON p.id = ce.property_id
WHERE p.city IS NOT NULL
GROUP BY p.city
ORDER BY total_properties DESC, views_30d DESC;

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
-- FONCTIONS UTILITAIRES
-- ==============================================

-- Fonction pour calculer le taux de conversion
CREATE OR REPLACE FUNCTION calculate_conversion_rate(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  metric_name TEXT,
  views BIGINT,
  conversions BIGINT,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Overall' as metric_name,
    COUNT(DISTINCT ae.session_id) as views,
    COUNT(DISTINCT ce.session_id) as conversions,
    ROUND(
      COUNT(DISTINCT ce.session_id)::DECIMAL / 
      NULLIF(COUNT(DISTINCT ae.session_id), 0) * 100, 
      2
    ) as conversion_rate
  FROM analytics_events ae
  LEFT JOIN conversion_events ce ON ae.session_id = ce.session_id 
    AND ce.created_at BETWEEN start_date AND end_date
  WHERE ae.created_at BETWEEN start_date AND end_date
    AND ae.event_type = 'property_view';
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS POUR AUTOMATION
-- ==============================================

-- Trigger pour mettre à jour les statistiques d'agent automatiquement
CREATE OR REPLACE FUNCTION update_agent_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Mise à jour des métriques de performance quotidiennes
  INSERT INTO agent_performance (agent_id, date, properties_listed, created_at)
  VALUES (NEW.agent_id, CURRENT_DATE, 1, NOW())
  ON CONFLICT (agent_id, date) 
  DO UPDATE SET 
    properties_listed = agent_performance.properties_listed + 1,
    created_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur l'insertion de nouvelles propriétés
DROP TRIGGER IF EXISTS trigger_update_agent_performance ON properties;
CREATE TRIGGER trigger_update_agent_performance
  AFTER INSERT ON properties
  FOR EACH ROW
  WHEN (NEW.agent_id IS NOT NULL)
  EXECUTE FUNCTION update_agent_performance();

COMMENT ON TABLE analytics_events IS 'Événements de tracking pour analytics en temps réel';
COMMENT ON TABLE sales_performance IS 'Performance des ventes et locations avec métriques business';
COMMENT ON TABLE user_sessions IS 'Sessions utilisateur avec informations de navigation';
COMMENT ON TABLE conversion_events IS 'Événements de conversion et leads générés';
COMMENT ON TABLE agent_performance IS 'Métriques de performance quotidiennes par agent';

-- Fin du script
SELECT 'Analytics tables created successfully!' as status;