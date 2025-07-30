import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RGPD - Initiative Immobilier',
  description: 'Informations sur la conformité RGPD d\'Initiative Immobilier',
}

export default function RGPDPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Conformité RGPD
        </h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Notre engagement RGPD</h2>
          <p>
            Initiative Immobilier s'engage à respecter le Règlement Général sur la Protection des Données (RGPD) 
            et à protéger la vie privée de nos utilisateurs.
          </p>

          <h2>Vos droits en vertu du RGPD</h2>
          
          <h3>Droit d'accès (Article 15)</h3>
          <p>
            Vous avez le droit d'obtenir confirmation que nous traitons vos données personnelles et d'accéder à ces données.
          </p>

          <h3>Droit de rectification (Article 16)</h3>
          <p>
            Vous pouvez demander la correction de données personnelles inexactes ou incomplètes.
          </p>

          <h3>Droit à l'effacement (Article 17)</h3>
          <p>
            Vous pouvez demander la suppression de vos données personnelles dans certaines circonstances.
          </p>

          <h3>Droit à la limitation du traitement (Article 18)</h3>
          <p>
            Vous pouvez demander la limitation du traitement de vos données dans certains cas.
          </p>

          <h3>Droit à la portabilité (Article 20)</h3>
          <p>
            Vous avez le droit de recevoir vos données dans un format structuré et de les transmettre à un autre responsable.
          </p>

          <h3>Droit d'opposition (Article 21)</h3>
          <p>
            Vous pouvez vous opposer au traitement de vos données, notamment pour le marketing direct.
          </p>

          <h2>Base légale des traitements</h2>
          <ul>
            <li><strong>Consentement (Article 6.1.a) :</strong> Newsletter, cookies non essentiels</li>
            <li><strong>Contrat (Article 6.1.b) :</strong> Gestion des comptes utilisateurs, transactions</li>
            <li><strong>Intérêt légitime (Article 6.1.f) :</strong> Amélioration des services, sécurité</li>
            <li><strong>Obligation légale (Article 6.1.c) :</strong> Conservation de certaines données</li>
          </ul>

          <h2>Exercer vos droits</h2>
          <p>
            Pour exercer vos droits RGPD, vous pouvez :
          </p>
          <ul>
            <li>Nous contacter par email : <a href="mailto:rgpd@initiative-immobilier.fr">rgpd@initiative-immobilier.fr</a></li>
            <li>Nous écrire à : Initiative Immobilier - Service RGPD, [Adresse]</li>
            <li>Utiliser notre formulaire de contact en précisant "Demande RGPD"</li>
          </ul>

          <h2>Délais de réponse</h2>
          <p>
            Nous nous engageons à répondre à vos demandes dans un délai d'un mois à compter de la réception. 
            Ce délai peut être prolongé de deux mois pour les demandes complexes.
          </p>

          <h2>Réclamations</h2>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de 
            la Commission Nationale de l'Informatique et des Libertés (CNIL) :
          </p>
          <ul>
            <li>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></li>
            <li>Téléphone : 01 53 73 22 22</li>
            <li>Adresse : 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</li>
          </ul>

          <h2>Transferts internationaux</h2>
          <p>
            Vos données peuvent être transférées hors de l'Union Européenne uniquement vers des pays offrant 
            un niveau de protection adéquat ou avec des garanties appropriées (clauses contractuelles types).
          </p>

          <h2>Violation de données</h2>
          <p>
            En cas de violation de données susceptible d'engendrer un risque pour vos droits et libertés, 
            nous vous en informerons dans les meilleurs délais.
          </p>

          <h2>Délégué à la Protection des Données (DPO)</h2>
          <p>
            Pour toute question relative à la protection de vos données, vous pouvez contacter notre DPO :
          </p>
          <ul>
            <li>Email : <a href="mailto:dpo@initiative-immobilier.fr">dpo@initiative-immobilier.fr</a></li>
            <li>Courrier : Initiative Immobilier - DPO, [Adresse]</li>
          </ul>

          <h2>Mises à jour</h2>
          <p>
            Cette page est régulièrement mise à jour pour refléter les évolutions de nos pratiques et de la réglementation.
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-8">
            Dernière mise à jour : 27 juillet 2025
          </p>
        </div>
      </div>
    </div>
  )
}