-- Vérifier l'existence des tables analytics
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN 'Table existe ✓'
        ELSE 'Table n''existe pas ✗'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'analytics_events',
    'user_sessions', 
    'conversion_events',
    'sales_performance',
    'agent_performance'
)
ORDER BY table_name;

-- Vérifier les colonnes de analytics_events si elle existe
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'analytics_events'
ORDER BY ordinal_position;