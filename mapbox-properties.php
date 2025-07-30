<?php
/**
 * Plugin Name: MapBox Properties
 * Description: Ajoute une carte interactive pour les propriétés immobilières avec MapBox.
 * Version: 1.0.0
 * Author: Votre Nom
 */

// Si ce fichier est appelé directement, on sort
if (!defined('ABSPATH')) {
    exit;
}

// Définir les constantes
define('MAPBOX_PROPERTIES_VERSION', '1.0.0');
define('MAPBOX_PROPERTIES_PATH', plugin_dir_path(__FILE__));
define('MAPBOX_PROPERTIES_URL', plugin_dir_url(__FILE__));

// Inclure les fichiers nécessaires
require_once MAPBOX_PROPERTIES_PATH . 'includes/class-mapbox-properties.php';
require_once MAPBOX_PROPERTIES_PATH . 'includes/shortcodes.php';

// Démarrer le plugin
function mapbox_properties_init() {
    $plugin = new MapBox_Properties();
    $plugin->init();
}
add_action('plugins_loaded', 'mapbox_properties_init');