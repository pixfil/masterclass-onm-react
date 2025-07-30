const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fonction pour extraire le numéro d'étage depuis le texte
function extractFloorNumber(etageText) {
  if (!etageText) return null;
  
  const lowerText = etageText.toLowerCase();
  
  // Rez-de-chaussée = 0
  if (lowerText.includes('rez') || lowerText.includes('rdc')) {
    return 0;
  }
  
  // Extraire le nombre du début du texte
  const match = etageText.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  
  // Convertir les mots en nombres
  if (lowerText.includes('premier') || lowerText.includes('1er')) return 1;
  if (lowerText.includes('deuxième') || lowerText.includes('2ème')) return 2;
  if (lowerText.includes('troisième') || lowerText.includes('3ème')) return 3;
  if (lowerText.includes('quatrième') || lowerText.includes('4ème')) return 4;
  if (lowerText.includes('cinquième') || lowerText.includes('5ème')) return 5;
  if (lowerText.includes('sixième') || lowerText.includes('6ème')) return 6;
  if (lowerText.includes('septième') || lowerText.includes('7ème')) return 7;
  if (lowerText.includes('huitième') || lowerText.includes('8ème')) return 8;
  if (lowerText.includes('neuvième') || lowerText.includes('9ème')) return 9;
  if (lowerText.includes('dixième') || lowerText.includes('10ème')) return 10;
  
  return null;
}

// Fonction pour extraire le type de propriété du titre
function extractPropertyType(title) {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('studio')) return 'appartement';
  if (lowerTitle.includes('appartement') || lowerTitle.includes('f1') || lowerTitle.includes('f2') || lowerTitle.includes('f3') || lowerTitle.includes('f4')) return 'appartement';
  if (lowerTitle.includes('maison')) return 'maison';
  if (lowerTitle.includes('terrain')) return 'terrain';
  if (lowerTitle.includes('chambre')) return 'appartement';
  if (lowerTitle.includes('parking') || lowerTitle.includes('garage')) return 'parking';
  if (lowerTitle.includes('locaux') || lowerTitle.includes('commercial') || lowerTitle.includes('bureau')) return 'locaux_commerciaux';
  
  return 'autres';
}

// Fonction pour déterminer le type de transaction
function extractTransactionType(wpProperty) {
  if (!wpProperty.prix || wpProperty.prix === '' || wpProperty.prix === '0') {
    return 'location';
  }
  
  const prix = parseFloat(wpProperty.prix);
  if (prix > 50000) {
    return 'vente';
  }
  
  if (prix < 5000) {
    return 'location';
  }
  
  return 'vente';
}

// Fonction pour mapper le statut WordPress vers Supabase
function mapStatus(wpProperty) {
  if (wpProperty.vendu === 'Oui') {
    const transactionType = extractTransactionType(wpProperty);
    return transactionType === 'vente' ? 'vendu' : 'loue';
  }
  
  if (wpProperty.statut_bien) {
    const statut = wpProperty.statut_bien.toUpperCase();
    if (statut.includes('VENDU')) return 'vendu';
    if (statut.includes('LOUÉ') || statut.includes('DÉJÀ LOUÉ')) return 'loue';
    if (statut.includes('SOUS COMPROMIS') || statut.includes('SOUS OFFRE')) return 'sous_offre';
  }
  
  return 'disponible';
}

// Fonction pour mapper une propriété WordPress vers Supabase
function mapWordPressProperty(wpProperty) {
  const transactionType = extractTransactionType(wpProperty);
  const propertyType = extractPropertyType(wpProperty.post_title);
  const status = mapStatus(wpProperty);
  
  // Déterminer la ville
  let city = wpProperty.ville || '';
  if (!city && wpProperty.code_postal) {
    if (wpProperty.code_postal.startsWith('67')) {
      city = 'Strasbourg';
    }
  }
  
  // Extraire la ville depuis le titre si nécessaire
  if (!city) {
    const title = wpProperty.post_title.toLowerCase();
    if (title.includes('strasbourg')) city = 'Strasbourg';
    else if (title.includes('schiltigheim')) city = 'Schiltigheim';
    else if (title.includes('gambsheim')) city = 'Gambsheim';
    else if (title.includes('hoenheim')) city = 'Hoenheim';
    else if (title.includes('illkirch')) city = 'Illkirch-Graffenstaden';
    else if (title.includes('wantzenau')) city = 'La Wantzenau';
    else if (title.includes('mulhouse')) city = 'Mulhouse';
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
    etage: wpProperty.etage ? extractFloorNumber(wpProperty.etage) : null,
    garage: wpProperty.garage ? (wpProperty.garage === '1' || wpProperty.garage === 'Inclus' || wpProperty.garage === 'Possible en sus') : null,
    parking: wpProperty.parking ? parseInt(wpProperty.parking) || null : null,
    heating_type: wpProperty.chauffage || null,
    honoraires: wpProperty.honoraires ? parseFloat(wpProperty.honoraires.replace(/[^0-9.]/g, '')) : null,
    reference_interne: wpProperty.reference || null,
    published: wpProperty.post_status === 'publish',
    is_featured: false,
    created_at: wpProperty.post_date,
    updated_at: new Date().toISOString(),
    featured_image: null
  };
}

async function importMissingProperties() {
  try {
    console.log('🚀 Import des propriétés manquantes...\n');
    
    const jsonData = fs.readFileSync('wp_posts_initiative.json', 'utf8');
    const data = JSON.parse(jsonData);
    const tableData = data.find(item => item.type === 'table');
    const wpProperties = tableData.data;
    
    console.log(`📦 ${wpProperties.length} propriétés trouvées dans le fichier WordPress\n`);
    
    let imported = 0;
    let errors = 0;
    let skipped = 0;
    
    for (let i = 0; i < wpProperties.length; i++) {
      const wpProperty = wpProperties[i];
      console.log(`\n📋 [${i + 1}/${wpProperties.length}] Import: ${wpProperty.post_title}`);
      
      try {
        // Vérifier si la propriété existe déjà
        const { data: existing, error: checkError } = await supabase
          .from('properties')
          .select('id')
          .eq('handle', wpProperty.slug)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`❌ Erreur vérification: ${checkError.message}`);
          errors++;
          continue;
        }
        
        if (existing) {
          console.log(`⏭️  Propriété déjà importée (slug: ${wpProperty.slug})`);
          skipped++;
          continue;
        }
        
        // Mapper les données
        const mappedProperty = mapWordPressProperty(wpProperty);
        
        // Insérer en base avec gestion d'erreur détaillée
        const { data: insertedProperty, error } = await supabase
          .from('properties')
          .insert(mappedProperty)
          .select('id')
          .single();
        
        if (error) {
          console.error(`❌ Erreur insertion détaillée:`, {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          console.error(`📝 Données tentées:`, JSON.stringify(mappedProperty, null, 2));
          errors++;
        } else {
          console.log(`✅ Propriété importée avec succès (ID: ${insertedProperty.id})`);
          imported++;
        }
        
        // Pause pour éviter de surcharger
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ Erreur lors du traitement:`, error.message);
        console.error(`📝 Stack:`, error.stack);
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

importMissingProperties();