-- ==============================================
-- SYSTÈME ANALYTICS SIMPLIFIÉ POUR INITIATIVE IMMOBILIER
-- ==============================================

-- 1. Table des événements analytics (version simplifiée)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID,
  property_id UUID,
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

-- ==============================================
-- INDEX POUR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_property_id ON analytics_events(property_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_conversion_type ON conversion_events(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_status ON conversion_events(status);

CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

-- ==============================================
-- COMMENTAIRES
-- ==============================================

COMMENT ON TABLE analytics_events IS 'Événements de tracking pour analytics en temps réel';
COMMENT ON TABLE user_sessions IS 'Sessions utilisateur avec informations de navigation';
COMMENT ON TABLE conversion_events IS 'Événements de conversion et leads générés';

-- Fin du script
SELECT 'Analytics tables created successfully!' as status;