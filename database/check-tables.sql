-- Script pour vérifier quelles tables existent dans la base

-- 1. Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Vérifier spécifiquement les tables nécessaires
SELECT 
    table_name,
    CASE WHEN table_name IN (
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (VALUES 
    ('orders'),
    ('order_items'),
    ('payments'),
    ('user_profiles'),
    ('formations'),
    ('formation_sessions'),
    ('instructors'),
    ('registrations')
) AS required_tables(table_name);

-- 3. Vérifier la structure de la table orders si elle existe
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier le contenu des tables principales
SELECT 'formations' as table_name, COUNT(*) as count FROM formations
UNION ALL
SELECT 'formation_sessions', COUNT(*) FROM formation_sessions
UNION ALL
SELECT 'instructors', COUNT(*) FROM instructors
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles;