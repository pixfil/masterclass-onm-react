import ButtonPrimary from '@/shared/ButtonPrimary'
import { Divider } from '@/shared/divider'
import T from '@/utils/getT'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compte - Paiements et versements',
  description: 'Gérez vos paiements et versements',
}

const AccountBilling = () => {
  return (
    <div>
      {/* HEADING */}
      <h1 className="text-3xl font-semibold">Paiements et versements</h1>

      <Divider className="my-8 w-14!" />

      <div className="max-w-2xl">
        <span className="block text-xl font-semibold">Méthodes de paiement</span>
        <br />
        <span className="block text-neutral-700 dark:text-neutral-300">
          Lorsque vous recevez un paiement pour une réservation, nous appelons ce paiement un "versement". 
          Notre système de paiement sécurisé prend en charge plusieurs méthodes de versement, qui peuvent être configurées ci-dessous. 
          Consultez la FAQ.
          <br />
          <br />
          Pour être payé, vous devez configurer une méthode de versement. Initiative Immobilier libère les versements environ 24 heures après l'heure d'arrivée prévue d'un client. 
          Le temps nécessaire pour que les fonds apparaissent sur votre compte dépend de votre méthode de versement. En savoir plus
        </span>
        <div className="pt-10">
          <ButtonPrimary>Ajouter une méthode de paiement</ButtonPrimary>
        </div>
      </div>
    </div>
  )
}

export default AccountBilling
