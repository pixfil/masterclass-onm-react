-- Ajout des champs manquants identifiés dans le JSON d'import
-- Surface Séjour, Véranda, Énergie dépenses min/max, DPE Date

-- Ajouter les nouveaux champs à la table properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS surface_sejour DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS veranda BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS energie_depenses_min INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS energie_depenses_max INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS dpe_date DATE;

-- Commentaires pour clarifier les champs
COMMENT ON COLUMN properties.surface_sejour IS 'Surface du séjour en m²';
COMMENT ON COLUMN properties.veranda IS 'Présence d''une véranda';
COMMENT ON COLUMN properties.energie_depenses_min IS 'Dépenses énergétiques minimales en € par an';
COMMENT ON COLUMN properties.energie_depenses_max IS 'Dépenses énergétiques maximales en € par an';
COMMENT ON COLUMN properties.dpe_date IS 'Date du diagnostic de performance énergétique';