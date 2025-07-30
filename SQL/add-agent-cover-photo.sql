-- Ajouter la colonne photo_couverture à la table agents_immobiliers
ALTER TABLE agents_immobiliers ADD COLUMN IF NOT EXISTS photo_couverture TEXT;

-- Commenter le champ pour la documentation
COMMENT ON COLUMN agents_immobiliers.photo_couverture IS 'URL de la photo de couverture de l''agent pour sa fiche détaillée';

-- Mettre à jour quelques agents avec des photos de couverture
UPDATE agents_immobiliers 
SET photo_couverture = CASE 
    WHEN email = 'sophie.martin@initiative-immo.fr' THEN 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop'
    WHEN email = 'thomas.dubois@initiative-immo.fr' THEN 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop'
    WHEN email = 'marie.lefebvre@initiative-immo.fr' THEN 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop'
    WHEN email = 'antoine.bernard@initiative-immo.fr' THEN 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=400&fit=crop'
    WHEN email = 'camille.moreau@initiative-immo.fr' THEN 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop'
    WHEN email = 'julien.garcia@initiative-immo.fr' THEN 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=400&fit=crop'
    WHEN email = 'emilie.petit@initiative-immo.fr' THEN 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop'
    WHEN email = 'nicolas.roux@initiative-immo.fr' THEN 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800&h=400&fit=crop'
    WHEN email = 'laura.simon@initiative-immo.fr' THEN 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop'
    ELSE NULL
END
WHERE email LIKE '%initiative-immo.fr';