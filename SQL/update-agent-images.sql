-- Script pour mettre à jour les URLs des images des agents
-- Remplacer w=150&h=150 par w=300&h=300 dans les URLs existantes

UPDATE agents_immobiliers 
SET photo_agent = REPLACE(photo_agent, 'w=150&h=150', 'w=300&h=300')
WHERE photo_agent LIKE '%w=150&h=150%';

-- Vérifier le résultat
SELECT prenom, nom, photo_agent 
FROM agents_immobiliers 
WHERE email LIKE '%initiative-immo.fr'
ORDER BY created_at DESC;