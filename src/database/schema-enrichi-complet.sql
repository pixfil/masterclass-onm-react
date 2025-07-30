-- Schéma enrichi complet pour Initiative Immobilier
-- À exécuter dans Supabase SQL Editor

-- 1. Enrichissement de la table properties existante
ALTER TABLE properties ADD COLUMN IF NOT EXISTS note_moyenne DECIMAL(2,1) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nombre_avis INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS nombre_invites_max INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS surface_pieds_carres INTEGER;

-- 2. Table des points forts de propriété
CREATE TABLE IF NOT EXISTS points_forts_propriete (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  ordre_affichage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des équipements détaillés
CREATE TABLE IF NOT EXISTS equipements_propriete (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  nom_equipement VARCHAR(100) NOT NULL,
  icone_nom VARCHAR(50),
  quantite INTEGER DEFAULT 1,
  est_disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des avis sur les propriétés
CREATE TABLE IF NOT EXISTS avis_proprietes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  nom_client VARCHAR(255),
  email_client VARCHAR(255),
  note INTEGER CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  date_sejour DATE,
  est_verifie BOOLEAN DEFAULT false,
  est_publie BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table enrichie pour les informations d'agence
CREATE TABLE IF NOT EXISTS agences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_agence VARCHAR(255) NOT NULL,
  description_agence TEXT,
  photo_agence TEXT,
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse_agence TEXT,
  ville_agence VARCHAR(100),
  code_postal_agence VARCHAR(10),
  est_super_hote BOOLEAN DEFAULT false,
  est_verifie BOOLEAN DEFAULT false,
  note_moyenne DECIMAL(2,1) DEFAULT 0,
  nombre_avis_total INTEGER DEFAULT 0,
  nombre_proprietes_total INTEGER DEFAULT 0,
  taux_reponse INTEGER DEFAULT 0,
  temps_reponse_moyen VARCHAR(50),
  date_creation_compte DATE,
  annees_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table des agents immobiliers
CREATE TABLE IF NOT EXISTS agents_immobiliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telephone VARCHAR(20),
  photo_agent TEXT,
  description_agent TEXT,
  specialites TEXT[], -- Array des spécialités (vente, location, commercial, etc.)
  est_super_agent BOOLEAN DEFAULT false,
  est_verifie BOOLEAN DEFAULT true,
  note_moyenne DECIMAL(2,1) DEFAULT 0,
  nombre_avis_agent INTEGER DEFAULT 0,
  nombre_proprietes_gerees INTEGER DEFAULT 0,
  taux_reponse INTEGER DEFAULT 98,
  temps_reponse_moyen VARCHAR(50) DEFAULT 'dans l''heure',
  date_embauche DATE,
  annees_experience INTEGER DEFAULT 0,
  agence_id UUID REFERENCES agences(id),
  est_actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Ajout des références dans properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS agence_id UUID REFERENCES agences(id);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents_immobiliers(id);

-- 7. Table pour les types d'équipements prédéfinis
CREATE TABLE IF NOT EXISTS types_equipements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) UNIQUE NOT NULL,
  icone_nom VARCHAR(50),
  categorie VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Fonction pour mettre à jour automatiquement les moyennes
CREATE OR REPLACE FUNCTION update_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE properties 
    SET 
        note_moyenne = (
            SELECT COALESCE(AVG(note), 0) 
            FROM avis_proprietes 
            WHERE property_id = COALESCE(NEW.property_id, OLD.property_id) AND est_publie = true
        ),
        nombre_avis = (
            SELECT COUNT(*) 
            FROM avis_proprietes 
            WHERE property_id = COALESCE(NEW.property_id, OLD.property_id) AND est_publie = true
        )
    WHERE id = COALESCE(NEW.property_id, OLD.property_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger pour mettre à jour les ratings automatiquement
DROP TRIGGER IF EXISTS trigger_update_property_ratings ON avis_proprietes;
CREATE TRIGGER trigger_update_property_ratings
    AFTER INSERT OR UPDATE OR DELETE ON avis_proprietes
    FOR EACH ROW EXECUTE FUNCTION update_property_ratings();

-- 10. Insertion des données d'agence par défaut
INSERT INTO agences (
    nom_agence,
    description_agence,
    email,
    telephone,
    ville_agence,
    est_super_hote,
    est_verifie,
    note_moyenne,
    nombre_avis_total,
    nombre_proprietes_total,
    taux_reponse,
    temps_reponse_moyen,
    date_creation_compte,
    annees_experience
) VALUES (
    'Initiative Immobilier',
    'Agence immobilière spécialisée dans l''immobilier strasbourgeois depuis plus de 15 ans.',
    'contact@initiative-immobilier.fr',
    '+33 3 88 00 00 00',
    'Strasbourg',
    true,
    true,
    4.9,
    250,
    50,
    98,
    'dans l''heure',
    '2010-01-01',
    15
) ON CONFLICT DO NOTHING;

-- 10b. Insertion de l'agent par défaut Julien LINDENAU
INSERT INTO agents_immobiliers (
    prenom,
    nom,
    email,
    telephone,
    description_agent,
    specialites,
    est_super_agent,
    est_verifie,
    note_moyenne,
    nombre_avis_agent,
    taux_reponse,
    temps_reponse_moyen,
    date_embauche,
    annees_experience,
    agence_id
) VALUES (
    'Julien',
    'LINDENAU',
    'julien.lindenau@initiative-immobilier.fr',
    '+33 3 88 11 22 33',
    'Agent immobilier expérimenté, spécialisé dans l''immobilier résidentiel et commercial à Strasbourg. Passionné par l''accompagnement de mes clients dans leurs projets immobiliers.',
    ARRAY['vente', 'location', 'estimation', 'conseil'],
    true,
    true,
    4.8,
    120,
    95,
    'dans l''heure',
    '2015-03-01',
    9,
    (SELECT id FROM agences WHERE nom_agence = 'Initiative Immobilier' LIMIT 1)
) ON CONFLICT (email) DO NOTHING;

-- 10c. Attribution de toutes les propriétés existantes à Julien LINDENAU
UPDATE properties 
SET 
    agence_id = (SELECT id FROM agences WHERE nom_agence = 'Initiative Immobilier' LIMIT 1),
    agent_id = (SELECT id FROM agents_immobiliers WHERE email = 'julien.lindenau@initiative-immobilier.fr' LIMIT 1)
WHERE agent_id IS NULL;

-- 11. Insertion des équipements types prédéfinis
INSERT INTO types_equipements (nom, icone_nom, categorie, description) VALUES
('Fast wifi', 'Wifi01Icon', 'connectivity', 'Connexion internet haut débit'),
('Bathtub', 'Bathtub02Icon', 'bathroom', 'Baignoire dans la salle de bain'),
('Hair dryer', 'HairDryerIcon', 'bathroom', 'Sèche-cheveux fourni'),
('Sound system', 'Speaker01Icon', 'entertainment', 'Système audio'),
('Shampoo', 'ShampooIcon', 'amenities', 'Shampoing fourni'),
('Body soap', 'BodySoapIcon', 'amenities', 'Savon corporel fourni'),
('Water Energy', 'WaterEnergyIcon', 'utilities', 'Chauffage eau'),
('Water Polo', 'WaterPoloIcon', 'recreation', 'Accès piscine'),
('Cable Car', 'CableCarIcon', 'transport', 'Accès transport'),
('TV Smart', 'TvSmartIcon', 'entertainment', 'Télévision connectée'),
('CCTV Camera', 'CctvCameraIcon', 'security', 'Système de surveillance'),
('Virtual Reality VR', 'VirtualRealityVr01Icon', 'entertainment', 'Équipement VR')
ON CONFLICT (nom) DO NOTHING;

-- 12. Politique RLS pour les nouvelles tables
ALTER TABLE points_forts_propriete ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipements_propriete ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis_proprietes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agences ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents_immobiliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE types_equipements ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique
CREATE POLICY "Points forts visible par tous" ON points_forts_propriete FOR SELECT USING (true);
CREATE POLICY "Équipements visible par tous" ON equipements_propriete FOR SELECT USING (true);
CREATE POLICY "Avis publiés visible par tous" ON avis_proprietes FOR SELECT USING (est_publie = true);
CREATE POLICY "Agences visible par tous" ON agences FOR SELECT USING (true);
CREATE POLICY "Agents actifs visible par tous" ON agents_immobiliers FOR SELECT USING (est_actif = true);
CREATE POLICY "Types équipements visible par tous" ON types_equipements FOR SELECT USING (true);

-- Politiques d'écriture pour les administrateurs
CREATE POLICY "Admin peut gérer points forts" ON points_forts_propriete FOR ALL USING (auth.jwt() ->> 'email' = 'philippe@gclicke.com');
CREATE POLICY "Admin peut gérer équipements" ON equipements_propriete FOR ALL USING (auth.jwt() ->> 'email' = 'philippe@gclicke.com');
CREATE POLICY "Admin peut gérer avis" ON avis_proprietes FOR ALL USING (auth.jwt() ->> 'email' = 'philippe@gclicke.com');
CREATE POLICY "Admin peut gérer agences" ON agences FOR ALL USING (auth.jwt() ->> 'email' = 'philippe@gclicke.com');
CREATE POLICY "Admin peut gérer agents" ON agents_immobiliers FOR ALL USING (auth.jwt() ->> 'email' = 'philippe@gclicke.com');
CREATE POLICY "Admin peut gérer types équipements" ON types_equipements FOR ALL USING (auth.jwt() ->> 'email' = 'philippe@gclicke.com');