const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vxqxkezrgadseavfzjwp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d\'environnement');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fonction pour télécharger une image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    if (!url || url === 'null') {
      resolve(null);
      return;
    }

    const file = fs.createWriteStream(filename);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.log(`❌ Erreur téléchargement ${url}: ${response.statusCode}`);
        resolve(null);
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Image téléchargée: ${filename}`);
        resolve(filename);
      });
      
      file.on('error', (err) => {
        fs.unlink(filename, () => {}); // Supprimer le fichier en cas d'erreur
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Fonction pour extraire le type de propriété du titre
function extractPropertyType(title) {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('studio')) return 'appartement';
  if (lowerTitle.includes('appartement') || lowerTitle.includes('f1') || lowerTitle.includes('f2') || lowerTitle.includes('f3') || lowerTitle.includes('f4')) return 'appartement';
  if (lowerTitle.includes('maison')) return 'maison';
  if (lowerTitle.includes('terrain')) return 'terrain';
  if (lowerTitle.includes('chambre')) return 'appartement'; // Chambre = studio/appartement
  if (lowerTitle.includes('parking') || lowerTitle.includes('garage')) return 'parking';
  if (lowerTitle.includes('locaux') || lowerTitle.includes('commercial')) return 'locaux_commerciaux';
  
  return 'autres';
}

// Fonction pour déterminer le type de transaction
function extractTransactionType(wpProperty) {
  // Si le prix est vide ou 0, c'est probablement une location
  if (!wpProperty.prix || wpProperty.prix === '' || wpProperty.prix === '0') {
    return 'location';
  }
  
  // Si le prix est > 50000, c'est probablement une vente
  const prix = parseFloat(wpProperty.prix);
  if (prix > 50000) {
    return 'vente';
  }
  
  // Si le prix est < 5000, c'est probablement une location
  if (prix < 5000) {
    return 'location';
  }
  
  // Par défaut, on assume vente
  return 'vente';
}

// Fonction pour mapper le statut WordPress vers Supabase
function mapStatus(wpProperty) {
  // Priorité 1: Champ ACF "vendu" (le plus fiable)
  if (wpProperty.vendu === 'Oui') {
    const transactionType = extractTransactionType(wpProperty);
    return transactionType === 'vente' ? 'vendu' : 'loue';
  }
  
  // Priorité 2: statut_bien avec termes explicites
  if (wpProperty.statut_bien) {
    const statut = wpProperty.statut_bien.toUpperCase();
    if (statut.includes('VENDU')) return 'vendu';
    if (statut.includes('LOUÉ') || statut.includes('DÉJÀ LOUÉ')) return 'loue';
    if (statut.includes('SOUS COMPROMIS') || statut.includes('SOUS OFFRE')) return 'sous_offre';
  }
  
  // Par défaut : disponible
  return 'disponible';
}

// Fonction pour mapper une propriété WordPress vers Supabase
function mapWordPressProperty(wpProperty) {
  const transactionType = extractTransactionType(wpProperty);
  const propertyType = extractPropertyType(wpProperty.post_title);
  const status = mapStatus(wpProperty);
  
  // Déterminer la ville depuis le code postal ou l'adresse
  let city = wpProperty.ville || '';
  if (!city && wpProperty.code_postal) {
    // Extraire la ville du code postal si possible
    if (wpProperty.code_postal.startsWith('67')) {
      city = 'Strasbourg'; // Valeur par défaut pour le Bas-Rhin
    }
  }
  
  // Extraire la ville depuis l'adresse ou le titre si nécessaire
  if (!city) {
    const title = wpProperty.post_title.toLowerCase();
    if (title.includes('strasbourg')) city = 'Strasbourg';
    else if (title.includes('schiltigheim')) city = 'Schiltigheim';
    else if (title.includes('gambsheim')) city = 'Gambsheim';
    else if (title.includes('hoenheim')) city = 'Hoenheim';
    else if (title.includes('illkirch')) city = 'Illkirch-Graffenstaden';
    else if (title.includes('wantzenau')) city = 'La Wantzenau';
    else city = 'Non spécifiée';
  }
  
  return {
    title: wpProperty.post_title,
    handle: wpProperty.slug,
    price: wpProperty.prix ? parseFloat(wpProperty.prix) : 0,
    transaction_type: transactionType,
    property_type: propertyType,
    status: status,
    address: wpProperty.adresse || null,
    city: city,
    postal_code: wpProperty.code_postal || null,
    surface: wpProperty.surface ? parseFloat(wpProperty.surface) : null,
    acreage: wpProperty.surface_terrain ? parseFloat(wpProperty.surface_terrain.replace(/[^0-9.]/g, '')) : null,
    rooms: wpProperty.nb_pieces ? parseInt(wpProperty.nb_pieces) : null,
    bedrooms: wpProperty.chambres ? parseInt(wpProperty.chambres) : null,
    bathrooms: wpProperty.sdb ? parseInt(wpProperty.sdb) : null,
    etage: wpProperty.etage ? wpProperty.etage : null,
    garage: wpProperty.garage ? (wpProperty.garage === '1' || wpProperty.garage === 'Inclus' || wpProperty.garage === 'Possible en sus') : null,
    parking: wpProperty.parking ? parseInt(wpProperty.parking) || null : null,
    heating_type: wpProperty.chauffage || null,
    honoraires: wpProperty.honoraires ? parseFloat(wpProperty.honoraires.replace(/[^0-9.]/g, '')) : null,
    reference_interne: wpProperty.reference || null,
    published: wpProperty.post_status === 'publish', // ✅ Brouillon si private, publié si publish
    is_featured: false,
    created_at: wpProperty.post_date,
    updated_at: new Date().toISOString(),
    featured_image: null // Sera mis à jour après téléchargement de l'image
  };
}

// Fonction principale d'import
async function importWordPressProperties() {
  try {
    console.log('🚀 Début de l\'import des propriétés WordPress...\n');
    
    // Lire le fichier JSON
    const jsonData = fs.readFileSync('wp_posts_initiative.json', 'utf8');
    const data = JSON.parse(jsonData);
    
    // Extraire les propriétés du JSON (structure PHPMyAdmin export)
    const tableData = data.find(item => item.type === 'table');
    const wpProperties = tableData ? tableData.data : [];
    console.log(`📦 ${wpProperties.length} propriétés trouvées dans le fichier WordPress\n`);
    
    // Créer le dossier pour les images
    const imagesDir = path.join(__dirname, 'imported-images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
    }
    
    let imported = 0;
    let errors = 0;
    let skipped = 0;
    
    for (let i = 0; i < wpProperties.length; i++) {
      const wpProperty = wpProperties[i];
      console.log(`\n📋 [${i + 1}/${wpProperties.length}] Import: ${wpProperty.post_title}`);
      
      try {
        // Vérifier si la propriété existe déjà (par handle/slug)
        const { data: existing } = await supabase
          .from('properties')
          .select('id')
          .eq('handle', wpProperty.slug)
          .single();
        
        if (existing) {
          console.log(`⏭️  Propriété déjà importée (slug: ${wpProperty.slug})`);
          skipped++;
          continue;
        }
        
        // Mapper les données
        const mappedProperty = mapWordPressProperty(wpProperty);
        
        // Télécharger l'image si elle existe
        let imagePath = null;
        if (wpProperty.image_url && wpProperty.image_url !== 'null') {
          const imageExtension = path.extname(wpProperty.image_url) || '.jpg';
          const imageName = `${wpProperty.ID}${imageExtension}`;
          imagePath = path.join(imagesDir, imageName);
          
          try {
            await downloadImage(wpProperty.image_url, imagePath);
            mappedProperty.featured_image = `imported-images/${imageName}`;
          } catch (err) {
            console.log(`⚠️  Erreur téléchargement image: ${err.message}`);
          }
        }
        
        // Insérer en base
        const { data: insertedProperty, error } = await supabase
          .from('properties')
          .insert(mappedProperty)
          .select('id')
          .single();
        
        if (error) {
          console.error(`❌ Erreur insertion:`, error.message);
          errors++;
        } else {
          console.log(`✅ Propriété importée avec succès (ID: ${insertedProperty.id})`);
          imported++;
        }
        
      } catch (error) {
        console.error(`❌ Erreur lors du traitement:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n🎉 Import terminé !`);
    console.log(`✅ Importées: ${imported}`);
    console.log(`⏭️  Ignorées (déjà existantes): ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total traitées: ${imported + skipped + errors}/${wpProperties.length}`);
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Démarrer l'import
if (require.main === module) {
  importWordPressProperties();
}

module.exports = { importWordPressProperties };