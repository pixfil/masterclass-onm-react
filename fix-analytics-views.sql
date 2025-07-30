-- ==============================================
-- SUPPRESSION DES VUES EXISTANTES
-- ==============================================

DROP VIEW IF EXISTS analytics_dashboard CASCADE;
DROP VIEW IF EXISTS popular_properties CASCADE;
DROP VIEW IF EXISTS agent_analytics CASCADE;
DROP VIEW IF EXISTS location_analytics CASCADE;

-- ==============================================
-- RECRÉATION DES VUES CORRIGÉES
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

-- Message de confirmation
SELECT 'Vues analytics corrigées avec succès!' as status;