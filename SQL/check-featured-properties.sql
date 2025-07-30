-- Vérifier les propriétés en vedette
SELECT id, title, is_featured, published, status, deleted_at 
FROM properties 
WHERE is_featured = true;

-- Vérifier s'il y a des propriétés publiées
SELECT id, title, is_featured, published, status 
FROM properties 
WHERE published = true AND deleted_at IS NULL
LIMIT 10;

-- Compter les propriétés par statut
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured,
    COUNT(CASE WHEN published = true THEN 1 END) as published,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as not_deleted
FROM properties;