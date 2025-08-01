<?php
class WC_Gateway_Atos2_4x extends WC_Gateway_Atos2 {	
	public function __construct() { 
        $this->id = 'atos2_4x';
        $this->order_button_text  = sprintf(__( 'Payer en %d fois par carte bancaire', 'atos2' ), 4);
        $this->method_title = 'Wordline Sips 2.0 - 4x';
        $this->method_description = sprintf(__( "Accepter les paiements en %s sur votre contrat Sogenactif, Mercanet, Sherlock's ou Wordline.", 'atos2' ), '4x'); 
        $this->logo = plugins_url('woocommerce-gateway-atos2/logo/Worldline-300x82.png');
        $this->has_fields = false;	
        $this->init_form_fields();
        $this->init_settings();
        $this->icon = apply_filters('woocommerce_atos2_4x_icon', $this->settings['gateway_image']);
        $this->title = $this->settings['title'];
        $this->description =  $this->settings['description'];
        $this->supports = array('products');
        add_action( 'woocommerce_receipt_' . $this->id, array($this, 'receipt_page') );
        add_action( 'woocommerce_update_options_payment_gateways', array(&$this, 'process_admin_options') ); 
        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
		add_action( 'woocommerce_thankyou_' . $this->id, array($this, 'thankyou_page') );
    }
	public function init_form_fields() {
		$this->form_fields = array(
				'enabled' => array(
								'title' => __( "Activer/Désactiver", 'atos2' ), 
								'type' => 'checkbox', 
								'label' => sprintf(__( "Activer le paiement %s Wordline Sips 2.0", 'atos2' ), '4x'), 
								'default' => 'no'
							), 
				'title' => array(
								'title' => __( "Titre", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Correspond au titre que le client verra pendant la commande.", 'atos2' ), 
								'default' => sprintf(__( "Carte bancaire en %d fois", 'atos2' ), 4),
								'css' => 'width:250px',
								'desc_tip' => true
							),
				'description' => array(
								'title' => __( "Message au client", 'atos2' ), 
								'type' => 'textarea', 
								'description' => __( "Informez le client du mode de paiement par carte bancaire.", 'atos2' ), 
								'default' => sprintf(__( "En choisissant ce mode de paiement vous pourrez effectuer votre règlement en %d fois sur le serveur sécurisé de notre banque.", 'atos2' ), 4),
								'desc_tip' => true
							), 
				'gateway_image' => array(
								'title' => __( "Icône de paiement", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Url de l'image affichée lors du choix du moyen de paiement.", 'atos2' ),
								'default' => plugins_url('woocommerce-gateway-atos2/logo/4x-cb-visa-mastercard.png'),
								'css' => 'width:90%',
								'desc_tip' => true
							),
				'montants_plafonds' => array(
					'title' => __( "Montants plafonds :", 'atos2' ),
					'type' => 'title'
				),
				'montant_minimum' => array(
								'title' => __( "Montant minimum", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Montant minimum nécessaire pour offrir ce mode de paiement.", 'atos2' ), 
								'default' => 100,
								'css' => 'width:150px',
								'desc_tip' => true
							), 
				'montant_maximum' => array(
								'title' => __( "Montant maximal", 'atos2' ), 
								'type' => 'text', 
								'description' => __( "Montant maximum nécessaire pour offrir ce mode de paiement.", 'atos2' ), 
								'default' => 1500,
								'css' => 'width:150px',
								'desc_tip' => true
							)
			);
	}
	public function admin_options() {
        ?>
        <p><img src="<?php echo $this->logo; ?>" /></p>
        <h2><?php _e("Paiement 4x", 'atos2'); echo " — "; _e("Wordline Sips 2.0", 'atos2'); echo "<sup>".PASSERELLE_ATOS2_VERSION."</sup>"; if(function_exists('wc_back_link')) { wc_back_link( __("Retour aux paiements", 'atos2'), admin_url('admin.php?page=wc-settings&tab=checkout') ); } ?></h2>
        <p><?php printf(__("Le mode de paiement en %d fois peut nécessiter que l'option soit activée sur votre contrat. Veuillez vous assurer auprès de Sogenactif, Mercanet, Sherlock's ou Wordline que le mode de paiement fractionné (en plusieurs fois) est bien actif.", 'atos2'), 4); ?></p>
        <p><?php printf(__("Les réglages principaux de Wordline Sips 2.0, nécessaires à l'utilisation du paiement en %d fois, sont accessibles sur la %spage de réglages%s de Wordline Sips 2.0.", 'atos2'), 4, '<a href="'.admin_url('admin.php?page=wc-settings&tab=checkout&section=atos2').'">', '</a>');  ?></p>
        <table class="form-table">
        <?php
            $this->generate_settings_html();
        ?>
        </table><!--/.form-table-->
        <?php
    }
	public function receipt_page( $order ) {
		global $fractionne_atos2;
		$fractionne_atos2 = 4; // 2, 3 ou 4
		parent::receipt_page( $order );
	}
}
if(!is_admin())
	add_filter( 'woocommerce_available_payment_gateways', 'abw_disponibilite_atos2_4x' );
function abw_disponibilite_atos2_4x( $_available_gateways ) {
	$atos2_4x = isset($_available_gateways['atos2_4x']) ? $_available_gateways['atos2_4x'] : NULL;
	if ( isset( $atos2_4x ) ) {
		$total = isset(WC()->cart->total) ? WC()->cart->total : 0;
		if (is_wc_endpoint_url( 'order-pay' )) {
			$order_id = (int) get_query_var('order-pay');
			$order = new WC_Order($order_id);
			$total = $order->get_total();
		}
    	if($atos2_4x->settings['montant_minimum']!=''&&
			$atos2_4x->settings['montant_minimum']>$total) {
			unset($_available_gateways['atos2_4x']);
		}
		if(isset($atos2_4x)&&$atos2_4x->settings['montant_maximum']!=''&&
			$atos2_4x->settings['montant_maximum']<$total) {
			unset($_available_gateways['atos2_4x']);
		}
  	}
  	return $_available_gateways;
}