-- Script pour ajouter des notifications de test
-- À exécuter dans Supabase

-- Supprimer les notifications de test existantes (optionnel)
DELETE FROM action_notifications WHERE title LIKE '%Test%' OR title LIKE '%🏠%' OR title LIKE '%📞%';

-- Insérer des notifications de test variées
INSERT INTO action_notifications (type, title, description, color, user_name, entity_type, entity_name, is_read, created_at) VALUES

-- Notifications récentes (non lues)
('property_published', '🏠 Nouvelle propriété publiée !', 'Un magnifique appartement 3 pièces à Strasbourg vient d''être mis en ligne', 'green', 'Marie Martin', 'property', 'Appartement 3P - Strasbourg Centre', false, NOW() - INTERVAL '30 minutes'),

('contact_received', '📞 Nouvelle demande de contact', 'Un client s''intéresse à votre bien à Mulhouse', 'blue', 'Jean Dupont', 'property', 'Maison 5P - Mulhouse', false, NOW() - INTERVAL '1 hour'),

('estimation_received', '📊 Demande d''estimation reçue', 'Un propriétaire souhaite faire estimer son bien à Colmar', 'purple', 'Sophie Bernard', 'estimation', 'Estimation - Colmar', false, NOW() - INTERVAL '2 hours'),

('property_sold', '🎉 Propriété vendue !', 'Félicitations ! La villa à Haguenau a trouvé son acquéreur', 'yellow', 'Marie Martin', 'property', 'Villa 6P - Haguenau', false, NOW() - INTERVAL '4 hours'),

-- Notifications d'hier (mélange lu/non lu)
('agent_created', '👤 Nouvel agent rejoint l''équipe !', 'Pierre Durand a rejoint l''agence Initiative Immobilier', 'green', null, 'agent', 'Pierre Durand', true, NOW() - INTERVAL '1 day'),

('user_registered', '🆕 Nouvel utilisateur inscrit', 'Un nouveau client s''est inscrit sur la plateforme', 'blue', null, 'user', 'Client Premium', false, NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),

('contact_received', '📞 Demande de contact', 'Intérêt pour l''appartement à Schiltigheim', 'blue', 'Alice Rousseau', 'property', 'Appartement 2P - Schiltigheim', true, NOW() - INTERVAL '1 day' - INTERVAL '5 hours'),

-- Notifications plus anciennes (majoritairement lues)
('property_rented', '🏡 Propriété louée !', 'Le studio à Illkirch a trouvé son locataire', 'green', 'Thomas Weber', 'property', 'Studio - Illkirch', true, NOW() - INTERVAL '3 days'),

('estimation_received', '📊 Estimation demandée', 'Demande d''estimation pour une maison à Hoenheim', 'purple', 'Lucie Schmitt', 'estimation', 'Maison 4P - Hoenheim', true, NOW() - INTERVAL '4 days'),

('property_published', '🏠 Nouveau bien en ligne', 'Appartement T2 avec terrasse à Ostwald', 'green', 'Marie Martin', 'property', 'T2 avec terrasse - Ostwald', true, NOW() - INTERVAL '5 days'),

('contact_received', '📞 Contact client', 'Question sur les modalités de visite', 'blue', 'Marc Lefebvre', 'property', 'Maison 3P - Bischheim', true, NOW() - INTERVAL '6 days'),

('user_registered', '🆕 Inscription client', 'Nouveau compte client créé', 'blue', null, 'user', 'Utilisateur standard', true, NOW() - INTERVAL '1 week'),

-- Notifications très récentes (quelques minutes)
('contact_received', '📞 Contact urgent', 'Client très intéressé par la villa à Saverne', 'red', 'Emma Dubois', 'property', 'Villa 7P - Saverne', false, NOW() - INTERVAL '5 minutes'),

('estimation_received', '📊 Estimation express', 'Demande d''estimation rapide pour vente urgente', 'purple', 'Nicolas Klein', 'estimation', 'Maison urgente - Molsheim', false, NOW() - INTERVAL '15 minutes');

-- Statistiques pour vérification
SELECT 
  'Total notifications' as type,
  COUNT(*) as count
FROM action_notifications
UNION ALL
SELECT 
  'Non lues' as type,
  COUNT(*) as count
FROM action_notifications 
WHERE is_read = false
UNION ALL
SELECT 
  'Récentes (24h)' as type,
  COUNT(*) as count
FROM action_notifications 
WHERE created_at > NOW() - INTERVAL '24 hours';