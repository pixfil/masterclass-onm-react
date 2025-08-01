<?php
/**
 * Plugin Name: WooCommerce Wordline Sips 2.0 Gateway
 * Plugin URI: https://www.absoluteweb.net/prestations/wordpress-woocommerce-extensions-traductions/woocommerce-atos2/
 * Description: Passerelle de paiement Wordline Sips 2.0 pour WooCommerce.
 * Version: 1.5.6
 * Author: Nicolas Maillard
 * Author URI: https://www.absoluteweb.net/
 * License: Copyright ABSOLUTE Web
 *
 * WC requires at least: 2.0
 * WC tested up to: 99
 *
 *	Intellectual Property rights, and copyright, reserved by Nicolas Maillard, ABSOLUTE Web as allowed by law incude,
 *	but are not limited to, the working concept, function, and behavior of this plugin,
 *	the logical code structure and expression as written.
 *
 *
 * @package     WooCommerce Wordline Sips 2.0 Gateway, WooCommerce API Manager
 * @author      Nicolas Maillard, ABSOLUTE Web
 * @category    Plugin
 * @copyright   Copyright (c) 2000-2022, Nicolas Maillard ABSOLUTE Web
 * @license     http://www.gnu.org/licenses/gpl-3.0.html GNU General Public License v3.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Displays an inactive message if the API License Key has not yet been activated
 */
if ( get_option( 'atos_2_activated' ) != 'Activated' ) {
    add_action( 'admin_notices', 'Atos_2::am_atos_2_inactive_notice' );
}

class Atos_2 {

	/**
	 * Self Upgrade Values
	 */
	// Base URL to the remote upgrade API Manager server. If not set then the Author URI is used.
	public $upgrade_url = 'https://www.absoluteweb.net/';

	/**
	 * @var string
	 */
	public $version = '1.5.6';

	/**
	 * @var string
	 * This version is saved after an upgrade to compare this db version to $version
	 */
	public $atos_2_version_name = 'plugin_atos_2_version';

	/**
	 * @var string
	 */
	public $plugin_url;

	/**
	 * @var string
	 * used to defined localization for translation, but a string literal is preferred
	 *
	 * https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate/issues/59
	 * http://markjaquith.wordpress.com/2011/10/06/translating-wordpress-plugins-and-themes-dont-get-clever/
	 * http://ottopress.com/2012/internationalization-youre-probably-doing-it-wrong/
	 */
	public $text_domain = 'atos_2';

	/**
	 * Data defaults
	 * @var mixed
	 */
	private $atos_2_software_product_id;

	public $atos_2_data_key;
	public $atos_2_api_key;
	public $atos_2_activation_email;
	public $atos_2_product_id_key;
	public $atos_2_instance_key;
	public $atos_2_deactivate_checkbox_key;
	public $atos_2_activated_key;

	public $atos_2_deactivate_checkbox;
	public $atos_2_activation_tab_key;
	public $atos_2_deactivation_tab_key;
	public $atos_2_settings_menu_title;
	public $atos_2_settings_title;
	public $atos_2_menu_tab_activation_title;
	public $atos_2_menu_tab_deactivation_title;

	public $atos_2_options;
	public $atos_2_plugin_name;
	public $atos_2_product_id;
	public $atos_2_renew_license_url;
	public $atos_2_instance_id;
	public $atos_2_domain;
	public $atos_2_software_version;
	public $atos_2_plugin_or_theme;

	public $atos_2_update_version;

	public $atos_2_update_check = 'am_atos_2_plugin_update_check';

	/**
	 * Used to send any extra information.
	 * @var mixed array, object, string, etc.
	 */
	public $atos_2_extra;

    /**
     * @var The single instance of the class
     */
    protected static $_instance = null;

    public static function instance() {

        if ( is_null( self::$_instance ) ) {
        	self::$_instance = new self();
        }

        return self::$_instance;
    }

	/**
	 * Cloning is forbidden.
	 *
	 * @since 1.2
	 */
	private function __clone() {}

	/**
	 * Unserializing instances of this class is forbidden.
	 *
	 * @since 1.2
	 */
	public function __wakeup() {} // private provoque un warning php 8

	public function __construct() {

		// Run the activation function
		register_activation_hook( __FILE__, array( $this, 'activation' ) );

		// Ready for translation
		load_plugin_textdomain( $this->text_domain, false, dirname( untrailingslashit( plugin_basename( __FILE__ ) ) ) . '/lang' );

		if ( is_admin() ) {

			// Check for external connection blocking
			add_action( 'admin_notices', array( $this, 'check_external_blocking' ) );

			/**
			 * Software Product ID is the product title string
			 * This value must be unique, and it must match the API tab for the product in WooCommerce
			 */
			$this->atos_2_software_product_id = 'WooCommerce Atos 2 Gateway';

			/**
			 * Set all data defaults here
			 */
			$this->atos_2_data_key 				= 'atos_2';
			$this->atos_2_api_key 					= 'api_key';
			$this->atos_2_activation_email 		= 'activation_email';
			$this->atos_2_product_id_key 			= 'atos_2_product_id';
			$this->atos_2_instance_key 			= 'atos_2_instance';
			$this->atos_2_deactivate_checkbox_key 	= 'atos_2_deactivate_checkbox';
			$this->atos_2_activated_key 			= 'atos_2_activated';

			/**
			 * Set all admin menu data
			 */
			$this->atos_2_deactivate_checkbox 			= 'am_deactivate_atos_2_checkbox';
			$this->atos_2_activation_tab_key 			= 'atos_2_dashboard';
			$this->atos_2_deactivation_tab_key 		= 'atos_2_deactivation';
			$this->atos_2_settings_menu_title 			= 'Licence Passerelle Wordline Sips 2.0';
			$this->atos_2_settings_title 				= 'Licence Passerelle Wordline Sips 2.0';
			$this->atos_2_menu_tab_activation_title 	= __( 'License Activation', 'atos_2' );
			$this->atos_2_menu_tab_deactivation_title 	= __( 'License Deactivation', 'atos_2' );

			/**
			 * Set all software update data here
			 */
			$this->atos_2_options 				= get_option( $this->atos_2_data_key );
			$this->atos_2_plugin_name 			= untrailingslashit( plugin_basename( __FILE__ ) ); // same as plugin slug. if a theme use a theme name like 'twentyeleven'
			$this->atos_2_product_id 			= get_option( $this->atos_2_product_id_key ); // Software Title
			$this->atos_2_renew_license_url 	= 'https://www.absoluteweb.net/mon-compte'; // URL to renew a license. Trailing slash in the upgrade_url is required.
			$this->atos_2_instance_id 			= get_option( $this->atos_2_instance_key ); // Instance ID (unique to each blog activation)
			/**
			 * Some web hosts have security policies that block the : (colon) and // (slashes) in http://,
			 * so only the host portion of the URL can be sent. For example the host portion might be
			 * www.example.com or example.com. http://www.example.com includes the scheme http,
			 * and the host www.example.com.
			 * Sending only the host also eliminates issues when a client site changes from http to https,
			 * but their activation still uses the original scheme.
			 * To send only the host, use a line like the one below:
			 *
			 * $this->atos_2_domain = str_ireplace( array( 'http://', 'https://' ), '', home_url() ); // blog domain name
			 */
			$this->atos_2_domain 				= str_ireplace( array( 'http://', 'https://' ), '', home_url() ); // blog domain name
			$this->atos_2_software_version 	= $this->version; // The software version
			$this->atos_2_plugin_or_theme 		= 'plugin'; // 'theme' or 'plugin'

			// Performs activations and deactivations of API License Keys
			require_once( plugin_dir_path( __FILE__ ) . 'am/classes/class-wc-key-api.php' );

			// Checks for software updatess
			require_once( plugin_dir_path( __FILE__ ) . 'am/classes/class-wc-plugin-update.php' );

			// Admin menu with the license key and license email form
			require_once( plugin_dir_path( __FILE__ ) . 'am/admin/class-wc-api-manager-menu.php' );

			$options = get_option( $this->atos_2_data_key );

			/**
			 * Check for software updates
			 */
			if ( ! empty( $options ) && $options !== false ) {

				$this->update_check(
					$this->upgrade_url,
					$this->atos_2_plugin_name,
					$this->atos_2_product_id,
					$this->atos_2_options[$this->atos_2_api_key],
					$this->atos_2_options[$this->atos_2_activation_email],
					$this->atos_2_renew_license_url,
					$this->atos_2_instance_id,
					$this->atos_2_domain,
					$this->atos_2_software_version,
					$this->atos_2_plugin_or_theme,
					$this->text_domain
					);

			}

		}

		/**
		 * Deletes all data if plugin deactivated
		 */
		register_deactivation_hook( __FILE__, array( $this, 'uninstall' ) );

	}

	/** Load Shared Classes as on-demand Instances **********************************************/

	/**
	 * API Key Class.
	 *
	 * @return Atos_2_Key
	 */
	public function key() {
		return Atos_2_Key::instance();
	}

	/**
	 * Update Check Class.
	 *
	 * @return Atos_2_Update_API_Check
	 */
	public function update_check( $upgrade_url, $plugin_name, $product_id, $api_key, $activation_email, $renew_license_url, $instance, $domain, $software_version, $plugin_or_theme, $text_domain, $extra = '' ) {

		return Atos_2_Update_API_Check::instance( $upgrade_url, $plugin_name, $product_id, $api_key, $activation_email, $renew_license_url, $instance, $domain, $software_version, $plugin_or_theme, $text_domain, $extra );
	}

	public function plugin_url() {
		if ( isset( $this->plugin_url ) ) {
			return $this->plugin_url;
		}

		return $this->plugin_url = plugins_url( '/', __FILE__ );
	}

	/**
	 * Generate the default data arrays
	 */
	public function activation() {
		global $wpdb;

		$global_options = array(
			$this->atos_2_api_key 				=> '',
			$this->atos_2_activation_email 	=> '',
					);

		update_option( $this->atos_2_data_key, $global_options );

		require_once( plugin_dir_path( __FILE__ ) . 'am/classes/class-wc-api-manager-passwords.php' );

		$atos_2_password_management = new Atos_2_Password_Management();

		// Generate a unique installation $instance id
		$instance = $atos_2_password_management->generate_password( 12, false );

		$single_options = array(
			$this->atos_2_product_id_key 			=> $this->atos_2_software_product_id,
			$this->atos_2_instance_key 			=> $instance,
			$this->atos_2_deactivate_checkbox_key 	=> 'on',
			$this->atos_2_activated_key 			=> 'Deactivated',
			);

		foreach ( $single_options as $key => $value ) {
			update_option( $key, $value );
		}

		$curr_ver = get_option( $this->atos_2_version_name );

		// checks if the current plugin version is lower than the version being installed
		if ( version_compare( $this->version, $curr_ver, '>' ) ) {
			// update the version
			update_option( $this->atos_2_version_name, $this->version );
		}

	}

	/**
	 * Deletes all data if plugin deactivated
	 * @return void
	 */
	public function uninstall() {
		global $wpdb, $blog_id;

		$this->license_key_deactivation();

		// Remove options
		if ( is_multisite() ) {

			switch_to_blog( $blog_id );

			foreach ( array(
					$this->atos_2_data_key,
					$this->atos_2_product_id_key,
					$this->atos_2_instance_key,
					$this->atos_2_deactivate_checkbox_key,
					$this->atos_2_activated_key,
					) as $option) {

					delete_option( $option );

					}

			restore_current_blog();

		} else {

			foreach ( array(
					$this->atos_2_data_key,
					$this->atos_2_product_id_key,
					$this->atos_2_instance_key,
					$this->atos_2_deactivate_checkbox_key,
					$this->atos_2_activated_key
					) as $option) {

					delete_option( $option );

					}

		}

	}

	/**
	 * Deactivates the license on the API server
	 * @return void
	 */
	public function license_key_deactivation() {

		$activation_status = get_option( $this->atos_2_activated_key );

		$api_email = $this->atos_2_options[$this->atos_2_activation_email];
		$api_key = $this->atos_2_options[$this->atos_2_api_key];

		$args = array(
			'email' => $api_email,
			'licence_key' => $api_key,
			);

		if ( $activation_status == 'Activated' && $api_key != '' && $api_email != '' ) {
			$this->key()->deactivate( $args ); // reset license key activation
		}
	}

    /**
     * Displays an inactive notice when the software is inactive.
     */
	public static function am_atos_2_inactive_notice() { ?>
		<?php if ( ! current_user_can( 'manage_options' ) ) return; ?>
		<?php if ( isset( $_GET['page'] ) && 'atos_2_dashboard' == $_GET['page'] ) return; ?>
		<div id="message" class="error">
			<p><?php printf( __( 'The Wordline Sips 2.0 Gateway API License Key has not been activated, so the plugin is inactive! %sClick here%s to activate the license key and the plugin.', 'atos_2' ), '<a href="' . esc_url( admin_url( 'options-general.php?page=atos_2_dashboard' ) ) . '">', '</a>' ); ?></p>
		</div>
		<?php
	}

	/**
	 * Check for external blocking contstant
	 * @return string
	 */
	public function check_external_blocking() {
		// show notice if external requests are blocked through the WP_HTTP_BLOCK_EXTERNAL constant
		if( defined( 'WP_HTTP_BLOCK_EXTERNAL' ) && WP_HTTP_BLOCK_EXTERNAL === true ) {

			// check if our API endpoint is in the allowed hosts
			$host = parse_url( $this->upgrade_url, PHP_URL_HOST );

			if( ! defined( 'WP_ACCESSIBLE_HOSTS' ) || stristr( WP_ACCESSIBLE_HOSTS, $host ) === false ) {
				?>
				<div class="error">
					<p><?php printf( __( '<b>Warning!</b> You\'re blocking external requests which means you won\'t be able to get %s updates. Please add %s to %s.', 'atos_2' ), $this->atos_2_software_product_id, '<strong>' . $host . '</strong>', '<code>WP_ACCESSIBLE_HOSTS</code>'); ?></p>
				</div>
				<?php
			}

		}
	}

} // End of class

function Atos_2() {
    return Atos_2::instance();
}

// Initialize the class instance only once
Atos_2();

/*
*
*
*/
add_action('init','woocommerce_gateway_atos2_init');
function woocommerce_gateway_atos2_init() {
	load_plugin_textdomain('atos2', false, dirname(plugin_basename(__FILE__)).'/lang');
}

function woocommerce_gateway_atos2_activation() {
	if (!is_plugin_active('woocommerce/woocommerce.php')) {
		deactivate_plugins(plugin_basename(__FILE__)); 		
		$message = sprintf(__("Désolé ! Pour utiliser l'extension de passerelle WooCommerce %s, vous devez installer et activer l'extension WooCommerce.", 'atos2'), 'Wordline Sips 2.0');
		wp_die($message, __('Extension Passerelle de Paiement Wordline Sips 2.0', 'atos2'), array('back_link' => true));
	}
}
register_activation_hook(__FILE__, 'woocommerce_gateway_atos2_activation');

add_action('plugins_loaded', 'init_gateway_atos2', 0);

function init_gateway_atos2() {
	
	if ( ! class_exists( 'WC_Payment_Gateway' ) ) { return; }
	
	if(!defined("PASSERELLE_ATOS2_VERSION")) define("PASSERELLE_ATOS2_VERSION", "1.5.6");
	define('__WPRootAtos2__',dirname(dirname(dirname(dirname(__FILE__)))));
	define('__ServerRootAtos2__',dirname(dirname(dirname(dirname(dirname(__FILE__))))));	
 
 class WC_Gateway_Atos2 extends WC_Payment_Gateway {
			
		public function __construct() { 
        	$this->id = 'atos2';
			$this->order_button_text  = __( 'Payer par Carte Bancaire', 'atos2' ); // Proceed to Credit Card
			$this->method_title = 'Wordline Sips 2.0';
			$this->method_description = __( "Accepter les paiements par carte bancaire pour les commerçants qui disposent d'un contrat Worldline Sips 2.0 (Mercanet 2.0 de BNP Paribas, Sogenactif 2.0 de la Société Générale, Scellius Net 2.0 de la Banque Postale, Sherlock's 2.0 du LCL, Wordline en contrat direct)", 'atos2' );
			$this->logo = plugins_url('woocommerce-gateway-atos2/logo/Worldline-300x82.png');
        	$this->has_fields = true;	
			$this->init_form_fields();
			$this->init_settings();
			if($this->get_option('icone_standard')=='custom') $icone = $this->get_option('gateway_image'); else $icone = $this->get_option('icone_standard');
			$this->icon = apply_filters('woocommerce_atos2_icon', $icone);
			$this->title = $this->get_option('title');
			$this->description = $this->get_option('description');
			$this->methodes = array('atos2', 'atos2_2x', 'atos2_3x', 'atos2_4x');
			add_action( 'woocommerce_api_'.strtolower(get_class($this)), array( $this, 'check_atos2_response' ) );
			add_action('woocommerce_receipt_' . $this->id, array($this, 'receipt_page'));
			add_action( 'woocommerce_update_options_payment_gateways', array( &$this, 'process_admin_options' ) );
			add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
			add_filter('woocommerce_thankyou_order_received_text', array($this, 'abw_txt_erreur_paiement'), 11, 2);
    		add_action('woocommerce_thankyou_' . $this->id, array($this, 'thankyou_page'));
			add_filter( 'woocommerce_endpoint_order-received_title', array($this, 'new_titre_commande_recue'), 11, 2);
			add_action( 'woocommerce_email_before_order_table', array( $this, 'atos2_paiement_confirme' ), 10, 4 );
    	} 
		function init_form_fields() {
			
			$upload_dir = wp_upload_dir();
			$dir_log = $upload_dir['basedir'];
			
			require_once('class/Atos.php');
    		$paymentRequest = new Atos2('002001000000001_KEY1');
			$brandsmaptemp = $paymentRequest->brandsmap;
			$brandsmap = array_combine( array_keys( $brandsmaptemp ), array_keys( $brandsmaptemp ) );
			
			$currenciestemp = $paymentRequest::$currencies;
			$currencies = array_combine( array_keys( $currenciestemp ), array_keys( $currenciestemp ) );
			$languagestemp = $paymentRequest->allowedlanguages;
			$languages = array_combine( $languagestemp, $languagestemp );
			
			if(empty($this->icon)) $this->icon = plugins_url('woocommerce-gateway-atos2/logo/cb-visa-mastercard.png');
		
			$this->form_fields = array(
				'enabled' => array(
								'title' => __( "Activer/Désactiver", 'atos2' ), 
								'type' => 'checkbox', 
								'label' => __( "Activer le paiement Wordlline Sips 2.0", 'atos2' ), 
								'default' => 'no'
							), 
				'title' => array(
								'title' => __( "Titre", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Correspond au titre que le client verra pendant la commande.", 'atos2' ), 
								'default' => __( "Carte Bancaire", 'atos2' ),
								'desc_tip' => true
							),
				'description' => array(
								'title' => __( "Message au client", 'atos2' ), 
								'type' => 'textarea', 
								'description' => __( "Informez le client du mode de paiement par carte bancaire.", 'atos2' ), 
								'default' => __( "En choisissant ce mode de paiement vous pourrez effectuer votre règlement sur le serveur sécurisé de notre banque.", 'atos2' ),
								'desc_tip' => true,
								'css' => 'width:90%'
							), 
				'banque' => array(
								'title' => 'Banque', 
								'type' => 'select', 
								'description' => __( "Votre établissement bancaire", 'atos2' ),
								'options' => array(
									'' => __("Veuillez sélectionner votre contrat bancaire", 'atos2'),
									'sherlocks' => __("LCL - Sherlock's", 'atos2'),
									'mercanet' => __("BNP Paribas - Merc@net", 'atos2'),
									'sogenactif' => __("Société Générale - Sogenactif", 'atos2'),
									'scellius' => __("La Banque Postale - Scellius Net", 'atos2'),
									'atos' => __("Wordline Sips (contrat en direct)", 'atos2')
								),
								'default' => '',
								'css' => 'width:550px',
								'desc_tip' => true,
								'class' => 'wc-enhanced-select'
							),
				'icone_standard' => array(
								'title' => __( "Icône de paiement", 'atos2' ), 
								'type' => 'select',
								'description' => __( "image affichée lors du choix du moyen de paiement.", 'atos2' )."<span><img src='".$this->icon."' /></span>",
								'options' => array(
									plugins_url('woocommerce-gateway-atos2/logo/logo-lcl-sherlocks.png') => __("LCL - Sherlock's", 'atos2'),
									plugins_url('woocommerce-gateway-atos2/logo/logo-bnp-paribas.png') => __("BNP Paribas - Merc@net", 'atos2'),
									plugins_url('woocommerce-gateway-atos2/logo/logo-societe-generale.png') => __("Société Générale - Sogenactif", 'atos2'),
									plugins_url('woocommerce-gateway-atos2/logo/logo-scellius-la-poste.png') => __("La Banque Postale - Scellius Net", 'atos2'),
									plugins_url('woocommerce-gateway-atos2/logo/cb-visa-mastercard.png') => __("CB - VISA - MASTERCARD", 'atos2'),
									'custom' => __("Indiquez l'URL de votre icône", 'atos2')
								),
								'desc_tip' => true,
								'class' => 'wc-enhanced-select'
							),
				'gateway_image' => array(
								'title' => __( "Icône personnalisée", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Url de l'image affichée lors du choix du moyen de paiement.", 'atos2' ),
								'css' => 'width:750px',
								'desc_tip' => true
							),
				'migration' => array(
								'title' => __( "Migration simplifiée ?", 'atos2' ), 
								'type' => 'checkbox', 
								'label' => __( "Cochez pour utiliser votre contrat version 1.0 sur cette passerelle.", 'atos2' ), 
								'default' => 'no',
								'description' => __( "Pour bénéficier de la migration simplifiée, votre solution bancaire doit vous permettre de générer une clé secrète qui remplace votre ancien certificat commerçant (fichier certif.fr.xxxx.php).", 'atos2' ),
								'desc_tip' => true
							),
				'no_reference_transaction' => array(
								'title' => __( "Référence transaction ?", 'atos2' ), 
								'type' => 'checkbox', 
								'label' => __( "La boutique NE doit PAS transmettre la référence de transaction (A cocher par défaut pour Sogenactif 2.0 de Société Générale et Sherlock's 2.0 de LCL).", 'atos2' ), 
								'default' => 'no',
								'description' => __( "Doit obligatoirement correspondre à l'option choisie sur votre contrat bancaire. Si vous ne faites pas le même choix, vous obtiendrez une erreur lors de la connexion au serveur de la banque.", 'atos2' ),
								'desc_tip' => true
							),
				'mode' => array(
								'title' => __( "Mode d'utilisation de la solution bancaire", 'atos2' ), 
								'type' => 'select', 
								'description' => "<p id=\"woocommerce_atos2_simu_msg\"><u>".__( "Cartes de simulation :", 'atos2')."</u><br/>4100000000000000 (VISA)<br/>5100000000000000 (Mastercard)<br/>".__( "Date future" )."<br/>".__( "Cryptogramme 600" )."</p>",
								'options' => array(
									'SIMU' => __("SIMULATION", 'atos2'),
									//'TEST' => __("TEST", 'atos2'),
									'PROD' => __("PRODUCTION", 'atos2')
								),
								'default' => 'TEST',
								'css' => 'width:160px',
								'class' => 'wc-enhanced-select'
							), 
				'merchant_id' => array(
								'title' => 'merchantId', 
								'type' => 'text', 
								'description' => __( "Identifiant commerçant de production fourni par votre banque.", 'atos2' ), 
								'default' => '002001000000001',
								'css' => 'width:140px',
								'desc_tip' => true
							),
				'key_version' => array(
								'title' => 'keyVersion', 
								'type' => 'text', 
								'description' => __( "Version de la clé secrète de production récupérée sur le site de votre banque.", 'atos2' ), 
								'default' => '1',
								'css' => 'width:140px',
								'desc_tip' => true
							),
				'secret_key' => array(
								'title' => 'secretKey', 
								'type' => 'text', 
								'description' => __( "Clé secrète de production récupérée sur le site de votre banque.", 'atos2' ), 
								'default' => '002001000000001_KEY1',
								'css' => 'width:400px',
								'desc_tip' => true
							), 
				'challenge' => array(
								'title' => 'Challenge 3DS2', 
								'type' => 'select', 
								'description' => __( "Souhait du commerçant pour l'authentification du client. Consultez la documentation Worldline pour le transfert des responsabilités", 'atos2' ),
								'options' => array(
									'CHALLENGE' => __("Authentification demandée", 'atos2'),
									'CHALLENGE_MANDATE' => __("Authentification règlementaire demandée", 'atos2'),
									'NO_CHALLENGE' => __("Pas d'authentification demandée", 'atos2'),
									'NO_CHALLENGE_TRA_ACQ' => __("Pas d'authentification demandée jusqu'à 100 €", 'atos2'),
									'NO_PREFERENCE' => __("Aucune préférence d'authentification", 'atos2')
								),
								'default' => 'CHALLENGE',
								'desc_tip' => true,
								'class' => 'wc-enhanced-select'
							),
				/*'http' => array(
								'title' => __( "Autoresponse en http", 'atos2' ), 
								'type' => 'checkbox', 
								'label' => __( "Forcer l'url de retour de banque en http pour les sites en https.", 'atos2' ), 
								'default' => 'no'
							),*/
				'currency_code' => array(
								'title' => 'currencyCode', 
								'type' => 'select', 
								'description' => __( "Devise utilisée sur la boutique.", 'atos2' ),
								'options' => $currencies,
								'default' => 'EUR',
								'desc_tip' => true,
								'class' => 'wc-enhanced-select'
							), 
				'customer_language' => array(
								'title' => 'customerLanguage', 
								'type' => 'select', 
								'description' => __( "Langue utilisée sur la boutique.", 'atos2' ), 
								'options' => $languages,
								'default' => 'fr',
								'desc_tip' => true,
								'class' => 'wc-enhanced-select'
							), 
				'capture_mode' => array(
								'title' => 'captureMode', 
								'type' => 'select', 
								'description' => __( "Mode d'envoi en banque. AUTHOR_CAPTURE (encaissement automatique après x jours) ou VALIDATION (encaissement manuel, annulation après x jours si non encaissé). Voir la documentation de votre banque.", 'atos2' ),
								'options' => array(
									'AUTHOR_CAPTURE' => "AUTHOR_CAPTURE",
									'VALIDATION' => "VALIDATION",
									'IMMEDIATE' => "IMMEDIATE"
								),
								'default' => 'AUTHOR_CAPTURE',
								'desc_tip' => true,
								'class' => 'wc-enhanced-select'
							),
				'capture_day' => array(
								'title' => 'captureDay', 
								'type' => 'text',
								'description' => __( "Délai en jours avant l'envoi en banque (AUTHOR_CAPTURE) ou l'expiration (VALIDATION). Voir la documentation de votre banque. La valeur peut être plafonnée par votre banque.", 'atos2' ),
								'default' => '0',
								'css' => 'width:50px',
								'desc_tip' => true
							),
				'return_context' => array(
								'title' => 'returnContext', 
								'type' => 'select', 
								'description' => __( "Ce champ peut être utilisé pour retrouver le contexte de la commande d’un acheteur. Voir la documentation de votre banque.", 'atos2' ),
								'options' => array(
									'' => __("Aucun contexte", 'atos2'),
									'nom' => __("Prénom Nom", 'atos2'),
									'email' => __("Email", 'atos2')
								),
								'desc_tip' => true,
								'class' => 'wc-enhanced-select'
							),
				'payment_means' => array(
								'title' => 'paymentMeanBrandList', 
								'type' => 'multiselect', 
								'description' => __( "Ce champ liste les moyens de paiement autorisés. Laisser vide pour proposer tous les moyens de paiement compatibles avec votre contrat.", 'atos2' ),
								'options' => $brandsmap,
								'custom_attributes' => array( 'multiple' => 'multiple' ),
								'default' => '',
								'css' => 'width:90%',
								'desc_tip' => true,
								'class' => 'wc-enhanced-select'
							),
				'3xweb' => array(
								'title' => '3x Web FRANFINANCE', 
								'type' => 'checkbox', 
								'label' => __( "Activer le paiement avec <a href=\"http://e-solutions.franfinance.com/produit/3xweb-solution-paiement-3-fois/\" target=\"_blank\">3x Web FRANFINANCE</a>.<p id=\"woocommerce_atos2_3xweb_msg\">Ce moyen de paiement nécessite un contrat spécifique avec la Société Générale. Vérifiez que <strong>FRANFINANCE_3X</strong> est bien présent dans le champ paymentMeanBrandList ci-dessus.</p>", 'atos2' ),
								'description' => __("Nécessite un contrat spécifique Société Générale.", 'atos2'),
								'default' => 'no',
								'desc_tip' => true
							),
				'authentification' => array(
								'title' => __( "Chaîne d’authentification cryptée 3x Web", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Permet l’authentification du partenaire (chaîne fournie par FRANFINANCE). Type : a=X&b=X&c=X&d=X.", 'atos2' ),
								'default' => '',
								'css' => 'width:600px',
								'desc_tip' => true
							),
				'code_personnalisation' => array(
								'title' => __( "Code de personnalisation", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Permet la personnalisation des écrans aux couleurs du partenaire, (code fourni par FRANFINANCE).", 'atos2' ),
								'default' => '',
								'css' => 'width:100px',
								'desc_tip' => true
							),
				'4xweb' => array(
								'title' => '4x Web FRANFINANCE', 
								'type' => 'checkbox', 
								'label' => __( "Activer le paiement avec <a href=\"http://e-solutions.franfinance.com/nos-solutions/\" target=\"_blank\">4x Web FRANFINANCE</a>.<p id=\"woocommerce_atos2_4xweb_msg\">Ce moyen de paiement nécessite un contrat spécifique avec la Société Générale. Vérifiez que <strong>FRANFINANCE_4X</strong> est bien présent dans le champ paymentMeanBrandList ci-dessus.</p>", 'atos2' ),
								'description' => __("Nécessite un contrat spécifique Société Générale.", 'atos2'),
								'default' => 'no',
								'desc_tip' => true
							),
				'authentification_4x' => array(
								'title' => __( "Chaîne d’authentification cryptée 4x Web", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Permet l’authentification du partenaire (chaîne fournie par FRANFINANCE). Type : a=X&b=X&c=X&d=X.", 'atos2' ),
								'default' => '',
								'css' => 'width:600px',
								'desc_tip' => true
							),
				'code_personnalisation_4x' => array(
								'title' => __( "Code de personnalisation", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Permet la personnalisation des écrans aux couleurs du partenaire, (code fourni par FRANFINANCE).", 'atos2' ),
								'default' => '',
								'css' => 'width:100px',
								'desc_tip' => true
							),
				'bypass_3DS' => array(
								'title' => __( "Seuil 3D Secure V1", 'atos2' ), 
								'type' => 'text',
								'description' => __( "Montant maximum pour lequel la procédure 3D Secure sera contournée. Exemple : 4.99. Votre contrat doit être compatible avec cette option.", 'atos2' ),
								'default' => '0',
								'css' => 'width:50px',
								'desc_tip' => true
							),
				'templateName' => array(
								'title' => "templateName", 
								'type' => 'text',
								'description' => __( "Nom du modèle de styles intégré sur le serveur de la banque pour personnaliser l’apparence de la page de paiement (sans .css).", 'atos2' ),
								'default' => '',
								'css' => 'width:400px',
								'desc_tip' => true
							),
				'bypassReceiptPage' => array(
								'title' => __( "Retour automatique", 'atos2' ), 
								'type' => 'checkbox', 
								'label' => __( "Forcer le retour du client sur la boutique après paiement (désactive la page de confirmation de la banque).", 'atos2' ), 
								'default' => 'no'
							),
				'fractionnes' => array(
								'title' => __("Paiements en plusieurs fois", 'atos2'), 
								'type' => 'multiselect', 
								'description' => __( "Ce champ liste les fractionnements disponibles pour le paiement en plusieurs fois. Une fois les réglages enregistrés, vous trouverez les méthodes de paiement correspondantes dans l'onglet Paiements de WooCommerce.", 'atos2' ),
								'options' => array ("2x"=>"Paiement en 2 fois", "3x"=>"Paiement en 3 fois", "4x"=>"Paiement en 4 fois"),
								'custom_attributes' => array( 'multiple' => 'multiple' ),
								'default' => '',
								'css' => 'width:90%',
								'desc_tip' => true,
								'class' => 'wc-enhanced-select'
							),
				'logfile' => array(
								'title' => 'logfile', 
								'type' => 'text', 
								'description' => __( "Laisser vide pour ne pas enregister de log. Le dossier de destination doit être accessible en écriture. Si le fichier n'existe pas il sera créé.", 'atos2' ),
								'default' => $dir_log.'/wc-logs/worldline-sips-2.log',
								'css' => 'width:90%',
								'desc_tip' => true
							),
				'debug' => array(
								'title' => __( 'Debug', 'atos2' ), 
								'type' => 'checkbox', 
								'label' => __( "Afficher les informations de débogage.", 'atos2' ),
								'description' => __("Ne pas activer en production.", 'atos2'),
								'default' => 'no',
								'desc_tip' => true
							)						
				);
		
		}		
		public function admin_options() {
			?>
            <p><img src="<?php echo $this->logo; ?>" /></p>
			<h2><?php _e("Paiement Wordline Sips 2.0", 'atos2'); echo "<sup>".PASSERELLE_ATOS2_VERSION."</sup>"; if(function_exists('wc_back_link')) { wc_back_link( __("Retour aux paiements", 'atos2'), admin_url('admin.php?page=wc-settings&tab=checkout') ); } ?></h2>
			<p><?php _e("Autorise les paiements par carte bancaire avec la solution <a href=\"https://sips.worldline.com/fr/home.html\" target=\"_blank\">Wordline Sips 2.0</a>. Cela nécessite la signature d'un contrat de vente à distance auprès d'une banque compatible. Vous disposerez alors des informations nécessaires au paramétrage de cette passerelle de paiement.", 'atos2'); ?></p>
            <p><?php printf(__("Consultez nos %sinstructions%s avec attention pour paramétrer votre solution de paiement Wordline Sips 2.0.", 'atos2'), '<a href="'.plugin_dir_url( __FILE__ ).'instructions-installation-parametrages.txt" target="_blank">', '</a>'); ?></p>
			<table class="form-table">
			<?php
				$this->generate_settings_html();
				$atos2_settings = get_option('woocommerce_atos2_settings');
				$javascript = "$('input#woocommerce_atos2_3xweb').change(function() {
					var moyens_selectionnes = $('#woocommerce_atos2_payment_means').select2('val');
					if ($(this).is(':checked')) {
						$('#woocommerce_atos2_3xweb_msg').show();
						$('#woocommerce_atos2_authentification').closest('tr').show();
						$('#woocommerce_atos2_code_personnalisation').closest('tr').show();
						if(!moyens_selectionnes) {
							moyens_selectionnes = new Array('FRANFINANCE_3X');
						} else {
							moyens_selectionnes.push('FRANFINANCE_3X');
						}
					} else {
						$('#woocommerce_atos2_3xweb_msg').hide();
						$('#woocommerce_atos2_authentification').closest('tr').hide();
						$('#woocommerce_atos2_code_personnalisation').closest('tr').hide();
						if(moyens_selectionnes) {
							for( var i = 0; i < moyens_selectionnes.length; i++){ 
								if ( moyens_selectionnes[i] === 'FRANFINANCE_3X') {
									moyens_selectionnes.splice(i, 1); 
								}
							}
						}
					}
					//console.log(moyens_selectionnes);
					$('#woocommerce_atos2_payment_means').val(moyens_selectionnes); // Select the option with a value of 'FRANFINANCE_3X'
					$('#woocommerce_atos2_payment_means').trigger('change'); // Notify any JS components that the value changed
				}).change();
				$('input#woocommerce_atos2_4xweb').change(function() {
					var moyens_selectionnes = $('#woocommerce_atos2_payment_means').select2('val');
					if ($(this).is(':checked')) {
						$('#woocommerce_atos2_4xweb_msg').show();
						$('#woocommerce_atos2_authentification_4x').closest('tr').show();
						$('#woocommerce_atos2_code_personnalisation_4x').closest('tr').show();
						if(!moyens_selectionnes) {
							moyens_selectionnes = new Array('FRANFINANCE_4X');
						} else {
							moyens_selectionnes.push('FRANFINANCE_4X');
						}
					} else {
						$('#woocommerce_atos2_4xweb_msg').hide();
						$('#woocommerce_atos2_authentification_4x').closest('tr').hide();
						$('#woocommerce_atos2_code_personnalisation_4x').closest('tr').hide();
						if(moyens_selectionnes) {
							for( var i = 0; i < moyens_selectionnes.length; i++){ 
								if ( moyens_selectionnes[i] === 'FRANFINANCE_4X') {
									moyens_selectionnes.splice(i, 1); 
								}
							}
						}
					}
					//console.log(moyens_selectionnes);
					$('#woocommerce_atos2_payment_means').val(moyens_selectionnes); // Select the option with a value of 'FRANFINANCE_4X'
					$('#woocommerce_atos2_payment_means').trigger('change'); // Notify any JS components that the value changed
				}).change();
				$('select#woocommerce_atos2_mode').change(function() {
					if ($(this).val()=='SIMU') {
						$('#woocommerce_atos2_simu_msg').show();
					} else {
						$('#woocommerce_atos2_simu_msg').hide();
					}
				}).change();
				$('input#woocommerce_atos2_migration').change(function() {
					if ($(this).is(':checked')) {
						$('#woocommerce_atos2_no_reference_transaction').closest('tr').hide();
					} else {
						$('#woocommerce_atos2_no_reference_transaction').closest('tr').show();
					}
				}).change();
				$('select#woocommerce_atos2_banque').change(function() {";
					if(empty($atos2_settings['no_reference_transaction'])):
					$javascript .= "if ($(this).val()=='sherlocks'||$(this).val()=='sogenactif') {
						$('#woocommerce_atos2_no_reference_transaction').prop( 'checked', true );
					} else {
						$('#woocommerce_atos2_no_reference_transaction').prop( 'checked', false );
					}";
					endif;
					$javascript .= "if($('#woocommerce_atos2_icone_standard').val()!='custom') {
                      switch($(this).val()) {
                          case 'sherlocks': 
                              $('#woocommerce_atos2_icone_standard').val( '".plugins_url('woocommerce-gateway-atos2/logo/logo-lcl-sherlocks.png')."' );
                              break;
                          case 'mercanet': 
                              $('#woocommerce_atos2_icone_standard').val( '".plugins_url('woocommerce-gateway-atos2/logo/logo-bnp-paribas.png')."' );
                              break;
                          case 'sogenactif': 
                              $('#woocommerce_atos2_icone_standard').val( '".plugins_url('woocommerce-gateway-atos2/logo/logo-societe-generale.png')."' );
                              break;
                          case 'scellius': 
                              $('#woocommerce_atos2_icone_standard').val( '".plugins_url('woocommerce-gateway-atos2/logo/logo-scellius-la-poste.png')."' );
                              break;
                          case 'atos': 
                              $('#woocommerce_atos2_icone_standard').val( '".plugins_url('woocommerce-gateway-atos2/logo/cb-visa-mastercard.png')."' );
                              break;
                      }
                      $('#woocommerce_atos2_icone_standard').trigger('change');
					}
				}).change();
				$(document).ready(function(){
					$('#woocommerce_atos2_icone_standard').parent().prepend( $( \"<span id='icone_select'></span>\" ) );
					$('#woocommerce_atos2_icone_standard').trigger('change');
 				});
				$('#woocommerce_atos2_icone_standard').change( function () {
					if($(this).val()!='custom') {
						$('#icone_select').html( $( \"<img style='display: inline-block;' src='\" + $(this).val() + \"' />\" ) );
						$('#woocommerce_atos2_gateway_image').closest('tr').hide();
					} else {
						$('#icone_select').html('');
						$('#woocommerce_atos2_gateway_image').closest('tr').show();
					}
				}).change();";
				wc_enqueue_js( $javascript );
			?>
			<?php
			echo '<tr><td colspan="2">'.__("Informations sur votre installation :",'atos2').'</td></tr>';
			echo '<tr><td>'.__("Racine Wordpress",'atos2').'</td><td><pre>'.__WPRootAtos2__.'</pre></td></tr>';
			echo '<tr><td>'.__("Racine de l'hébergement",'atos2').'</td><td><pre>'.__ServerRootAtos2__.'</pre></td></tr>';
			?>
			</table><!--/.form-table-->
			<?php
			echo '<script>
                jQuery(document).ready(function() { jQuery("#woocommerce_atos2_payment_means").select2(); jQuery("#woocommerce_atos2_fractionnes").select2(); });
            </script>';
		} 		
		function payment_fields() {
			if ($this->get_description()) echo wpautop(wptexturize($this->get_description()));
			$atos2_settings = get_option('woocommerce_atos2_settings');
			if($atos2_settings['3xweb']=='yes'){
				echo '<input type="radio" name="mode" id="3xWeb" value="3xWeb"><label for="3xWeb"> '.__("3x Web", 'atos2').'</label><br/>';
			}
			if($atos2_settings['4xweb']=='yes'){
				echo '<input type="radio" name="mode" id="4xWeb" value="4xWeb"><label for="4xWeb"> '.__("4x Web", 'atos2').'</label>';
			}
		}
		public function generate_atos2_form( $order_id ) {
			global $woocommerce, $fractionne_atos2;
			
			$atos2_settings = get_option('woocommerce_atos2_settings');
			$order = new WC_Order( (int) $order_id );
			
			require_once('class/Atos.php');
			require_once('Common/transactionIdCalculation.php');
			
			if($atos2_settings['mode']=='SIMU'):
				if($atos2_settings['migration']!='yes'): // transactionReference généré par le commerçant
					$secretKey 	= '002001000000001_KEY1';
					$merchantId = '002001000000001';
					$keyVersion = '1';
				else: // transactionId généré par le commerçant (Sherlock's 1.0)
					$secretKey 	= '002001000000003_KEY1';
					$merchantId = '002001000000003';
					$keyVersion = '1';
				endif;
				/*
				transactionReference généré par le commerçant
					ID du commerçant (merchantId) 002001000000001
					Version de la clé (keyVersion) 1
					Clé sécrète 002001000000001_KEY1 
				transactionReference généré par Sips
					ID du commerçant (merchantId) 002001000000002
					Version de la clé (keyVersion) 1
					Clé sécrète 002001000000002_KEY1 
				transactionId généré par le commerçant
					ID du commerçant (merchantId) 002001000000003
					Version de la clé (keyVersion) 1
					Clé sécrète 002001000000003_KEY1 
				transactionId généré par Sips
					ID du commerçant (merchantId) 002001000000004
					Version de la clé (keyVersion) 1
					Clé sécrète 002001000000004_KEY1
				*/
			elseif($atos2_settings['mode']=='TEST'): // Mode test à ne pas proposer au commerçant
				$keyVersion = '1';
				switch($atos2_settings['banque']):
                    case "mercanet":
                        $secretKey 	= 'S9i8qClCnb2CZU3y3Vn0toIOgz3z_aBi79akR30vM9o';
                        $merchantId = '211000021310001';
                        break;
                    case "sogenactif":
                        break;
                    case "scellius":
                        break;
                    case "sherlocks":
                    //case "sherlocks_1":
						$secretKey 	= 'mA1c6hfBFX-tk9Pi1KQzQwnq9daF8rfOtclnRaIRc20';
                        $merchantId = '099887766554433';
                        break;
                    case "atos":
                        break;
                endswitch;
			else:
				$secretKey 	= $atos2_settings['secret_key'];
				$merchantId = $atos2_settings['merchant_id'];
				$keyVersion = $atos2_settings['key_version'];
			endif;
	
    		$paymentRequest = new Atos2($secretKey);
			/*
			o   Paypage Json : https://payment-webinit.test.sips-services.com/rs-services/v2/paymentInit/
			o   Paypage Post : https://payment-webinit.test.sips-services.com/paymentInit
			o   Office Json refund  : https://office-server.test.sips-services.com/rs-services/v2/cashManagement/refund
			o   Office Json Validate : https://office-server.test.sips-services.com/rs-services/v2/cashManagement/validate
			
			Webinit :
			https://payment-webinit-sherlocks.test.sips-services.com
			https://payment-webinit-mercanet.test.sips-services.com.
			https://payment-webinit-sogenactif.test.sips-services.com.

			Office serveur:
			https://office-server-sherlocks.test.sips-services.com
			https://office-server-mercanet.test.sips-services.com
			https://office-server-sogenactif.test.sips-services.com
			*/
			/* L’URL de « test » est l’envt de recette qui permet la validation des évolutions fonctionnelles de notre serveur (ou d’un partenaire). Les transactions sont stockées en base et connectées à un faux acquéreur pour simuler les réponses Sips lors des tests de bout en bout. */
			switch($atos2_settings['mode']):
				case 'TEST': 
					$banque = ($atos2_settings['banque']!='atos' ? '-'.str_replace('_1', '', $atos2_settings['banque']) : '');
					$paymentRequest->setUrl("https://payment-webinit".$banque.".test.sips-services.com/paymentInit");
					break;
				case 'SIMU': /* L’URL de « simu » correspond à un simulateur du serveur Sips qui ne génère pas de transaction en base. */
				case 'PROD':
				case 'PRODUCTION':
					$mode = ($atos2_settings['mode']=='SIMU' ? ".simu" : "");
					switch($atos2_settings['banque']):
                        case "mercanet":
                            $paymentRequest->setUrl("https://payment-webinit".$mode.".mercanet.bnpparibas.net/paymentInit");
                            break;
                        case "sogenactif":
                            $paymentRequest->setUrl("https://payment-webinit".$mode.".sogenactif.com/paymentInit");
                            break;
                        case "scellius":
							if($mode!="") $mode = "-simu";
                            $paymentRequest->setUrl("https://payment-webinit".$mode.".scellius.labanquepostale.fr/paymentInit"); // -simu
                            break;
                        case "sherlocks":
							if($mode!="") $mode = "-simu";
                            $paymentRequest->setUrl("https://sherlocks-payment-webinit".$mode.".secure.lcl.fr/paymentInit"); // -simu
                            break;
                        //case "sherlocks_1":
                        case "atos":
                            //$paymentRequest->setUrl("https://payment-webinit.sips-atos.com/paymentInit");
                            $paymentRequest->setUrl("https://payment-webinit".$mode.".sips-services.com/paymentInit");
                            break;
                    endswitch;
			endswitch;
			
    		$paymentRequest->setMerchantId($merchantId);
    		$paymentRequest->setKeyVersion($keyVersion);
				$time = time();
                if( ( $atos2_settings['mode'] == 'SIMU' || $atos2_settings['mode'] == 'TEST' || $atos2_settings['no_reference_transaction'] != 'yes' || !empty($fractionne_atos2) ) && $atos2_settings['migration'] != 'yes' ):
                    $paymentRequest->setTransactionReference($order_id.'x'.$time);
                endif;
			if(empty($fractionne_atos2)): // Ce n'est pas du paiement fractionné
                if( $atos2_settings['migration'] == 'yes' ):
                    $s10TransactionReference = get_s10TransactionReference();
                    $paymentRequest->setS10TransactionReference($s10TransactionReference["s10TransactionId"]);
                endif;
			endif;
			if ( isset( $atos2_settings['challenge'] ) ):
				$paymentRequest->setChallengeMode3DS($atos2_settings['challenge']);
			endif;
			$paymentRequest->setOrderId($order_id);
			$order_total = $order->get_total(); // WC 3.0
			//$amount = number_format($order_total, 2, '.', '')*100;
			$amount = (int)round($order_total*100,0);
		    $paymentRequest->setAmount( (int) $amount );
			$atos2_settings['currency_code'] = apply_filters( 'atos2_change_currency_code', $atos2_settings['currency_code'] );
    		$paymentRequest->setCurrency($atos2_settings['currency_code']);
			if ( version_compare( WOOCOMMERCE_VERSION, '2.0.20', '>' ) ): /* WC 2.1 */
				$urlReturn = $order->get_checkout_order_received_url();
			else:
				$urlReturn = add_query_arg('key', $order->order_key, add_query_arg('order', $order_id, get_permalink(get_option('woocommerce_thanks_page_id'))));
			endif;
    		$paymentRequest->setNormalReturnUrl( apply_filters( 'atos2_change_normal_return_url', $urlReturn ) );        		
			/*if($atos2_settings['http']=='yes'):
				$url_retour = str_replace('https', 'http', get_bloginfo('url'));
			else:*/
				$url_retour = get_bloginfo('url');
			//endif;
			if($atos2_settings['bypassReceiptPage']=='yes'):
				$paymentRequest->bypassReceiptPage();
			endif;
			//$automatic_url = add_query_arg('wc-api', 'WC_Gateway_Atos2', trailingslashit($url_retour));
			$automatic_url = trailingslashit($url_retour).'wc-api/wc_gateway_atos2';
			$paymentRequest->setAutomaticResponseUrl($automatic_url);
			$paymentRequest->setAutomaticErrorResponseInitPost($automatic_url);
			$atos2_settings['customer_language'] = apply_filters( 'atos2_change_customer_language', $atos2_settings['customer_language'] );
			$paymentRequest->setLanguage($atos2_settings['customer_language']);
			$billing_email = is_callable( array( $order, 'get_billing_email' ) ) ? $order->get_billing_email() : $order->billing_email;
			$paymentRequest->setBillingContactEmail($billing_email);
			$billing_first_name = is_callable( array( $order, 'get_billing_first_name' ) ) ? $order->get_billing_first_name() : $order->billing_first_name;
			$paymentRequest->setBillingContactFirstname(sanitize_user($billing_first_name, true));
			$billing_last_name = is_callable( array( $order, 'get_billing_last_name' ) ) ? $order->get_billing_last_name() : $order->billing_last_name;
			$paymentRequest->setBillingContactLastname(sanitize_user($billing_last_name, true));
			$paymentRequest->setCaptureMode($atos2_settings['capture_mode']);
			$paymentRequest->setCaptureDay($atos2_settings['capture_day']);
			
			$verWoo = str_pad(str_replace('.', '', WOOCOMMERCE_VERSION), 4, "0", STR_PAD_LEFT);
			$verGateway = str_pad(str_replace('.', '', PASSERELLE_ATOS2_VERSION), 4, "0", STR_PAD_LEFT);
			$transactionOrigin = "WPWC_".$verWoo."_ABSO_".$verGateway;
			$paymentRequest->setTransactionOrigin($transactionOrigin);
			
			$paymentRequest->setSealAlgorithm("HMAC-SHA-256"); // En dur dans Atos.php
			
			//$paymentRequest->setPaymentPattern('ONE_SHOT');
			$ip_client = $_SERVER['REMOTE_ADDR'];
			$ip_client = preg_replace('/([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3}).*/', '$1.$2.$3.$4', $ip_client);	
			if(filter_var($ip_client, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)):
				$paymentRequest->setCustomerIpAddress($ip_client);
			endif;
			$contexte = $atos2_settings['return_context'];
			if($contexte=='email'):
				$return_context = $billing_email;
			elseif($contexte=='nom'):
				$return_context = sanitize_user($billing_first_name, true)." ".sanitize_user($billing_last_name, true);
			endif;
			$return_context = apply_filters( 'atos2_change_return_context', $return_context, $order ); 
			if($contexte!=''):				
				$paymentRequest->setReturnContext( $return_context );
			endif;
			if($atos2_settings['3xweb']=='yes'&&sanitize_text_field($_GET['mode'])==='3xWeb'):
				$paymentRequest->setFranfinance3xcbPageCustomizationCode($atos2_settings['code_personnalisation']);
				$paymentRequest->setFranfinance3xcbAuthenticationKey(str_replace('&amp;', '&', $atos2_settings['authentification']));
				/// On supprime 4xWeb des moyens de paiement
				if (($key = array_search('FRANFINANCE_4X', $atos2_settings['payment_means'])) !== false) {
					unset($atos2_settings['payment_means'][$key]);
				}
			endif;
			if($atos2_settings['4xweb']=='yes'&&sanitize_text_field($_GET['mode'])==='4xWeb'):
				$paymentRequest->setFranfinance4xcbPageCustomizationCode($atos2_settings['code_personnalisation_4x']);
				$paymentRequest->setFranfinance4xcbAuthenticationKey(str_replace('&amp;', '&', $atos2_settings['authentification_4x']));
				/// On supprime 3xWeb des moyens de paiement
				if (($key = array_search('FRANFINANCE_3X', $atos2_settings['payment_means'])) !== false) {
					unset($atos2_settings['payment_means'][$key]);
				}
			endif;
			if($atos2_settings['3xweb']=='yes'||$atos2_settings['4xweb']=='yes'):
				if(get_current_user_id())
					$paymentRequest->setCustomerId(get_current_user_id());
				$paymentRequest->setCustomerContactLastName(sanitize_user($billing_last_name, true));
				$paymentRequest->setCustomerContactFirstName(sanitize_user($billing_first_name, true));
				$CustomerAddressStreet = is_callable( array( $order, 'get_billing_address_1' ) ) ? $order->get_billing_address_1() : $order->billing_address_1;
				$paymentRequest->setCustomerAddressStreet(sanitize_user($CustomerAddressStreet, true));
				$CustomerAddressZipCode = is_callable( array( $order, 'get_billing_postcode' ) ) ? $order->get_billing_postcode() : $order->billing_postcode;
				$paymentRequest->setCustomerAddressZipCode(sanitize_user($CustomerAddressZipCode, true));
				$CustomerAddressCity = is_callable( array( $order, 'get_billing_city' ) ) ? $order->get_billing_city() : $order->billing_city;
				$paymentRequest->setCustomerAddressCity(sanitize_user($CustomerAddressCity, true));
				$CustomerContactPhone = is_callable( array( $order, 'get_billing_phone' ) ) ? $order->get_billing_phone() : $order->billing_phone;
				$CustomerContactPhone = preg_replace( '/[^0-9]/', '', $CustomerContactPhone );
				$indicatif_mobile = array('06','07'); 
				if(in_array(substr(trim($CustomerContactPhone), 0, 2), $indicatif_mobile)):
					$paymentRequest->setCustomerContactMobile($CustomerContactPhone);
				else:
				   	$paymentRequest->setCustomerContactPhone($CustomerContactPhone);
				endif;
			endif;
			$paymentRequest->setCustomerContactEmail($billing_email);
			$paymentRequest->setPaymentMeanBrandList($atos2_settings['payment_means']);
			if(trim($atos2_settings['bypass_3DS'])!=''&&is_numeric(trim($atos2_settings['bypass_3DS']))&&trim($atos2_settings['bypass_3DS'])>=$order_total):
				$paymentRequest->setFraudDataBypass3DS('ALL');
			endif;
			if(trim($atos2_settings['templateName'])!=''):
				$paymentRequest->setTemplateName(trim($atos2_settings['templateName']));
			endif;
			
			/* Paiement fractionné */
			if(!empty($fractionne_atos2)&&is_numeric($fractionne_atos2)):
				$paymentRequest->setPaymentPattern('INSTALMENT');
			
				add_post_meta( $order_id, '_echeances_paiement_atos2', $fractionne_atos2, true ) 
				|| update_post_meta( $order_id, '_echeances_paiement_atos2', $fractionne_atos2 );
			
				$date = array(); $montant = array(); 
                $montant[1] = number_format($order_total-($fractionne_atos2-1)*number_format($order_total/$fractionne_atos2, 2, ".", ""), 2, ".", "");
				$montant[1] = (int)round($montant[1]*100,0);
				$date_echeance = new DateTime(date('Y-m-d'));
                $date[1] 	= $date_echeance->format('Ymd');
                for($i=2;$i<=$fractionne_atos2;$i++):
                    $montant[$i] = number_format($order_total/$fractionne_atos2, 2, ".", "");
					$montant[$i] = (int)round($montant[$i]*100,0);
					$date_echeance->add(new DateInterval('P30D'));
                    $date[$i]	 = $date_echeance->format('Ymd');
                endfor;
				$montants 	= implode(',', $montant);
				$dates 		= implode(',', $date);
			
				if( $atos2_settings['migration'] == 'yes' ):
					$s10TransactionReference1	= get_s10TransactionReference();
					$s10TransactionId 			= array();
					$s10TransactionId[1]		= $s10TransactionReference1["s10TransactionId"];
					for($i=2;$i<=$fractionne_atos2;$i++):
						$s10TransactionId[$i]=(string)($s10TransactionId[1]+($i-1));
					endfor;
					$s10TransactionIds = implode(',', $s10TransactionId);
					$paymentRequest->setTransactionReference($s10TransactionId[1]);
					$paymentRequest->setInstalmentDataS10TransactionIdsList($s10TransactionIds);
				else:
					for($i=0;$i<$fractionne_atos2;$i++):
						$transactionReference[$i] = $order_id.'x'.($time+$i);
					endfor;
					$transactionReferences = implode(',', $transactionReference);
					$paymentRequest->setInstalmentDataTransactionReferencesList($transactionReferences);
				endif;
				$paymentRequest->setInstalmentDataNumber($fractionne_atos2);
				$paymentRequest->setInstalmentDataAmountsList($montants);
				$paymentRequest->setInstalmentDatesList($dates);
			else:
				delete_post_meta( $order_id, '_echeances_paiement_atos2' );
			endif;
			/**/
			$paymentRequest->validate();
	
			$Data = apply_filters( 'atos2_change_Data', $paymentRequest->toParameterString() );
			$URL = $paymentRequest->getUrl();
			$Seal = $paymentRequest->getShaSign();
    		$retour = "<form name=\"redirectForm\" method=\"POST\" action=\"" . $URL . "\">" .
		 "<input type=\"hidden\" name=\"Data\" value=\"". $Data . "\">" .
		 "<input type=\"hidden\" name=\"InterfaceVersion\" value=\"". Atos2::INTERFACE_VERSION . "\">" .
		 "<input type=\"hidden\" name=\"Seal\" value=\"" . $Seal . "\">" . 
		 "<!--noscript--><input type=\"submit\" name=\"Go\" id=\"bouton\" value=\"".__("Accéder au serveur de la banque", 'atos2')."\"/><!--/noscript--> </form>" .
		 "<!--script type=\"text/javascript\"> document.redirectForm.submit(); </script-->";
		 
			if($atos2_settings['debug']!='yes'):
				wc_enqueue_js( 'jQuery("#bouton").click();' );
			endif;
			if($atos2_settings['debug']=='yes'):
				$retour.= "<br/><fieldset><legend>&nbsp;".__("Débug mode", 'atos2')."&nbsp;</legend><pre>";
				$retour.= '&bull;&nbsp;URL='.$URL."\n";
				$Datas = explode('|', $Data);
				foreach($Datas as $ligne):
					$retour.= '&bull;&nbsp;'.$ligne."\n";
				endforeach;
				$retour.= '&bull;&nbsp;InterfaceVersion='.Atos2::INTERFACE_VERSION."\n";
				$retour.= '&bull;&nbsp;Seal='.substr($Seal,0,10).str_repeat("*",44).substr($Seal,54,10);
				$retour.= "</fieldset></pre>";
			endif;
			return $retour;
		}		
		function process_payment( $order_id ) {
			$order = new WC_Order( $order_id );
			$redirect = $order->get_checkout_payment_url( true ); /* WC 2.1 */
			$atos2_settings = get_option('woocommerce_atos2_settings');
			if(isset($_POST['mode'])&&trim($_POST['mode'])!='') { // Prise en charge des modes de paiement (3xWeb, 4xWeb)
				$redirect = add_query_arg('mode', $_POST['mode'], $redirect);
			} elseif($_POST['payment_method']=='atos2'&&($atos2_settings['3xweb']=='yes'||$atos2_settings['4xweb']=='yes')) {
				wc_add_notice( __('Veuillez préciser le moyen de paiement', 'atos2'), 'error' ); return;
			}
			return array(
				'result' 	=> 'success',
				'redirect'	=> $redirect
			);
		}
		function receipt_page( $order ) {
			
			echo '<p>'.__("Vous allez être redirigé vers le serveur sécurisé de notre banque pour effectuer le paiement. Si ce n'est pas le cas, veuillez cliquer sur le bouton ci-dessous.", 'atos2').'</p>';
			echo $this->generate_atos2_form( $order );
			
		}
		function check_atos2_response() {
			global $woocommerce, $wp;
			if (isset($wp->query_vars['wc-api']) && strtolower($wp->query_vars['wc-api']) == 'wc_gateway_atos2'): 
				if(!isset($_POST['Data'])) die("Accès à l'URL de retour de banque sans les données bancaires.");

				$data = explode('|', $_POST['Data']);
				foreach($data as $ligne):
					$var = explode('=', $ligne);
					${$var[0]} = stripslashes($var[1]);
				endforeach;
				$atos2_settings = get_option('woocommerce_atos2_settings');
			
				$logfile=$atos2_settings['logfile'];
			
				if($logfile!=""):
					$fp=fopen($logfile, "a");
					fwrite( $fp, "------------------------\n");
					if(isset($redirectionStatusCode))
						fwrite( $fp, "automaticErrorResponseInitPOST\n");
					fwrite( $fp, date('d/m/Y H:i')."\n");
					fwrite( $fp, "------------------------\n");
                    foreach($data as $ligne):
                        fwrite( $fp, $ligne."\n");
                    endforeach;
					fclose($fp);
				endif;
			
				if(isset($redirectionStatusCode)) die();
			
				require_once('class/Atos.php');
				
				if($atos2_settings['mode']=='SIMU'):
					if($atos2_settings['migration']!='yes'): // transactionReference généré par le commerçant
						$secretKey 	= '002001000000001_KEY1';
					else: // transactionId généré par le commerçant (Sherlock's 1.0)
						$secretKey = '002001000000003_KEY1';
					endif;
				elseif($atos2_settings['mode']=='TEST'):
					switch($atos2_settings['banque']):
                    case "mercanet":
                        $secretKey 	= 'S9i8qClCnb2CZU3y3Vn0toIOgz3z_aBi79akR30vM9o';
                        break;
                    case "sogenactif":
                        break;
                    case "scellius":
                        break;
                    case "sherlocks":
						$secretKey 	= 'mA1c6hfBFX-tk9Pi1KQzQwnq9daF8rfOtclnRaIRc20';
                        break;
                    case "atos":
                        break;
                endswitch;
				else:
					$secretKey 	= $atos2_settings['secret_key'];
				endif;
				$paymentResponse = new Atos2($secretKey);
				
				$paymentResponse->setResponse($_POST);
				
				set_transient('atos2_autoresponse_'.md5($orderId), 1, 300);
				set_transient('atos2_responsecode_'.md5($orderId), $responseCode, 300);
				/*
				paymentPattern=INSTALMENT
                instalmentNumber=3
                instalmentDatesList=210501;210531;210630;
                instalmentTransactionReferencesList=20210501191202;20210531191203;20210630191204;
                instalmentAmountsList=750;750;750;
				*/
				$order = new WC_Order( (int) $orderId );
				$statuts = array('processing', 'completed');
				$order_status = $order->get_status();
				if($paymentResponse->isValid() && $paymentResponse->isSuccessful()) 
				{
					if ( !in_array($order_status, apply_filters( 'atos2_change_liste_statuts_ok', $statuts)) ) {
						if($paymentPattern=="INSTALMENT"):
							$montants 	= explode(';', $instalmentAmountsList);
							$dates		= explode(';', $instalmentDatesList);
							$out 		= '';
							for($i=0;$i<$instalmentNumber;$i++) { 
								$montant	= ((int) $montants[$i])/100;
								$montant	= wc_price($montant);
								$date		= '20'.implode('-', str_split($dates[$i], 2)); // 210501 -> 2021-05-01
                                $out.=sprintf(__("%s le %s", 'atos2'), $montant, date_i18n(get_option('date_format'), strtotime($date)))."<br />";
                            }								
                            $order->add_order_note(sprintf(__("Paiement CB en %s fois confirmé.<blockquote>%s</blockquote>",'atos2'), $instalmentNumber, $out));
							$montant_initial = wc_price(((int) $montants[0])/100);
							add_post_meta( $orderId, '_encaissement_initial_atos2', $montant_initial, true ) 
								|| update_post_meta( $orderId, '_encaissement_initial_atos2', $montant_initial );
						else:
                        	$order->add_order_note(__("Paiement CB confirmé.",'atos2'));
						endif;
                        $order->payment_complete($authorisationId);
                        $woocommerce->cart->empty_cart();
					}
				}
				elseif ( !in_array($order_status, apply_filters( 'atos2_change_liste_statuts_ok', $statuts)) && $responseCode!=17 )  
				{
					$order->update_status('failed');
					switch($responseCode) {
						case "02" : $msg_err = __("Demande d’autorisation par téléphone à la banque à cause d’un dépassement du plafond d’autorisation sur la carte, si vous êtes autorisé à forcer les transactions.",'atos2'); break;
						case "03" : $msg_err = __("Contrat commerçant invalide",'atos2'); break;
						case "05" : $msg_err = __("Autorisation refusée",'atos2'); break;
						case "11" : $msg_err = __("Utilisé dans le cas d'un contrôle différé. Le PAN est en opposition",'atos2'); break;
						case "12" : $msg_err = __("Transaction invalide, vérifier les paramètres transférés dans la requête",'atos2'); break;
						case "14" : $msg_err = __("Coordonnées du moyen de paiement invalides (ex: n° de carte ou cryptogramme visuel de la carte)",'atos2'); break;
						case "17" : $msg_err = __("Annulation de l’internaute",'atos2'); break;
						case "24" : $msg_err = __("Opération impossible. L’opération que vous souhaitez réaliser n’est pas compatible avec l’état de la transaction.",'atos2'); break;
						case "25" : $msg_err = __("Transaction non trouvée dans la base de données Sips",'atos2'); break;
						case "30" : $msg_err = __("Erreur de format",'atos2'); break;
						case "34" : $msg_err = __("Suspicion de fraude",'atos2'); break;
						case "40" : $msg_err = __("Fonction non supportée : l’opération que vous souhaitez réaliser ne fait pas partie de la liste des opérations auxquelles vous êtes autorisés",'atos2'); break;
						case "51" : $msg_err = __("Montant trop élevé",'atos2'); break;
						case "54" : $msg_err = __("Date de validité du moyen de paiement est dépassée",'atos2'); break;
						case "60" : $msg_err = __("Transaction en attente",'atos2'); break;
						case "63" : $msg_err = __("Règles de sécurité non respectées, transaction arrêtée",'atos2'); break;
						case "75" : $msg_err = __("Nombre de tentatives de saisie des coordonnées du moyen de paiement dépassé",'atos2'); break;
						case "90" : $msg_err = __("Service temporairement indisponible",'atos2'); break;
						case "94" : $msg_err = __("Transaction dupliquée : le transactionReference de la transaction a déjà été utilisé",'atos2'); break;
						case "97" : $msg_err = __("Délais expiré, transation refusée",'atos2'); break;
						case "99" : $msg_err = __("Problème temporaire au niveau du serveur Sips",'atos2'); break;
						default : $msg_err = __("Erreur inconnue.",'atos2');
					}
					switch($holderAuthentStatus) {
						case "3D_FAILURE" : $msg_err =  __("Le commerçant et le porteur de la carte sont inscrits au programme d’authentification mais l’acheteur n’a pas réussi à s’authentifier (mauvais mot de passe).",'atos2'); break;
						case "3D_ERROR" : $msg_err =  __("Le commerçant participe au programme d’authentification mais le serveur a rencontré un problème technique durant le processus d’authentification (lors de la vérification de l’inscription de la carte au programme 3-D Secure ou de l’authentification du porteur).",'atos2'); break;
						case "3D_NOTENROLLED" : $msg_err =  __("Le commerçant participe au programme d'authentification mais la carte du porteur n’est pas enrôlée.",'atos2'); break;
					}
					if($acquirerResponseCode!=""&&$acquirerResponseCode!="00") {
						$msg_err .= "<br/>".__("Code réponse du serveur d'autorisation bancaire :",'atos2')." ";
						switch($acquirerResponseCode) {
							case "A1" : $msg_err .= __("Transaction refusée pour cause d'absence des données d'authentification 3-D Secure",'atos2'); break;
							case "A4" : $msg_err .= __("Transaction refusée pour cause de mauvaise utilisation de l'exemption d'authentification 3-D Secure",'atos2'); break;
							case "R1" : $msg_err .= __("Le porteur (ou sa banque) a révoqué les paiements récurrents effectués chez un commerçant",'atos2'); break;
							case "R3" : $msg_err .= __("Le porteur (ou sa banque) a révoqué tous les paiements récurrents",'atos2'); break;
							case "02" : $msg_err .= __("Contacter l'émetteur de carte.",'atos2'); break;
							case "03" : $msg_err .= __("Accepteur invalide.",'atos2'); break;
							case "04" : $msg_err .= __("Conserver la carte.",'atos2'); break;
							case "05" : $msg_err .= __("Ne pas honorer.",'atos2'); break;
							case "07" : $msg_err .= __("Conserver la carte, conditions spéciales.",'atos2'); break;
							case "08" : $msg_err .= __("Approuver après identification.",'atos2'); break;
							case "12" : $msg_err .= __("Transaction invalide.",'atos2'); break;
							case "13" : $msg_err .= __("Montant invalide.",'atos2'); break;
							case "14" : $msg_err .= __("Numéro de porteur invalide.",'atos2'); break;
							case "15" : $msg_err .= __("Emetteur de carte inconnu.",'atos2'); break;
							case "17" : $msg_err .= __("Paiement interrompu par l'acheteur",'atos2'); break;
							case "20" : $msg_err .= __("Réponse erronée (erreur dans le domaine serveur)",'atos2'); break;
							case "24" : $msg_err .= __("Opération impossible",'atos2'); break;
							case "25" : $msg_err .= __("Transaction inconnue",'atos2'); break;
							case "30" : $msg_err .= __("Erreur de format.",'atos2'); break;
							case "31" : $msg_err .= __("Identifiant de l'organisme acquéreur inconnu.",'atos2'); break;
							case "33" : $msg_err .= __("Date de validité de la carte dépassée.",'atos2'); break;
							case "34" : $msg_err .= __("Suspicion de fraude.",'atos2'); break;
							case "40" : $msg_err .= __("Fonction non supportée",'atos2'); break;
							case "41" : $msg_err .= __("Carte perdue.",'atos2'); break;
							case "43" : $msg_err .= __("Carte volée.",'atos2'); break;
							case "51" : $msg_err .= __("Provision insuffisante ou crédit dépassé.",'atos2'); break;
							case "54" : $msg_err .= __("Date de validité de la carte dépassée.",'atos2'); break;
							case "55" : $msg_err .= __("PIN invalide",'atos2'); break;
							case "56" : $msg_err .= __("Carte absente du fichier.",'atos2'); break;
							case "57" : $msg_err .= __("Transaction non permise à ce porteur.",'atos2'); break;
							case "58" : $msg_err .= __("Transaction interdite au terminal.",'atos2'); break;
							case "59" : $msg_err .= __("Suspicion de fraude.",'atos2'); break;
							case "60" : $msg_err .= __("L'accepteur de carte doit contacter l'acquéreur.",'atos2'); break;
							case "61" : $msg_err .= __("Dépasse la limite du montant de retrait.",'atos2'); break;
							case "62" : $msg_err .= __("Transaction en attente de confirmation de paiement",'atos2'); break;
							case "63" : $msg_err .= __("Règles de sécurité non respectées.",'atos2'); break;
							case "65" : $msg_err .= __("Nombre de transactions du jour dépassé",'atos2'); break;
							case "68" : $msg_err .= __("Réponse non parvenue ou reçue trop tard.",'atos2'); break;
							case "75" : $msg_err .= __("Nombre de tentatives de saisie des coordonnées du moyen de paiement dépassé",'atos2'); break;
							case "87" : $msg_err .= __("Terminal inconnu",'atos2'); break;
							case "90" : $msg_err .= __("Arrêt momentané du système.",'atos2'); break;
							case "91" : $msg_err .= __("Emetteur de cartes inaccessible.",'atos2'); break;
							case "92" : $msg_err .= __("La transaction ne contient pas les informations suffisantes pour être redirigées vers l'organisme d'autorisation",'atos2'); break;
							case "94" : $msg_err .= __("Transaction dupliquée",'atos2'); break;
							case "96" : $msg_err .= __("Mauvais fonctionnement du système.",'atos2'); break;
							case "97" : $msg_err .= __("Échéance de la temporisation de surveillance globale.",'atos2'); break;
							case "98" : $msg_err .= __("Serveur indisponible routage réseau demandé à nouveau.",'atos2'); break;
							case "99" : $msg_err .= __("Incident domaine initiateur",'atos2'); break;
							default : $msg_err .= __("Erreur inconnue",'atos2');
						}
					}			
					$order->add_order_note(__("Paiement CB : ECHEC<br/>Erreur :",'atos2').' '.$msg_err);
					$payer_url = $order->get_checkout_payment_url();
					$order->add_order_note(sprintf(__("Échec du règlement par carte bancaire de votre commande, <a href=\"%s\">cliquez ici</a> pour effectuer une nouvelle tentative de paiement.", 'atos2'), $payer_url),1); // WC 2.1
				} elseif ($responseCode==17){
					$order->add_order_note(__("Paiement CB :",'atos2').' '.__("Annulation de l’internaute",'atos2'));
				}
	
				die(); 			
				
			endif; 
		}
		
		function atos2_paiement_confirme($order, $sent_to_admin, $plain_text, $email) {
			$payment_method = $order->get_payment_method(); // WC 3.0
			// https://www.businessbloomer.com/woocommerce-add-extra-content-order-email/
			if ( $email->id == 'customer_processing_order' ) {
				switch($payment_method):
				case 'atos2':
					echo '<p>'.__("Paiement CB confirmé.",'atos2').'</p>'; break;
				case 'atos2_2x':
				case 'atos2_3x':
				case 'atos2_4x':
					$nb_echeances = get_post_meta( $order->get_id(), '_echeances_paiement_atos2', true );
					echo '<p>'.sprintf(__("Paiement CB en %d fois confirmé.",'atos2'), $nb_echeances).'</p>'; break;
				endswitch;
			}
		}
	 
	 	function new_titre_commande_recue($titre, $terminaison) {
			global $wp;
			$order_id = (int) $wp->query_vars['order-received'];
			$order = new WC_Order( $order_id );
			$payment_method = $order->get_payment_method(); // WC 3.0
			$order_status = $order->get_status(); // WC 3.0
			if ( in_array($payment_method, $this->methodes) && ($order_status == 'pending' || $order_status == 'cancelled')) {
				$autoresponse = get_transient('atos2_autoresponse_'.md5($order->get_id()));
				if( false === $autoresponse ): // Pas de transient suite à l'autoresponse, on ne peut pas affirmer que c'est un échec
					return __("Paiement en attente de confirmation", 'atos2'); // Paiement en attente de confirmation
				else:
					$responseCode = get_transient('atos2_responsecode_'.md5($order->get_id()));
					if($responseCode==17){
						return __("Paiement non reçu", "atos2");
					} else
						return __("Erreur de paiement !", "atos2");
				endif;
			} else {
				return $titre;
			}
		}
		
		function abw_txt_erreur_paiement($texte) {
			global $woocommerce;
			$order_id = (int) get_query_var('order-received');
			$order = new WC_Order( $order_id );
			$payment_method = $order->get_payment_method(); // WC 3.0
			$status = $order->get_status();
			if ( in_array($payment_method, $this->methodes) && ($status == 'pending'||$status == 'cancelled')) {
				$autoresponse = get_transient('atos2_autoresponse_'.md5($order_id));
				if( false === $autoresponse ): // Pas de transient suite à l'autoresponse, on ne peut pas affirmer que c'est un échec
					return __("Votre commande est en attente de confirmation de paiement.", 'atos2');
				else:
					$responseCode = get_transient('atos2_responsecode_'.md5($order->get_id()));
					if($responseCode==17){
						return __("Le processus de paiement par carte bancaire a été annulé.", "atos2");
					} else
						return __("Erreur de paiement ! Votre commande n'est pas validée.", 'atos2');
				endif;
			} else {
				return $texte;
			}
		}
		
		function thankyou_page() {
			global $woocommerce, $wp;
			$order_id = (int) $wp->query_vars['order-received'];
			$order = new WC_Order( $order_id );
			$statuts = array('processing', 'completed');
			$order_status = $order->get_status(); 
			if ( in_array($order_status, apply_filters( 'atos2_change_liste_statuts_ok', $statuts)) ) {
                $order_total = $order->get_total(); // WC 3.0
                $url_commande = $order->get_view_order_url();
                $montant_commande = wc_price($order_total);
				$compte_client = get_post_meta( $order_id, '_customer_user', true );
				
				$nb_echeances = get_post_meta( $order_id, '_echeances_paiement_atos2', true );
				if(!empty($nb_echeances)&&is_numeric($nb_echeances)):
					$initial = get_post_meta( $order_id, '_encaissement_initial_atos2', true );
					printf("<p>".__("Votre règlement par carte bancaire de %s sur un total de %s a été finalisé auprès de notre banque", 'atos2'), $initial, $montant_commande);
				else:
					printf("<p>".__("Votre règlement par carte bancaire de %s a bien été finalisé auprès de notre banque", 'atos2'), $montant_commande);
				endif;
				if($compte_client>0):
					printf(__(", <a href=\"%s\">cliquez ici</a> pour consulter votre commande.", 'atos2')."</p>", $url_commande);
				else:
					echo ".</p>";
				endif;
			} elseif($statuts != 'failed') {
				$autoresponse = get_transient('atos2_autoresponse_'.md5($order_id));
				if( false === $autoresponse ): // Pas de transient suite à l'autoresponse, on ne peut pas affirmer que c'est un échec
					echo "<p>".__("La banque n'a pas encore confirmé le paiement de votre commande. Vous pouvez tentez d'actualiser la page, si le paiement n'est pas confirmé, veuillez nous contacter.", 'atos2')."</p>";
				else:
					$payer_url = $order->get_checkout_payment_url();
					printf("<p>".__("Échec du règlement par carte bancaire de votre commande, <a href=\"%s\">cliquez ici</a> pour effectuer une nouvelle tentative de paiement.", 'atos2')."</p>", $payer_url); /* WC 2.1 */
				endif;
			}
		}
	}
	
	$atos2_settings = get_option('woocommerce_atos2_settings');
	if ( isset($atos2_settings['fractionnes']) && is_array($atos2_settings['fractionnes']) ):
		if (! class_exists('WC_Gateway_Atos2_2x')) {
			if( in_array('2x', $atos2_settings['fractionnes']) ) {
        		require_once 'fractionnement/class-wc-gateway-atos2-2x.php';
			}
    	}
		if (! class_exists('WC_Gateway_Atos2_3x')) {
			if( in_array('3x', $atos2_settings['fractionnes']) ) {
				require_once 'fractionnement/class-wc-gateway-atos2-3x.php';
			}
		}
		if (! class_exists('WC_Gateway_Atos2_4x')) {
			if( in_array('4x', $atos2_settings['fractionnes']) ) {
				require_once 'fractionnement/class-wc-gateway-atos2-4x.php';
			}
		}
	endif;
	
	function add_atos2_gateway( $methods ) {
		$methods[] = 'WC_Gateway_Atos2'; 
		$atos2_settings = get_option('woocommerce_atos2_settings');
		if ( isset($atos2_settings['fractionnes']) && is_array($atos2_settings['fractionnes']) ):
			if( in_array('2x', $atos2_settings['fractionnes']) ) {
				$methods[] = 'WC_Gateway_Atos2_2x';
			}
			if( in_array('3x', $atos2_settings['fractionnes']) ) {
				$methods[] = 'WC_Gateway_Atos2_3x';
			}
			if( in_array('4x', $atos2_settings['fractionnes']) ) {
				$methods[] = 'WC_Gateway_Atos2_4x';
			}	
		endif;
		return $methods;
	}
	add_filter('woocommerce_payment_gateways', 'add_atos2_gateway', 11 ); // 11 pour éviter une fatale erreur avec WC Multilingual

}

function woocommerce_gateway_atos2_add_link($links, $file) {
	if ( version_compare( WOOCOMMERCE_VERSION, '2.0.20', '>' ) ): /* WC 2.1 */
		$reglages_url = 'admin.php?page=wc-settings&tab=checkout&section=wc_gateway_atos2';
	else:
		$reglages_url = 'admin.php?page=woocommerce_settings&tab=payment_gateways&section=WC_Gateway_Atos2';
	endif;
	$links[] = '<a href="'.admin_url($reglages_url).'">' . __('Réglages','atos2') .'</a>';
	return $links;
}
add_filter('plugin_action_links_'.plugin_basename(__FILE__), 'woocommerce_gateway_atos2_add_link',  10, 2);

// Nécessaire pour que la fermeture de la notice dure x jours, sur la session ou indéfiniment
require  __DIR__ . '/vendor/persist-admin-notices-dismissal/persist-admin-notices-dismissal.php';
add_action( 'admin_init', array( 'PAnD', 'init' ) );
add_action( 'admin_notices', 'abw_expiration_prochaine_wl_sips_2' );
function abw_expiration_prochaine_wl_sips_2() {
	$dismissible = 'notice-expiration-wl-sips-2-session'; // nom-duree (nom-1 : 1 jour, nom-forever : indéfiniment, nom-session : session)
	if ( ! PAnD::is_admin_notice_active( $dismissible ) ) {
		return;
	}
	$access_expires = get_transient( 'access_expires_wl_sips_2' );
	if( !empty($access_expires) ) $strtotime_access_expires = strtotime($access_expires);
	if( !empty($access_expires) && checkdate( date('m', $strtotime_access_expires), date('d', $strtotime_access_expires), date('Y', $strtotime_access_expires) ) && $strtotime_access_expires>time() && $strtotime_access_expires<(time()+15*24*3600) ):
		$class = 'notice notice-warning is-dismissible';
		$titre = __( "Votre licence « WooCommerce Gateway Worldline Sips 2.0 » expire dans", 'atos2' )." ";
		$message = __( "Après expiration, vous ne disposerez plus, ni des mises à jour de votre passerelle WL Sips 2.0, ni du support ABSOLUTE Web.", 'atos2' );
		$bouton = sprintf( __( "Prolongez votre licence avec 50%% de réduction avant le %s !", 'atos2' ), date('d/m/Y', $strtotime_access_expires) );
		$script = '<script>var countDownDateWLS2 = new Date("'.$access_expires.'").getTime(); var xWLS2 = setInterval(function() { var maintenantWLS2 = new Date(); var nowWLS2 = maintenantWLS2.getTime(); var distanceWLS2 = countDownDateWLS2 - nowWLS2 +(maintenantWLS2.getTimezoneOffset()*60*1000); var daysWLS2 = Math.floor(distanceWLS2 / (1000 * 60 * 60 * 24)); var hoursWLS2 = Math.floor((distanceWLS2 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); var minutesWLS2 = Math.floor((distanceWLS2 % (1000 * 60 * 60)) / (1000 * 60)); var secondsWLS2 = Math.floor((distanceWLS2 % (1000 * 60)) / 1000); document.getElementById("abw_countdown_wl_sips_2").innerHTML = daysWLS2 + " jour"+(daysWLS2>1?"s":"")+ " " + (hoursWLS2>0?("0" + hoursWLS2).slice(-2):"0") + " heure"+(hoursWLS2>1?"s":"")+ " " + (minutesWLS2>0?("0" + minutesWLS2).slice(-2):"0") + " minute"+(minutesWLS2>1?"s":"")+ " et " + ("0" + secondsWLS2).slice(-2) + " seconde"+(secondsWLS2>1?"s":""); if (distanceWLS2 < 0) {  clearInterval(xWLS2); document.getElementById("abw_countdown_wl_sips_2").innerHTML = "EXPIRÉE"; } }, 1000);</script>';

		printf( '<div data-dismissible="%1$s" class="%2$s"><p><strong style="font-size:16px">%3$s<span id="abw_countdown_wl_sips_2"></span></strong></p><p>%4$s</p><p><a class="button button-primary" href="https://www.absoluteweb.net/boutique/renouveler-vos-licences/?utm_source=site_client&utm_medium=notice" target="_blank">%5$s</a></p>%6$s</div>', esc_attr( $dismissible ), esc_attr( $class ), esc_html( $titre ), esc_html( $message ), esc_html( $bouton ), $script );
	endif;
}
?>