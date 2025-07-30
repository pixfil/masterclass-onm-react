import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation - Initiative Immobilier',
  description: 'Conditions générales d\'utilisation du site Initiative Immobilier',
}

export default function ConditionsUtilisationPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Conditions d'utilisation
        </h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant le site Initiative Immobilier, vous acceptez d'être lié par ces conditions d'utilisation. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
          </p>

          <h2>Description du service</h2>
          <p>
            Initiative Immobilier est une plateforme en ligne qui permet :
          </p>
          <ul>
            <li>La recherche de biens immobiliers à vendre ou à louer</li>
            <li>La mise en relation entre vendeurs/bailleurs et acheteurs/locataires</li>
            <li>L'estimation de biens immobiliers</li>
            <li>La publication d'annonces immobilières</li>
          </ul>

          <h2>Utilisation autorisée</h2>
          <p>Vous vous engagez à utiliser notre site uniquement pour :</p>
          <ul>
            <li>Rechercher des biens immobiliers pour vos besoins personnels ou professionnels légitimes</li>
            <li>Publier des annonces véridiques et conformes à la réglementation</li>
            <li>Communiquer de manière respectueuse avec les autres utilisateurs</li>
          </ul>

          <h2>Utilisation interdite</h2>
          <p>Il est strictement interdit de :</p>
          <ul>
            <li>Publier des informations fausses ou trompeuses</li>
            <li>Utiliser le site à des fins illégales ou frauduleuses</li>
            <li>Harceler ou menacer d'autres utilisateurs</li>
            <li>Extraire automatiquement des données du site (scraping)</li>
            <li>Perturber le fonctionnement du site</li>
          </ul>

          <h2>Responsabilité des annonces</h2>
          <p>
            Les utilisateurs sont seuls responsables du contenu de leurs annonces. Initiative Immobilier :
          </p>
          <ul>
            <li>Ne garantit pas l'exactitude des informations publiées</li>
            <li>Se réserve le droit de modérer et supprimer les annonces non conformes</li>
            <li>N'est pas partie aux transactions entre utilisateurs</li>
          </ul>

          <h2>Propriété intellectuelle</h2>
          <p>
            Le site et son contenu (textes, images, logos, etc.) sont protégés par le droit d'auteur. 
            Toute reproduction sans autorisation est interdite.
          </p>

          <h2>Limitation de responsabilité</h2>
          <p>
            Initiative Immobilier ne peut être tenu responsable :
          </p>
          <ul>
            <li>Des dommages directs ou indirects liés à l'utilisation du site</li>
            <li>De l'indisponibilité temporaire du service</li>
            <li>Des transactions réalisées entre utilisateurs</li>
            <li>Du contenu publié par les utilisateurs</li>
          </ul>

          <h2>Données personnelles</h2>
          <p>
            Le traitement de vos données personnelles est régi par notre 
            <a href="/politique-confidentialite" className="text-primary-600 hover:text-primary-700">
              politique de confidentialité
            </a>.
          </p>

          <h2>Modification des conditions</h2>
          <p>
            Initiative Immobilier se réserve le droit de modifier ces conditions à tout moment. 
            Les utilisateurs seront informés des modifications importantes.
          </p>

          <h2>Résiliation</h2>
          <p>
            Nous nous réservons le droit de suspendre ou supprimer l'accès au site en cas de non-respect 
            de ces conditions d'utilisation.
          </p>

          <h2>Droit applicable</h2>
          <p>
            Ces conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents français.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation, contactez-nous à : 
            <a href="mailto:contact@initiative-immobilier.fr">contact@initiative-immobilier.fr</a>
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-8">
            Dernière mise à jour : 27 juillet 2025
          </p>
        </div>
      </div>
    </div>
  )
}