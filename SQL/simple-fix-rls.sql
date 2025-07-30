-- Script simple pour désactiver RLS sur toutes les tables admin
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Désactiver RLS sur agents_immobiliers
ALTER TABLE agents_immobiliers DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes pour repartir à zéro
DROP POLICY IF EXISTS "Agents can view own data" ON agents_immobiliers;
DROP POLICY IF EXISTS "Agents can update own data" ON agents_immobiliers;
DROP POLICY IF EXISTS "Admins can manage all agents" ON agents_immobiliers;
DROP POLICY IF EXISTS "Public read access" ON agents_immobiliers;
DROP POLICY IF EXISTS "Authenticated users can insert" ON agents_immobiliers;
DROP POLICY IF EXISTS "Authenticated users can update" ON agents_immobiliers;
DROP POLICY IF EXISTS "Authenticated users can delete" ON agents_immobiliers;

-- 3. Désactiver RLS sur les autres tables admin si elles existent
DO $$
BEGIN
    -- Property estimations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_estimations') THEN
        ALTER TABLE property_estimations DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Estimation requests  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estimation_requests') THEN
        ALTER TABLE estimation_requests DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Contacts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
        ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Newsletter
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions') THEN
        ALTER TABLE newsletter_subscriptions DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Properties (pour s'assurer que l'admin peut les voir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
    END IF;
    
END
$$;

-- 4. Message de confirmation
SELECT 'RLS désactivé pour toutes les tables admin' as status;