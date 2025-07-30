-- Créer la table pour stocker les labels de propriétés
CREATE TABLE IF NOT EXISTS property_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte d'unicité pour éviter les doublons
  CONSTRAINT unique_property_label UNIQUE(property_id, label)
);

-- Index pour améliorer les performances
CREATE INDEX idx_property_labels_property_id ON property_labels(property_id);
CREATE INDEX idx_property_labels_label ON property_labels(label);

-- Activer RLS
ALTER TABLE property_labels ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
CREATE POLICY "Les labels sont visibles publiquement" 
  ON property_labels FOR SELECT 
  USING (true);

-- Politique pour permettre aux utilisateurs authentifiés de gérer les labels
CREATE POLICY "Les utilisateurs authentifiés peuvent gérer les labels" 
  ON property_labels FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Migration des données existantes si nécessaire
-- Cette requête copiera les labels existants de la colonne property_label vers la nouvelle table
INSERT INTO property_labels (property_id, label)
SELECT id, property_label
FROM properties
WHERE property_label IS NOT NULL AND property_label != ''
ON CONFLICT (property_id, label) DO NOTHING;

-- Optionnel : supprimer l'ancienne colonne après migration
-- ALTER TABLE properties DROP COLUMN property_label;