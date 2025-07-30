-- Mise à jour du schéma pour les champs immobiliers français complets
-- À exécuter dans Supabase SQL Editor

-- Ajout des nouveaux champs à la table properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS prix_hors_honoraires INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS honoraires INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS honoraires_charge VARCHAR(20) DEFAULT 'acquéreur';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS reference_mandat VARCHAR(50);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS reference_interne VARCHAR(50);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS disponibilite VARCHAR(100) DEFAULT 'De suite';

-- Surfaces et configuration
ALTER TABLE properties ADD COLUMN IF NOT EXISTS surface_habitable DECIMAL(8,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS surface_totale DECIMAL(8,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nombre_wc INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nombre_sde INTEGER DEFAULT 0;

-- Localisation détaillée
ALTER TABLE properties ADD COLUMN IF NOT EXISTS adresse_complete TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS etage INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nombre_etages_total INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ascenseur BOOLEAN DEFAULT false;

-- Chauffage et énergie
ALTER TABLE properties ADD COLUMN IF NOT EXISTS chauffage_type VARCHAR(50); -- individuel/collectif
ALTER TABLE properties ADD COLUMN IF NOT EXISTS chauffage_energie VARCHAR(50); -- gaz/électrique/fioul/etc.
ALTER TABLE properties ADD COLUMN IF NOT EXISTS chauffage_systeme VARCHAR(100); -- radiateurs/plancher chauffant/etc.
ALTER TABLE properties ADD COLUMN IF NOT EXISTS eau_chaude_type VARCHAR(50);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS eau_chaude_energie VARCHAR(50);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS dpe_valeur INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ges_valeur INTEGER;

-- Charges et copropriété
ALTER TABLE properties ADD COLUMN IF NOT EXISTS charges_copropriete DECIMAL(8,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nombre_lots INTEGER;

-- Équipements spécifiques
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cave BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cellier BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS grenier BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS garage BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS climatisation BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cuisine_equipee BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cuisine_americaine BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS interphone BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS gardien BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS piscine BOOLEAN DEFAULT false;

-- Mettre à jour les équipements français dans types_equipements
DELETE FROM types_equipements;

INSERT INTO types_equipements (nom, icone_nom, categorie, description) VALUES
-- Confort
('Climatisation', 'AcUnit', 'confort', 'Système de climatisation'),
('Cuisine équipée', 'Kitchen', 'confort', 'Cuisine entièrement équipée'),
('Cuisine américaine', 'Kitchen', 'confort', 'Cuisine ouverte sur le salon'),
('Meublé', 'Chair', 'confort', 'Logement entièrement meublé'),

-- Extérieur  
('Balcon', 'Balcony', 'exterieur', 'Balcon privé'),
('Terrasse', 'Deck', 'exterieur', 'Terrasse privée'),
('Jardin', 'Grass', 'exterieur', 'Jardin privatif'),
('Piscine', 'Pool', 'exterieur', 'Piscine privée ou commune'),

-- Rangement
('Cave', 'Warehouse', 'rangement', 'Cave de stockage'),
('Cellier', 'Warehouse', 'rangement', 'Cellier pour stockage'),
('Grenier', 'Attic', 'rangement', 'Grenier aménageable'),
('Garage', 'Garage', 'rangement', 'Garage fermé'),
('Parking', 'LocalParking', 'rangement', 'Place de parking'),

-- Sécurité et accès
('Interphone', 'ContactPhone', 'securite', 'Système d''interphone'),
('Gardien', 'Security', 'securite', 'Gardien d''immeuble'),
('Ascenseur', 'Elevator', 'securite', 'Ascenseur dans l''immeuble'),

-- Chauffage
('Chauffage individuel gaz', 'LocalFireDepartment', 'chauffage', 'Chauffage individuel au gaz'),
('Chauffage collectif gaz', 'LocalFireDepartment', 'chauffage', 'Chauffage collectif au gaz'),
('Chauffage électrique', 'ElectricBolt', 'chauffage', 'Chauffage électrique'),
('Plancher chauffant', 'Thermostat', 'chauffage', 'Plancher chauffant'),
('Radiateurs', 'Thermostat', 'chauffage', 'Radiateurs'),

-- Services
('Fibre optique', 'Wifi', 'services', 'Connexion fibre optique'),
('Internet haut débit', 'Wifi', 'services', 'Connexion internet rapide')

ON CONFLICT (nom) DO UPDATE SET 
    icone_nom = EXCLUDED.icone_nom,
    categorie = EXCLUDED.categorie,
    description = EXCLUDED.description;

-- Vues pour les statistiques enrichies
CREATE OR REPLACE VIEW property_statistics_detailed AS
SELECT 
    COUNT(*) as total_properties,
    COUNT(*) FILTER (WHERE transaction_type = 'vente') as for_sale,
    COUNT(*) FILTER (WHERE transaction_type = 'location') as for_rent,
    COUNT(*) FILTER (WHERE status = 'disponible') as available,
    COUNT(*) FILTER (WHERE status = 'sous_offre') as under_offer,
    COUNT(*) FILTER (WHERE status = 'vendu') as sold,
    AVG(price) FILTER (WHERE transaction_type = 'vente') as avg_sale_price,
    AVG(price) FILTER (WHERE transaction_type = 'location') as avg_rent_price,
    AVG(surface_habitable) as avg_surface,
    COUNT(*) FILTER (WHERE ascenseur = true) as with_elevator,
    COUNT(*) FILTER (WHERE garage = true) as with_garage,
    COUNT(*) FILTER (WHERE balcony = true OR terrace = true) as with_outdoor_space
FROM properties 
WHERE published = true;

-- Commentaires pour la documentation
COMMENT ON COLUMN properties.prix_hors_honoraires IS 'Prix du bien hors honoraires d''agence';
COMMENT ON COLUMN properties.honoraires IS 'Montant des honoraires d''agence';
COMMENT ON COLUMN properties.honoraires_charge IS 'À charge de qui : acquéreur, vendeur, partagé';
COMMENT ON COLUMN properties.reference_mandat IS 'Référence du mandat (ex: 258-24 U)';
COMMENT ON COLUMN properties.reference_interne IS 'Référence interne agence (ex: VA-3013K)';
COMMENT ON COLUMN properties.surface_habitable IS 'Surface habitable en m² (loi Carrez)';
COMMENT ON COLUMN properties.surface_totale IS 'Surface totale incluant annexes en m²';
COMMENT ON COLUMN properties.chauffage_type IS 'Type : individuel, collectif';
COMMENT ON COLUMN properties.chauffage_energie IS 'Énergie : gaz, électrique, fioul, bois, etc.';
COMMENT ON COLUMN properties.chauffage_systeme IS 'Système : radiateurs, plancher chauffant, etc.';
COMMENT ON COLUMN properties.dpe_valeur IS 'Valeur DPE en kWh/m²/an';
COMMENT ON COLUMN properties.ges_valeur IS 'Valeur GES en kg CO2/m²/an';