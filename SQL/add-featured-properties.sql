-- Ajouter la colonne is_featured à la table properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Créer un index pour optimiser les requêtes sur les propriétés en vedette
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured) WHERE is_featured = TRUE;

-- Marquer quelques propriétés comme étant en vedette pour les tests (optionnel)
-- UPDATE properties SET is_featured = TRUE WHERE id IN (
--   SELECT id FROM properties 
--   WHERE published = TRUE 
--   ORDER BY created_at DESC 
--   LIMIT 6
-- );