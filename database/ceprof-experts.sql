-- Script SQL pour créer la table des experts CEPROF
-- À exécuter dans Supabase SQL Editor

-- Création de la table ceprof_experts
CREATE TABLE IF NOT EXISTS ceprof_experts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    profile_photo TEXT,
    specialties TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    credentials TEXT[] DEFAULT '{}',
    practice_location VARCHAR(255),
    website TEXT,
    linkedin TEXT,
    is_active BOOLEAN DEFAULT true,
    is_instructor BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_ceprof_experts_email ON ceprof_experts(email);
CREATE INDEX IF NOT EXISTS idx_ceprof_experts_active ON ceprof_experts(is_active);
CREATE INDEX IF NOT EXISTS idx_ceprof_experts_instructor ON ceprof_experts(is_instructor);
CREATE INDEX IF NOT EXISTS idx_ceprof_experts_verified ON ceprof_experts(is_verified);
CREATE INDEX IF NOT EXISTS idx_ceprof_experts_name ON ceprof_experts(last_name, first_name);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_ceprof_experts_updated_at ON ceprof_experts;
CREATE TRIGGER update_ceprof_experts_updated_at
    BEFORE UPDATE ON ceprof_experts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - ajustez selon vos besoins de sécurité
ALTER TABLE ceprof_experts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous (peut être ajustée)
CREATE POLICY IF NOT EXISTS "Permettre lecture experts" ON ceprof_experts
    FOR SELECT USING (true);

-- Politique pour permettre les modifications aux administrateurs seulement
-- (nécessite une colonne role dans auth.users ou une table users séparée)
CREATE POLICY IF NOT EXISTS "Permettre modifications admin experts" ON ceprof_experts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.email IN ('admin@masterclass-onm.com')
        )
    );

-- Données de test (optionnel)
INSERT INTO ceprof_experts (
    first_name, 
    last_name, 
    email, 
    phone,
    bio,
    specialties,
    years_experience,
    credentials,
    practice_location,
    is_active,
    is_instructor,
    is_verified,
    joined_date
) VALUES 
(
    'Dr. Marie',
    'Dupont',
    'marie.dupont@example.com',
    '01 23 45 67 89',
    'Spécialiste en orthodontie neuro-musculaire avec plus de 15 ans d''expérience. Formatrice certifiée CEPROF.',
    ARRAY['Orthodontie neuro-musculaire', 'Posturologie', 'Troubles TMJ'],
    15,
    ARRAY['DDS - Université Paris Descartes', 'Certification CEPROF Niveau 3', 'Formation TMJ Advanced'],
    'Paris, Île-de-France',
    true,
    true,
    true,
    '2020-01-15'
),
(
    'Dr. Jean',
    'Martin',
    'jean.martin@example.com',
    '01 98 76 54 32',
    'Orthodontiste passionné par les nouvelles approches thérapeutiques et la formation continue.',
    ARRAY['Orthodontie fonctionnelle', 'Rééducation posturale'],
    8,
    ARRAY['DDS - Université Lyon 1', 'Certification CEPROF Niveau 2'],
    'Lyon, Auvergne-Rhône-Alpes',
    true,
    false,
    true,
    '2021-03-10'
),
(
    'Dr. Sophie',
    'Leroy',
    'sophie.leroy@example.com',
    '01 11 22 33 44',
    'Expert en diagnostic postural et approches interdisciplinaires en orthodontie.',
    ARRAY['Diagnostic postural', 'Orthodontie interceptive', 'Approche holistique'],
    12,
    ARRAY['DDS - Université Bordeaux', 'Master Posturologie', 'Certification CEPROF Niveau 3'],
    'Bordeaux, Nouvelle-Aquitaine',
    true,
    true,
    true,
    '2019-09-05'
)
ON CONFLICT (email) DO NOTHING;

-- Afficher les données insérées
SELECT 
    first_name,
    last_name,
    email,
    specialties,
    years_experience,
    is_instructor,
    is_verified,
    practice_location
FROM ceprof_experts
ORDER BY last_name, first_name;