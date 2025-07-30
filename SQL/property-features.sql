-- Script pour ajouter les nouvelles fonctionnalités aux propriétés
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter les nouvelles colonnes
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS hide_address BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS property_label TEXT DEFAULT NULL;

-- 2. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_properties_hide_address ON properties(hide_address);
CREATE INDEX IF NOT EXISTS idx_properties_label ON properties(property_label);

-- 3. Ajouter des commentaires pour la documentation
COMMENT ON COLUMN properties.hide_address IS 'Masque l''adresse précise et affiche un rayon de 1km';
COMMENT ON COLUMN properties.property_label IS 'Label de la propriété (RÉSERVÉ, NOUVEAUTÉ, etc.)';

-- 4. Ajouter une contrainte pour les labels valides
ALTER TABLE properties 
ADD CONSTRAINT check_property_label 
CHECK (property_label IS NULL OR property_label IN (
    'RÉSERVÉ',
    'DÉJÀ LOUÉ !',
    'DERNIERS LOTS !',
    'NOUVEAUTÉ',
    'SOUS COMPROMIS',
    'SOUS OFFRE !',
    'VENDU'
));