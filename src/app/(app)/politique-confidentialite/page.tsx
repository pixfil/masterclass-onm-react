import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité - Initiative Immobilier',
  description: 'Politique de confidentialité et de protection des données personnelles d\'Initiative Immobilier',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Politique de confidentialité
        </h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            Initiative Immobilier s'engage à protéger votre vie privée et vos données personnelles. 
            Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
          </p>

          <h2>Données collectées</h2>
          <p>Nous collectons les types d'informations suivants :</p>
          <ul>
            <li><strong>Informations d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
            <li><strong>Informations de navigation :</strong> adresse IP, type de navigateur, pages visitées</li>
            <li><strong>Préférences de recherche :</strong> critères de recherche immobilière, favoris</li>
          </ul>

          <h2>Utilisation des données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>Vous fournir nos services immobiliers</li>
            <li>Répondre à vos demandes de contact et d'estimation</li>
            <li>Améliorer notre site web et nos services</li>
            <li>Vous envoyer des informations sur nos biens immobiliers (avec votre consentement)</li>
          </ul>

          <h2>Base légale du traitement</h2>
          <p>
            Le traitement de vos données personnelles est basé sur :
          </p>
          <ul>
            <li>Votre consentement pour les communications marketing</li>
            <li>L'exécution d'un contrat pour la fourniture de nos services</li>
            <li>Notre intérêt légitime pour améliorer nos services</li>
          </ul>

          <h2>Partage des données</h2>
          <p>
            Nous ne vendons jamais vos données personnelles. Nous pouvons les partager avec :
          </p>
          <ul>
            <li>Nos partenaires immobiliers (agences, notaires) dans le cadre de transactions</li>
            <li>Nos prestataires techniques (hébergement, analytics) sous contrat de confidentialité</li>
            <li>Les autorités légales si requis par la loi</li>
          </ul>

          <h2>Conservation des données</h2>
          <p>
            Nous conservons vos données personnelles pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :
          </p>
          <ul>
            <li>Comptes utilisateurs : 3 ans après la dernière activité</li>
            <li>Demandes de contact : 1 an après traitement</li>
            <li>Données de navigation : 13 mois maximum</li>
          </ul>

          <h2>Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
            <li><strong>Droit à l'effacement :</strong> supprimer vos données</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement</li>
            <li><strong>Droit à la portabilité :</strong> récupérer vos données</li>
          </ul>

          <h2>Sécurité</h2>
          <p>
            Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger vos données :
          </p>
          <ul>
            <li>Chiffrement des données sensibles</li>
            <li>Accès restreint aux données personnelles</li>
            <li>Surveillance et détection des intrusions</li>
            <li>Sauvegardes régulières et sécurisées</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences de cookies 
            via les paramètres de votre navigateur.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
            contactez-nous à : <a href="mailto:contact@initiative-immobilier.fr">contact@initiative-immobilier.fr</a>
          </p>

          <h2>Modifications</h2>
          <p>
            Cette politique peut être mise à jour. La version actuelle est datée du 27 juillet 2025.
          </p>
        </div>
      </div>
    </div>
  )
}