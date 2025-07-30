-- Configuration complète du bucket property-images pour un accès public correct

-- 1. Créer le bucket s'il n'existe pas (ou le mettre à jour)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images', 
  'property-images', 
  true,  -- IMPORTANT: bucket public
  5242880, -- 5MB max par fichier
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Supprimer toutes les anciennes policies pour repartir proprement
DROP POLICY IF EXISTS "Property images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

-- 3. Créer les nouvelles policies pour un accès public complet en lecture
-- Lecture publique (le plus important pour afficher les images)
CREATE POLICY "Property images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'property-images');

-- Upload pour les utilisateurs authentifiés seulement
CREATE POLICY "Authenticated users can upload property images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Update pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can update property images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Delete pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete property images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- 4. Vérifier que le bucket est bien public
SELECT id, name, public FROM storage.buckets WHERE id = 'property-images';

-- 5. Lister les policies actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%property%';