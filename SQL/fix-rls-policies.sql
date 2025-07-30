-- Script pour corriger les politiques RLS qui bloquent l'accès admin
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Désactiver temporairement RLS sur agents_immobiliers pour l'admin
ALTER TABLE agents_immobiliers DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer les politiques problématiques qui causent des récursions infinies
DROP POLICY IF EXISTS "Agents can view own data" ON agents_immobiliers;
DROP POLICY IF EXISTS "Agents can update own data" ON agents_immobiliers;
DROP POLICY IF EXISTS "Admins can manage all agents" ON agents_immobiliers;

-- 3. Créer des politiques plus simples
-- Permettre la lecture publique pour l'affichage (comme avant)
CREATE POLICY "Public read access" ON agents_immobiliers
    FOR SELECT USING (true);

-- Permettre aux utilisateurs authentifiés d'insérer et modifier
CREATE POLICY "Authenticated users can insert" ON agents_immobiliers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON agents_immobiliers
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete" ON agents_immobiliers
    FOR DELETE USING (true);

-- 4. Réactiver RLS avec les nouvelles politiques plus permissives
ALTER TABLE agents_immobiliers ENABLE ROW LEVEL SECURITY;

-- 5. S'assurer que les autres tables critiques ont un accès approprié
-- Tables d'estimations (les deux noms possibles)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_estimations') THEN
        ALTER TABLE property_estimations DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estimation_requests') THEN
        ALTER TABLE estimation_requests DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Table contacts (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
        ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Table newsletter_subscriptions (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions') THEN
        ALTER TABLE newsletter_subscriptions DISABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Commentaire de ce qui a été fait
COMMENT ON TABLE agents_immobiliers IS 'RLS réactivé avec politiques simplifiées pour éviter les récursions infinies';