<?php
/**
 * Classe principale du plugin
 */
class MapBox_Properties {
    
    /**
     * Initialiser le plugin
     */
    public function init() {
        // Enregistrer les scripts et styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Ajouter un menu d'options
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Enregistrer les paramètres
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    /**
     * Enregistrer et charger les scripts et styles
     */
    public function enqueue_scripts() {
        // Styles de MapBox
        wp_register_style(
            'mapbox-gl-css', 
            'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css',
            array(),
            MAPBOX_PROPERTIES_VERSION
        );
        
        // Script de MapBox
        wp_register_script(
            'mapbox-gl-js',
            'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js',
            array(),
            MAPBOX_PROPERTIES_VERSION,
            true
        );
        
        // Scripts personnalisés
        wp_register_script(
            'mapbox-properties-js',
            MAPBOX_PROPERTIES_URL . 'assets/js/mapbox-properties.js',
            array('jquery', 'mapbox-gl-js'),
            MAPBOX_PROPERTIES_VERSION,
            true
        );
        
        // Styles personnalisés
        wp_register_style(
            'mapbox-properties-css',
            MAPBOX_PROPERTIES_URL . 'assets/css/mapbox-properties.css',
            array('mapbox-gl-css'),
            MAPBOX_PROPERTIES_VERSION
        );
        
        // Localiser le script avec les données
        wp_localize_script('mapbox-properties-js', 'mapboxPropertiesData', array(
            'mapboxToken' => get_option('mapbox_properties_token', ''),
            'defaultLat' => get_option('mapbox_properties_default_lat', '48.5704'),
            'defaultLng' => get_option('mapbox_properties_default_lng', '7.7462'),
            'defaultZoom' => get_option('mapbox_properties_default_zoom', 13),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => get_rest_url(null, 'wp/v2/propriete')
        ));
    }
    
    /**
     * Ajouter un menu d'options dans l'admin
     */
    public function add_admin_menu() {
        add_options_page(
            'MapBox Properties',
            'MapBox Properties',
            'manage_options',
            'mapbox-properties',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Enregistrer les paramètres du plugin
     */
    public function register_settings() {
        register_setting('mapbox_properties_settings', 'mapbox_properties_token');
        register_setting('mapbox_properties_settings', 'mapbox_properties_default_lat');
        register_setting('mapbox_properties_settings', 'mapbox_properties_default_lng');
        register_setting('mapbox_properties_settings', 'mapbox_properties_default_zoom');
    }
    
    /**
     * Afficher la page des paramètres
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>Paramètres MapBox Properties</h1>
            <form method="post" action="options.php">
                <?php settings_fields('mapbox_properties_settings'); ?>
                <?php do_settings_sections('mapbox_properties_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="mapbox_properties_token">Clé API MapBox</label>
                        </th>
                        <td>
                            <input type="text" id="mapbox_properties_token" name="mapbox_properties_token" 
                                   value="<?php echo esc_attr(get_option('mapbox_properties_token')); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="mapbox_properties_default_lat">Latitude par défaut</label>
                        </th>
                        <td>
                            <input type="text" id="mapbox_properties_default_lat" name="mapbox_properties_default_lat" 
                                   value="<?php echo esc_attr(get_option('mapbox_properties_default_lat', '48.5704')); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="mapbox_properties_default_lng">Longitude par défaut</label>
                        </th>
                        <td>
                            <input type="text" id="mapbox_properties_default_lng" name="mapbox_properties_default_lng" 
                                   value="<?php echo esc_attr(get_option('mapbox_properties_default_lng', '7.7462')); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="mapbox_properties_default_zoom">Zoom par défaut</label>
                        </th>
                        <td>
                            <input type="number" id="mapbox_properties_default_zoom" name="mapbox_properties_default_zoom" 
                                   value="<?php echo esc_attr(get_option('mapbox_properties_default_zoom', '13')); ?>" class="small-text">
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}