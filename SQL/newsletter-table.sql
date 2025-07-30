-- Script pour créer la table newsletter_subscriptions
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer la table newsletter_subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  prenom TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscriptions(created_at);

-- 3. Activer Row Level Security (RLS)
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
-- Politique pour permettre à tous de s'inscrire (INSERT)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre aux utilisateurs authentifiés de lire (SELECT)
CREATE POLICY "Authenticated users can view newsletter subscriptions" ON newsletter_subscriptions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour (UPDATE)
CREATE POLICY "Authenticated users can update newsletter subscriptions" ON newsletter_subscriptions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour permettre la désinscription par email (UPDATE pour unsubscribe)
CREATE POLICY "Users can unsubscribe using email" ON newsletter_subscriptions
    FOR UPDATE USING (true)
    WITH CHECK (true);

-- 5. Ajouter des commentaires pour la documentation
COMMENT ON TABLE newsletter_subscriptions IS 'Table pour gérer les abonnements à la newsletter';
COMMENT ON COLUMN newsletter_subscriptions.email IS 'Adresse email de l''abonné';
COMMENT ON COLUMN newsletter_subscriptions.prenom IS 'Prénom de l''abonné (optionnel)';
COMMENT ON COLUMN newsletter_subscriptions.is_active IS 'Statut d''abonnement actif/inactif';
COMMENT ON COLUMN newsletter_subscriptions.source IS 'Source d''inscription (website, admin, etc.)';
COMMENT ON COLUMN newsletter_subscriptions.unsubscribed_at IS 'Date de désabonnement';