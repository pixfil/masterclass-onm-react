-- Créer le bucket pour les avatars si il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs authentifiés d'uploader leur avatar
CREATE POLICY "Avatar uploads are public." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Politique pour permettre aux utilisateurs de voir tous les avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre avatar
CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre aux utilisateurs de supprimer leur propre avatar
CREATE POLICY "Users can delete their own avatar." ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);