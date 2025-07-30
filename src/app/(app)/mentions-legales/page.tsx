import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales - Initiative Immobilier',
  description: 'Mentions légales du site Initiative Immobilier',
}

export default function MentionsLegalesPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Mentions légales
        </h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Éditeur du site</h2>
          <p>
            <strong>Initiative Immobilier</strong><br />
            [Adresse à compléter]<br />
            [Code postal] [Ville]<br />
            Téléphone : [Numéro à compléter]<br />
            Email : contact@initiative-immobilier.fr
          </p>

          <h2>Directeur de la publication</h2>
          <p>[Nom du directeur à compléter]</p>

          <h2>Hébergement</h2>
          <p>
            Ce site est hébergé par :<br />
            [Nom de l'hébergeur]<br />
            [Adresse de l'hébergeur]
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
            Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>

          <h2>Protection des données personnelles</h2>
          <p>
            Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), 
            vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
          </p>
          <p>
            Pour exercer ces droits, vous pouvez nous contacter à l'adresse : contact@initiative-immobilier.fr
          </p>

          <h2>Cookies</h2>
          <p>
            Ce site utilise des cookies pour améliorer votre expérience de navigation. 
            En continuant à utiliser ce site, vous acceptez l'utilisation des cookies.
          </p>

          <h2>Responsabilité</h2>
          <p>
            Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année, 
            mais peut toutefois contenir des inexactitudes ou des omissions.
          </p>
        </div>
      </div>
    </div>
  )
}