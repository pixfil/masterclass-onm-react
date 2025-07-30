-- Script pour vérifier l'état de la base de données et nettoyer si nécessaire

-- 1. Vérifier si la table existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'ceprof_experts'
) as table_exists;

-- 2. Si elle existe, afficher le nombre d'enregistrements
SELECT 
    'ceprof_experts' as table_name,
    COUNT(*) as total_records
FROM ceprof_experts
WHERE EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ceprof_experts'
);

-- 3. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ceprof_experts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'ceprof_experts';

-- 5. Nettoyer les données de test si nécessaire (décommentez si besoin)
-- DELETE FROM ceprof_experts WHERE email LIKE '%example.com';

-- 6. Réinitialiser la table complètement si nécessaire (décommentez si besoin)
-- DROP TABLE IF EXISTS ceprof_experts CASCADE;