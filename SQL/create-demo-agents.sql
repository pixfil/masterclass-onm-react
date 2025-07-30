-- Script pour créer 9 agents de démonstration avec photos de profil et de couverture
-- À exécuter dans Supabase Dashboard

INSERT INTO agents_immobiliers (
    prenom, 
    nom, 
    email, 
    telephone, 
    photo_agent, 
    description_agent, 
    specialites, 
    est_super_agent, 
    est_verifie, 
    note_moyenne, 
    nombre_avis_agent, 
    nombre_proprietes_gerees, 
    taux_reponse, 
    temps_reponse_moyen, 
    date_embauche, 
    annees_experience, 
    est_actif
) VALUES 
-- Agent 1 - Sophie Martin
(
    'Sophie', 
    'Martin', 
    'sophie.martin@initiative-immo.fr', 
    '03 88 12 34 56', 
    'https://images.unsplash.com/photo-1494790108755-2616b96b0ca8?w=300&h=300&fit=crop&crop=face', 
    'Spécialiste de l''immobilier résidentiel avec 15 ans d''expérience. Passionnée par l''accompagnement des familles dans leur projet de vie.', 
    ARRAY['Vente résidentielle', 'Primo-accédants', 'Investissement immobilier'], 
    true, 
    true, 
    4.9, 
    67, 
    142, 
    98, 
    'dans l''''heure', 
    '2015-03-15', 
    15, 
    true
),

-- Agent 2 - Thomas Dubois
(
    'Thomas', 
    'Dubois', 
    'thomas.dubois@initiative-immo.fr', 
    '03 88 23 45 67', 
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', 
    'Expert en immobilier commercial et investissement. Conseille les professionnels et investisseurs depuis plus de 12 ans.', 
    ARRAY['Immobilier commercial', 'Investissement immobilier', 'Gestion locative'], 
    true, 
    true, 
    4.8, 
    89, 
    98, 
    95, 
    'dans les 2 heures', 
    '2018-09-01', 
    12, 
    true
),

-- Agent 3 - Marie Lefebvre
(
    'Marie', 
    'Lefebvre', 
    'marie.lefebvre@initiative-immo.fr', 
    '03 88 34 56 78', 
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face', 
    'Spécialiste du marché locatif strasbourgeois. Accompagne propriétaires et locataires avec bienveillance et expertise.', 
    ARRAY['Location résidentielle', 'Gestion locative', 'Vente résidentielle'], 
    false, 
    true, 
    4.7, 
    52, 
    76, 
    92, 
    'dans l''''heure', 
    '2020-01-15', 
    8, 
    true
),

-- Agent 4 - Antoine Bernard
(
    'Antoine', 
    'Bernard', 
    'antoine.bernard@initiative-immo.fr', 
    '03 88 45 67 89', 
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 
    'Expert en immobilier de luxe et propriétés d''exception. Discrétion et excellence au service d''une clientèle exigeante.', 
    ARRAY['Immobilier de luxe', 'Vente résidentielle', 'Terrain et construction'], 
    true, 
    true, 
    4.9, 
    34, 
    47, 
    99, 
    'dans l''''heure', 
    '2017-06-01', 
    10, 
    true
),

-- Agent 5 - Camille Moreau
(
    'Camille', 
    'Moreau', 
    'camille.moreau@initiative-immo.fr', 
    '03 88 56 78 90', 
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop&crop=face', 
    'Conseillère dynamique spécialisée dans l''accompagnement des jeunes couples et primo-accédants. Toujours à l''écoute de vos besoins.', 
    ARRAY['Primo-accédants', 'Vente résidentielle', 'Location résidentielle'], 
    false, 
    true, 
    4.6, 
    41, 
    63, 
    88, 
    'dans les 2 heures', 
    '2021-03-01', 
    6, 
    true
),

-- Agent 6 - Julien Garcia
(
    'Julien', 
    'Garcia', 
    'julien.garcia@initiative-immo.fr', 
    '03 88 67 89 01', 
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face', 
    'Spécialiste des terrains et projets de construction. Accompagne vos projets de A à Z avec passion et professionnalisme.', 
    ARRAY['Terrain et construction', 'Vente résidentielle', 'Investissement immobilier'], 
    false, 
    true, 
    4.8, 
    28, 
    39, 
    94, 
    'dans la journée', 
    '2019-11-15', 
    7, 
    true
),

-- Agent 7 - Emilie Petit
(
    'Emilie', 
    'Petit', 
    'emilie.petit@initiative-immo.fr', 
    '03 88 78 90 12', 
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face', 
    'Experte en gestion locative et investissement. Optimise la rentabilité de votre patrimoine immobilier avec rigueur.', 
    ARRAY['Gestion locative', 'Investissement immobilier', 'Location résidentielle'], 
    false, 
    true, 
    4.7, 
    73, 
    124, 
    91, 
    'dans les 2 heures', 
    '2016-08-01', 
    11, 
    true
),

-- Agent 8 - Nicolas Roux
(
    'Nicolas', 
    'Roux', 
    'nicolas.roux@initiative-immo.fr', 
    '03 88 89 01 23', 
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', 
    'Négociateur expérimenté, spécialiste des transactions complexes. Votre projet immobilier entre de bonnes mains.', 
    ARRAY['Vente résidentielle', 'Immobilier commercial', 'Investissement immobilier'], 
    false, 
    true, 
    4.8, 
    56, 
    87, 
    96, 
    'dans l''''heure', 
    '2018-02-01', 
    9, 
    true
),

-- Agent 9 - Laura Simon
(
    'Laura', 
    'Simon', 
    'laura.simon@initiative-immo.fr', 
    '03 88 90 12 34', 
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face', 
    'Conseillère immobilière passionnée par l''architecture et le design. Trouve le bien qui correspond parfaitement à votre style de vie.', 
    ARRAY['Vente résidentielle', 'Immobilier de luxe', 'Primo-accédants'], 
    false, 
    true, 
    4.9, 
    38, 
    51, 
    93, 
    'dans l''''heure', 
    '2022-01-15', 
    4, 
    true
);

-- Afficher le résultat
SELECT 
    prenom, 
    nom, 
    email, 
    specialites, 
    note_moyenne, 
    nombre_avis_agent,
    est_super_agent,
    est_verifie
FROM agents_immobiliers 
WHERE email LIKE '%initiative-immo.fr' 
ORDER BY created_at DESC;