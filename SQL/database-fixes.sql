-- Script pour corriger les politiques RLS et ajouter la colonne deleted_at
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter la colonne deleted_at si elle n'existe pas
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Vérifier les politiques RLS existantes
-- SELECT * FROM pg_policies WHERE tablename = 'properties';

-- 3. Supprimer les anciennes politiques restrictives si elles existent
DROP POLICY IF EXISTS "Users can only view own properties" ON properties;
DROP POLICY IF EXISTS "Users can only create own properties" ON properties;
DROP POLICY IF EXISTS "Users can only update own properties" ON properties;
DROP POLICY IF EXISTS "Users can only delete own properties" ON properties;

-- 4. Créer des politiques plus permissives pour les utilisateurs authentifiés
-- Politique pour la lecture (SELECT)
CREATE POLICY "Authenticated users can view all properties" ON properties
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour la création (INSERT)
CREATE POLICY "Authenticated users can create properties" ON properties
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour la mise à jour (UPDATE)
CREATE POLICY "Authenticated users can update properties" ON properties
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour la suppression (DELETE)
CREATE POLICY "Authenticated users can delete properties" ON properties
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Alternative: Désactiver temporairement RLS pour les tests
-- ATTENTION: Utiliser seulement en développement
-- ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- 6. Pour réactiver RLS plus tard avec des politiques appropriées
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 7. Vérifier que les politiques sont bien appliquées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'properties';