-- Correction des permissions RLS pour property_images

-- 1. Supprimer les anciennes policies
DROP POLICY IF EXISTS "property_images_select_policy" ON property_images;
DROP POLICY IF EXISTS "property_images_insert_policy" ON property_images;
DROP POLICY IF EXISTS "property_images_update_policy" ON property_images;
DROP POLICY IF EXISTS "property_images_delete_policy" ON property_images;

-- 2. Créer les nouvelles policies plus permissives
-- Lecture publique (pour affichage des images)
CREATE POLICY "property_images_select_policy" 
ON property_images FOR SELECT 
USING (true);

-- Insertion pour les utilisateurs authentifiés
CREATE POLICY "property_images_insert_policy" 
ON property_images FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Mise à jour pour les utilisateurs authentifiés
CREATE POLICY "property_images_update_policy" 
ON property_images FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Suppression pour les utilisateurs authentifiés
CREATE POLICY "property_images_delete_policy" 
ON property_images FOR DELETE 
USING (auth.role() = 'authenticated');

-- 3. Vérifier que RLS est activé
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- 4. Vérifier les policies créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'property_images';