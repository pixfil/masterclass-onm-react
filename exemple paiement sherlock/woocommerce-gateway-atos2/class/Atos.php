<?php

class Atos2
{
	public function setUrlTest($url)
    {
        //$this->validateUri($url);
		$this->urlTest = $url;
        //$this->parameters['automaticResponseUrl'] = $url;
    }
	public function setUrlProduction($url)
    {
        //$this->validateUri($url);
		$this->urlProduction = $url;
        //$this->parameters['automaticResponseUrl'] = $url;
    }
    //const TEST = "https://payment-webinit.simu.mercanet.bnpparibas.net/paymentInit";
    //const PRODUCTION = "https://payment-webinit.mercanet.bnpparibas.net/paymentInit";
	
    const INTERFACE_VERSION = "HP_2.22"; /* passage de 2.9 à 2.22 by Nicolas Maillard */
    const INSTALMENT = "INSTALMENT";
    
    // BYPASS3DS
    const BYPASS3DS_ALL = "ALL";
    const BYPASS3DS_MERCHANTWALLET = "MERCHANTWALLET";

    public $brandsmap = array( /* from private to public by Nicolas Maillard */ /* Card order by Nicolas Maillard */
        'MASTERCARD' => 'CARD',
		'VISA' => 'CARD',
		'CB' => 'CARD',
		'AMEX' => 'CARD',
		'PAYLIB' => 'CARD',
		'PAYPAL' => 'CARD',
		'VISA ELECTRON' => 'CARD',
		'ACCEPTGIRO' => 'CREDIT_TRANSFER',
        'BCMC' => 'CARD',
        'BUYSTER' => 'CARD',
        'BANK CARD' => 'CARD',
        'IDEAL' => 'CREDIT_TRANSFER',
        'INCASSO' => 'DIRECT_DEBIT',
        'MAESTRO' => 'CARD',
        'MASTERPASS' => 'CARD',
        'MINITIX' => 'OTHER',
        'NETBANKING' => 'CREDIT_TRANSFER',
        'REFUND' => 'OTHER',
        'SDD' => 'DIRECT_DEBIT',
        'SOFORT' => 'CREDIT_TRANSFER',
        'VPAY' => 'CARD',
        'CBCONLINE' => 'CREDIT_TRANSFER',
        'KBCONLINE' => 'CREDIT_TRANSFER',
		'FRANFINANCE_3X' => 'ONLINE_CREDIT',
		'FRANFINANCE_4X' => 'ONLINE_CREDIT',
		//'CETELEM_3X' => 'CETELEM_3X'
    );

    /** @var ShaComposer */
    private $secretKey;

    //private $pspURL = self::TEST;

    private $parameters = array();

    private $pspFields = array(
        'amount', 'currencyCode', 'merchantId', 'normalReturnUrl',
        'transactionReference', 'keyVersion', 'paymentMeanBrand', 'customerLanguage',
        'billingAddress.city', 'billingAddress.company', 'billingAddress.country',
        'billingAddress', 'billingAddress.postBox', 'billingAddress.state',
        'billingAddress.street', 'billingAddress.streetNumber', 'billingAddress.zipCode',
        'billingContact.email', 'billingContact.firstName', 'billingContact.gender',
        'billingContact.LastName', 'billingContact.mobile', 'billingContact.phone',
        'customerAddress', 'customerAddress.city', 'customerAddress.company',
        'customerAddress.country', 'customerAddress.postBox', 'customerAddress.state',
        'customerAddress.street', 'customerAddress.streetNumber', 'customerAddress.zipCode',
        'customerContact', 'customerContact.email', 'customerContact.firstname',
        'customerContact.gender', 'customerContact.lastname', 'customerContact.mobile',
        'customerContact.phone', 'customerContact.title', 'expirationDate', 'automaticResponseUrl',
        'templateName','paymentMeanBrandList', 'instalmentData.number', 'instalmentData.datesList',
	'instalmentData.transactionReferencesList', 'instalmentData.amountsList', 'paymentPattern',
	'captureDay', 'fraudData.bypass3DS', 'captureMode', 'customerIpAddress', 'returnContext',
	'paymentMeanBrandList', 'orderId', 'paypageData.bypassReceiptPage',
		'customerId', 'paymentMeanData.franfinance3xcb.pageCustomizationCode', 'paymentMeanData.franfinance3xcb.authenticationKey', 'paymentMeanData.franfinance4xcb.pageCustomizationCode', 'paymentMeanData.franfinance4xcb.authenticationKey', 'automaticErrorResponseInitPost',
		's10TransactionReference.s10TransactionId', 'fraudData.challengeMode3DS', 'transactionOrigin', 'sealAlgorithm', 'instalmentData.s10TransactionIdsList'
    );
	/* Ajouts Nicolas Maillard : captureMode, customerIpAddress, returnContext, paymentMeanBrandList, orderId, paypageData.bypassReceiptPage,
	customerId, paymentMeanData.franfinance3xcb.pageCustomizationCode, paymentMeanData.franfinance3xcb.authenticationKey, 'paymentMeanData.franfinance4xcb.pageCustomizationCode', 'paymentMeanData.franfinance4xcb.authenticationKey', 's10TransactionReference.s10TransactionId',
	'transactionOrigin', 'sealAlgorithm', 'instalmentData.s10TransactionIdsList' */
	
	/* "customerId" : "1234567","paymentMeanData.franfinance3xcb.pageCustomizationCode" : "code",
	"paymentMeanData.franfinance3xcb.authenticationKey" : "a=1YR2iYbQGac%3D&b=t7h%2BYYtg26s%3D&c=0TNJC5J%2B%2FAo%3D&d=AuNEkWGzrx4%3D",
	"customerContact.LastName" : "MARTIN","customerContact.firstName" : "Joel","customerAddress.street" : "12 rue du port",
	"customerAddress.zipCode" : "45160","customerAddress.city " : "OLIVET" */

    private $requiredFields = array(
        'amount', 'currencyCode', 'merchantId', 'normalReturnUrl', 'keyVersion'
    );
	/* Suppression Nicolas Maillard : transactionReference, obligatoire que sur certains contrats ! */

    public $allowedlanguages = array(
        'nl', 'fr', 'de', 'it', 'es', 'cy', 'en'
    );
	
	public static $currencies = array( /* from private to public by Nicolas Maillard */
        'EUR' => '978', 'USD' => '840', 'CHF' => '756', 'GBP' => '826',
        'CAD' => '124', 'JPY' => '392', 'MXP' => '484', 'TRY' => '949',
        'AUD' => '036', 'NZD' => '554', 'NOK' => '578', 'BRC' => '986',
        'ARP' => '032', 'KHR' => '116', 'TWD' => '901', 'SEK' => '752',
        'DKK' => '208', 'KRW' => '410', 'SGD' => '702', 'XPF' => '953',
        'XOF' => '952'
    );

    public static function convertCurrencyToCurrencyCode($currency)
    {
        if(!in_array($currency, array_keys(self::$currencies)))
            throw new InvalidArgumentException("Unknown currencyCode $currency.");
        return self::$currencies[$currency];
    }

    public static function convertCurrencyCodeToCurrency($code)
    {
        if(!in_array($code, array_values(self::$currencies)))
            throw new InvalidArgumentException("Unknown Code $code.");
        return array_search($code, self::$currencies);
    }

    public static function getCurrencies()
    {
        return self::$currencies;
    }

    public function __construct($secret)
    {
        $this->secretKey = $secret;
    }
	
		//This file is used to calculate the seal using the HMAC-SHA256 AND SHA256 algorithms
	public function compute_seal($hmac256, $data, $secretKey)    {
       $serverEncoding = mb_internal_encoding();

       if(strcmp($serverEncoding, "UTF-8") == 0){
          $dataUtf8 = $data;
          $secretKeyUtf8 = $secretKey;
       }else{
          $dataUtf8 = iconv($serverEncoding, "UTF-8", $data);
          $secretKeyUtf8 = iconv($serverEncoding, "UTF-8", $secretKey);
       }
       if($hmac256){
          $seal = hash_hmac('sha256', $dataUtf8, $secretKeyUtf8);
       }else{
          $seal = hash('sha256',  $data.$secretKey);
       }
       return $seal;
    }
    public function compute_seal_from_string($sealAlgorithm, $data, $secretKey)    {
       if(strcmp($sealAlgorithm, "HMAC-SHA-256") == 0){
          $hmac256 = true;
       }elseif(empty($sealAlgorithm)){
          $hmac256 = false;
       }else{
          $hmac256 = false;
       }
       return $this->compute_seal($hmac256, $data, $secretKey);
    }
	
	
	
	public function shaCompose(array $parameters)
    {
        // compose SHA string
        $shaString = '';
        foreach($parameters as $key => $value) {
            $shaString .= $key . '=' . stripslashes($value);
            //$shaString .= (array_search($key, array_keys($parameters)) != (count($parameters)-1)) ? '|' : $this->secretKey;
			$shaString .= (array_search($key, array_keys($parameters)) != (count($parameters)-1)) ? '|' : '';
        }
        //return hash('sha256', $shaString);
		return $this->compute_seal_from_string("HMAC-SHA-256", $shaString, $this->secretKey);
    }
	
    /** @return string */
    public function getShaSign()
    {
        $this->validate();
        return $this->shaCompose($this->toArray());
    }
	
	
	

    /** @return string */
    public function getUrl()
    {
        return $this->pspURL;
    }

    public function setUrl($pspUrl)
    {
        $this->validateUri($pspUrl);
        $this->pspURL = $pspUrl;
    }

    public function setNormalReturnUrl($url)
    {
        $this->validateUri($url);
        $this->parameters['normalReturnUrl'] = $url;
    }

    public function setAutomaticResponseUrl($url)
    {
        $this->validateUri($url);
        $this->parameters['automaticResponseUrl'] = $url;
    }

    public function setTransactionReference($transactionReference)
    {
        if(preg_match('/[^a-zA-Z0-9_-]/', $transactionReference)) {
            throw new \InvalidArgumentException("TransactionReference cannot contain special characters");
        }
        $this->parameters['transactionReference'] = $transactionReference;
    }

    /**
	 * Set amount in cents, eg EUR 12.34 is written as 1234
	 */
	public function setAmount($amount)
	{
		if(!is_int($amount)) {
			throw new InvalidArgumentException("Integer expected. Amount is always in cents");
		}
		if($amount <= 0) {
			throw new InvalidArgumentException("Amount must be a positive number");
		}
		$this->parameters['amount'] = $amount;

	}

    public function setCurrency($currency)
	{
		if(!array_key_exists(strtoupper($currency), self::getCurrencies())) {
			throw new InvalidArgumentException("Unknown currency");
		}
		$this->parameters['currencyCode'] = self::convertCurrencyToCurrencyCode($currency);
	}

	public function setLanguage($language)
	{
		if(!in_array($language, $this->allowedlanguages)) {
			throw new InvalidArgumentException("Invalid language locale");
		}
		$this->parameters['customerLanguage'] = $language;
	}

    public function setPaymentBrand($brand)
    {
        $this->parameters['paymentMeanBrandList'] = '';
        if(!array_key_exists(strtoupper($brand), $this->brandsmap)) {
            throw new InvalidArgumentException("Unknown Brand [$brand].");
        }
        $this->parameters['paymentMeanBrandList'] = strtoupper($brand);
    }

    public function setBillingContactEmail($email)
    {
        if(strlen($email) > 128) { // Nicolas (50)
            throw new InvalidArgumentException("Email is too long");
        }
        if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Email is invalid");
        }
        $this->parameters['billingContact.email'] = $email;
    }

    public function setBillingAddressStreet($street)
    {
        if(strlen($street) > 50) { // Nicolas (35)
            throw new InvalidArgumentException("street is too long");
        }
		if (! class_exists("Normalizer", $autoload = false))
			$this->parameters['billingAddress.street'] = $street;
		else
        	$this->parameters['billingAddress.street'] = Normalizer::normalize($street);
		
    }

    public function setBillingAddressStreetNumber($nr)
    {
        if(strlen($nr) > 10) {
            throw new InvalidArgumentException("streetNumber is too long");
        }
		if (! class_exists("Normalizer", $autoload = false))
        	$this->parameters['billingAddress.streetNumber'] = $nr;
		else
			$this->parameters['billingAddress.streetNumber'] = Normalizer::normalize($nr);
    }

    public function setBillingAddressZipCode($zipCode)
    {
        if(strlen($zipCode) > 10) {
            throw new InvalidArgumentException("zipCode is too long");
        }
		if (! class_exists("Normalizer", $autoload = false))
			$this->parameters['billingAddress.zipCode'] = $zipCode;
		else
        	$this->parameters['billingAddress.zipCode'] = Normalizer::normalize($zipCode);
		
    }

    public function setBillingAddressCity($city)
    {
        if(strlen($city) > 50) { // Nicolas (25)
            throw new InvalidArgumentException("city is too long");
        }
		if (! class_exists("Normalizer", $autoload = false))
			$this->parameters['billingAddress.city'] = $city;
		else
        	$this->parameters['billingAddress.city'] = Normalizer::normalize($city);
		
    }

    public function setBillingContactPhone($phone)
    {
        if(strlen($phone) > 30) {
            throw new InvalidArgumentException("phone is too long");
        }
        $this->parameters['billingContact.phone'] = $phone;
    }

    public function setBillingContactFirstname($firstname)
    {
		if (! class_exists("Normalizer", $autoload = false))
			$this->parameters['billingContact.firstname'] = str_replace(array("'", '"'), '', $firstname); // replace quotes
		else
			$this->parameters['billingContact.firstname'] = str_replace(array("'", '"'), '', Normalizer::normalize($firstname)); // replace quotes
    }

    public function setBillingContactLastname($lastname)
    {
        if (! class_exists("Normalizer", $autoload = false))
			$this->parameters['billingContact.lastname'] = str_replace(array("'", '"'), '', $lastname); // replace quotes
		else
			$this->parameters['billingContact.lastname'] = str_replace(array("'", '"'), '', Normalizer::normalize($lastname)); // replace quotes
    }
    
    public function setCaptureDay($number)
    {
        if (strlen($number) > 2) {
            throw new InvalidArgumentException("captureDay is too long");
        }
        $this->parameters['captureDay'] = $number;
    }
	/* Ajout Nicolas Maillard */
	// "customerContact.phone"
	public function setCustomerContactPhone($phone) {
        if(strlen($phone) > 30) {
            throw new InvalidArgumentException("phone is too long");
        }
        $this->parameters['customerContact.phone'] = $phone;
    }
	// "customerContact.mobile"
	public function setCustomerContactMobile($phone) {
        if(strlen($phone) > 30) {
            throw new InvalidArgumentException("phone is too long");
        }
        $this->parameters['customerContact.mobile'] = $phone;
    }
	// "customerAddress.city" : "OLIVET"
	public function setCustomerAddressCity($value) {
        $this->parameters['customerAddress.city'] = $value;
    }
	// "customerAddress.zipCode" : "45160"
	public function setCustomerAddressZipCode($value) {
        $this->parameters['customerAddress.zipCode'] = $value;
    }
	// "customerAddress.street" : "12 rue du port"
	public function setCustomerAddressStreet($value) {
        $this->parameters['customerAddress.street'] = $value;
    }
	// "customerContact.firstName" : "Joel"
	public function setCustomerContactFirstName($value) {
        $this->parameters['customerContact.firstName'] = $value;
    }
	// "customerContact.LastName" : "MARTIN"
	public function setCustomerContactLastName($value) {
        $this->parameters['customerContact.LastName'] = $value;
    }
	// "franfinance3xcb.authenticationKey" : "a=1YR2iYbQGac%3D&b=t7h%2BYYtg26s%3D&c=0TNJC5J%2B%2FAo%3D&d=AuNEkWGzrx4%3D"
	public function setFranfinance3xcbAuthenticationKey($value) {
        $this->parameters['paymentMeanData.franfinance3xcb.authenticationKey'] = $value;
    }
	// "franfinance3xcb.pageCustomizationCode" : "code"
	public function setFranfinance3xcbPageCustomizationCode($value) {
        $this->parameters['paymentMeanData.franfinance3xcb.pageCustomizationCode'] = $value;
    }
	// "franfinance4xcb.authenticationKey" : "a=1YR2iYbQGac%3D&b=t7h%2BYYtg26s%3D&c=0TNJC5J%2B%2FAo%3D&d=AuNEkWGzrx4%3D"
	public function setFranfinance4xcbAuthenticationKey($value) {
        $this->parameters['paymentMeanData.franfinance4xcb.authenticationKey'] = $value;
    }
	// "franfinance4xcb.pageCustomizationCode" : "code"
	public function setFranfinance4xcbPageCustomizationCode($value) {
        $this->parameters['paymentMeanData.franfinance4xcb.pageCustomizationCode'] = $value;
    }
	// "customerId" : "1234567"
	public function setCustomerId($value) {
        $this->parameters['customerId'] = $value;
    }
	public function setAutomaticErrorResponseInitPost($url) {
        $this->validateUri($url);
        $this->parameters['automaticErrorResponseInitPost'] = $url;
    }
	public function setCustomerContactEmail($value) {
        $this->parameters['customerContact.email'] = $value;
    }
	public function setCaptureMode($value) {
        $this->parameters['captureMode'] = $value;
    }
	public function setCustomerIpAddress($ip) {
		$this->parameters['customerIpAddress'] = $ip;
	}
	public function setOrderId($order) {
		$this->parameters['orderId'] = $order;
	}
	public function bypassReceiptPage() {
		$this->parameters['paypageData.bypassReceiptPage'] = 'Y';
	}
	public function setReturnContext($value) {
		if (! class_exists("Normalizer", $autoload = false))
			$this->parameters['returnContext'] = str_replace(array("'", '"'), '', $value); // replace quotes;
		else
			$this->parameters['returnContext'] = str_replace(array("'", '"'), '', Normalizer::normalize($value)); // replace quotes;
		
	}
	public function setPaymentMeanBrandList($array) {
		if(!empty($array)&&!is_array($array)) {
            throw new InvalidArgumentException("La liste des moyens de paiement n'est pas un tableau");
        }
		if(!empty($array))
			$this->parameters['paymentMeanBrandList'] = implode(',', $array);
	}
	public function setS10TransactionReference($value) {
			$this->parameters['s10TransactionReference.s10TransactionId'] = $value;
	}
	public function setChallengeMode3DS($value) {
		$challenges = array('CHALLENGE', 'CHALLENGE_MANDATE', 'NO_CHALLENGE', 'NO_CHALLENGE_TRA_ACQ', 'NO_PREFERENCE');
		if(!in_array( $value, $challenges )) {
            throw new InvalidArgumentException("La valeur du challenge 3DS2 n'est pas conforme");
        }
		$this->parameters['fraudData.challengeMode3DS'] = $value;
	}
	public function setTransactionOrigin($value) {
		if(strlen($value) > 20) {
            throw new InvalidArgumentException("transactionOrigin is too long");
        }
        $this->parameters['transactionOrigin'] = $value;
	}
	public function setSealAlgorithm($value) {
		$algos = array('HMAC-SHA-256', 'SHA-256');
		if(!in_array( $value, $algos )) {
            throw new InvalidArgumentException("L'algorithme n'est pas reconnu");
        }
        $this->parameters['sealAlgorithm'] = $value;
	}
	public function setTemplateName($value){
		$this->parameters['templateName'] = $value;
	}
	/***********/
    
    // Methodes liees a la lutte contre la fraude
    
    public function setFraudDataBypass3DS($value)
    {
	if(strlen($value) > 128) {
            throw new InvalidArgumentException("fraudData.bypass3DS is too long");
        }
        $this->parameters['fraudData.bypass3DS'] = $value;
    }
    
    // Methodes liees au paiement one-click
    
    public function setMerchantWalletId($wallet)
    {
        if(strlen($wallet) > 21) {
            throw new InvalidArgumentException("merchantWalletId is too long");
        }
        $this->parameters['merchantWalletId'] = $wallet;
    }
    
    // instalmentData.number instalmentData.datesList instalmentData.transactionReferencesList instalmentData.amountsList paymentPattern
	// instalmentData.s10TransactionIdsList
    
    // Methodes liees au paiement en n-fois
    
    public function setInstalmentDataNumber($number)
    {
        if (strlen($number) > 2) {
            throw new InvalidArgumentException("instalmentData.number is too long");
        }
	if ( ($number < 2) || ($number > 50) ) {
            throw new InvalidArgumentException("instalmentData.number invalid value : value must be set between 2 and 50");
        }
        $this->parameters['instalmentData.number'] = $number;
    }
    
    public function setInstalmentDatesList($datesList)
    {
        $this->parameters['instalmentData.datesList'] = $datesList;
    }
    
    public function setInstalmentDataTransactionReferencesList($transactionReferencesList)
    {
        $this->parameters['instalmentData.transactionReferencesList'] = $transactionReferencesList;
    }
    
    public function setInstalmentDataAmountsList($amountsList)
    {
        $this->parameters['instalmentData.amountsList'] = $amountsList;
    }
	
	public function setInstalmentDataS10TransactionIdsList($s10TransactionIdsList)
    {
        $this->parameters['instalmentData.s10TransactionIdsList'] = $s10TransactionIdsList;
    }
    
    public function setPaymentPattern($paymentPattern)
    {
        $this->parameters['paymentPattern'] = $paymentPattern;
    }

    public function __call($method, $args)
    {
        if(substr($method, 0, 3) == 'set') {
            $field = lcfirst(substr($method, 3));
            if(in_array($field, $this->pspFields)) {
                $this->parameters[$field] = $args[0];
                return;
            }
        }

        if(substr($method, 0, 3) == 'get') {
            $field = lcfirst(substr($method, 3));
            if(array_key_exists($field, $this->parameters)) {
                return $this->parameters[$field];
            }
        }

        throw new BadMethodCallException("Unknown method $method");
    }

    public function toArray()
    {
        return $this->parameters;
    }

    public function toParameterString()
    {
        $parameterString = "";
        foreach($this->parameters as $key => $value) {
            $parameterString .= $key . '=' . $value;
            $parameterString .= (array_search($key, array_keys($this->parameters)) != (count($this->parameters)-1)) ? '|' : '';
        }

        return $parameterString;
    }

    /** @return PaymentRequest */
    public static function createFromArray(ShaComposer $shaComposer, array $parameters)
    {
        $instance = new static($shaComposer);
        foreach($parameters as $key => $value)
        {
            $instance->{"set$key"}($value);
        }
        return $instance;
    }

    public function validate()
    {
        foreach($this->requiredFields as $field) {
            if(empty($this->parameters[$field])) {
                throw new \RuntimeException($field . " can not be empty");
            }
        }
    }

    protected function validateUri($uri)
    {
        if(!filter_var($uri, FILTER_VALIDATE_URL)) {
            throw new InvalidArgumentException("Uri ".$uri." is not valid");
        }
        if(strlen($uri) > 200) {
            throw new InvalidArgumentException("Uri is too long");
        }
    }
	
    // Traitement des reponses de Atos2
    // -----------------------------------
	
	/** @var string */
    const SHASIGN_FIELD = "SEAL";

    /** @var string */
    const DATA_FIELD = "DATA";

    public function setResponse(array $httpRequest)
    {
        // use lowercase internally
        $httpRequest = array_change_key_case($httpRequest, CASE_UPPER);

        // set sha sign        
        $this->shaSign = $this->extractShaSign($httpRequest);

        // filter request for Sips parameters
        $this->parameters = $this->filterRequestParameters($httpRequest);
    }
	
    /**
     * @var string
     */
    private $shaSign;

    private $dataString;
	
    /**
     * Filter http request parameters
     * @param array $requestParameters
     */
    private function filterRequestParameters(array $httpRequest)
    {
        //filter request for Sips parameters
        if(!array_key_exists(self::DATA_FIELD, $httpRequest) || $httpRequest[self::DATA_FIELD] == '') {
            throw new InvalidArgumentException('Data parameter not present in parameters.');
        }
        $parameters = array();
        $dataString = $httpRequest[self::DATA_FIELD];
        $this->dataString = $dataString;
        $dataParams = explode('|', $dataString);
        foreach($dataParams as $dataParamString) {
            $dataKeyValue = explode('=',$dataParamString,2);
            $parameters[$dataKeyValue[0]] = $dataKeyValue[1];
        }

        return $parameters;
    }

    public function getSeal()
    {
        return $this->shaSign;
    }

    private function extractShaSign(array $parameters)
    {
        if(!array_key_exists(self::SHASIGN_FIELD, $parameters) || $parameters[self::SHASIGN_FIELD] == '') {
            throw new InvalidArgumentException('SHASIGN parameter not present in parameters.');
        }
        return $parameters[self::SHASIGN_FIELD];
    }

    /**
     * Checks if the response is valid
     * @param ShaComposer $shaComposer
     * @return bool
     */
    public function isValid()
    {
        return $this->shaCompose($this->parameters) == $this->shaSign;
    }

    /**
     * Retrieves a response parameter
     * @param string $param
     * @throws \InvalidArgumentException
     */
    public function getParam($key)
    {
        if(method_exists($this, 'get'.$key)) {
            return $this->{'get'.$key}();
        }

        // always use uppercase
        $key = strtoupper($key);
        $parameters = array_change_key_case($this->parameters,CASE_UPPER);
        if(!array_key_exists($key, $parameters)) {
            throw new InvalidArgumentException('Parameter ' . $key . ' does not exist.');
        }

        return $parameters[$key];
    }

    /**
     * @return int Amount in cents
     */
    public function getAmount()
    {
        $value = trim($this->parameters['amount']);
        return (int) ($value);
    }

    public function isSuccessful()
    {
        return in_array($this->getParam('RESPONSECODE'), array("00", "60"));
    }

    public function getDataString()
    {
        return $this->dataString;
    }
}

?>
