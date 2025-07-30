-- Initialiser le profil de Philippe H. si il n'existe pas
INSERT INTO user_profiles (
  id, 
  first_name, 
  last_name, 
  location,
  bio
)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'philippe@gclicke.com'),
  'Philippe',
  'H.',
  'Strasbourg, France',
  'Directeur chez Initiative Immobilier - Expert en immobilier strasbourgeois depuis plus de 15 ans.'
)
ON CONFLICT (id) 
DO UPDATE SET
  first_name = COALESCE(user_profiles.first_name, EXCLUDED.first_name),
  last_name = COALESCE(user_profiles.last_name, EXCLUDED.last_name),
  location = COALESCE(user_profiles.location, EXCLUDED.location),
  bio = COALESCE(user_profiles.bio, EXCLUDED.bio)
WHERE user_profiles.first_name IS NULL OR user_profiles.first_name = '';