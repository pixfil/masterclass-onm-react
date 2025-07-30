-- Script pour ajouter la colonne ubiflow_active
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter la colonne ubiflow_active à la table properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS ubiflow_active BOOLEAN DEFAULT false;

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_properties_ubiflow_active ON properties(ubiflow_active);

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN properties.ubiflow_active IS 'Indique si la propriété est synchronisée avec Ubiflow';