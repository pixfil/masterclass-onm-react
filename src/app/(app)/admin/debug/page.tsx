'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useAdminRole } from '@/hooks/useAdminRole'
import { useSubscription } from '@/hooks/useSubscription'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'

const DebugContent = () => {
  const { user, loading: authLoading, isAdmin, isSuperAdmin: contextSuperAdmin } = useAuth()
  const { isSuperAdmin: hookSuperAdmin, loading: adminLoading } = useAdminRole()
  const { subscription, loading: subscriptionLoading } = useSubscription()

  if (authLoading || adminLoading || subscriptionLoading) {
    return (
      <AdminLayout currentPage="debug">
        <div>Chargement...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="debug">
      <div className="space-y-6">
        <Heading as="h1">Debug - État de l'authentification</Heading>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">Informations utilisateur</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Email:</strong> {user?.email || 'Non connecté'}
            </div>
            <div>
              <strong>ID:</strong> {user?.id || 'N/A'}
            </div>
            <div>
              <strong>Role:</strong> {user?.role || 'N/A'}
            </div>
            <div>
              <strong>isAdmin (Context):</strong> 
              <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>
                {isAdmin ? ' ✅ OUI' : ' ❌ NON'}
              </span>
            </div>
            <div>
              <strong>isSuperAdmin (Context):</strong> 
              <span className={contextSuperAdmin ? 'text-green-600' : 'text-red-600'}>
                {contextSuperAdmin ? ' ✅ OUI' : ' ❌ NON'}
              </span>
            </div>
            <div>
              <strong>isSuperAdmin (Hook):</strong> 
              <span className={hookSuperAdmin ? 'text-green-600' : 'text-red-600'}>
                {hookSuperAdmin ? ' ✅ OUI' : ' ❌ NON'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">Informations abonnement</h3>
          
          <div className="text-sm space-y-2">
            <div>
              <strong>Plan actuel:</strong> {subscription.planName || 'Aucun'}
            </div>
            <div>
              <strong>Abonnement actif:</strong> 
              <span className={subscription.isActive ? 'text-green-600' : 'text-red-600'}>
                {subscription.isActive ? ' ✅ OUI' : ' ❌ NON'}
              </span>
            </div>
            <div>
              <strong>Accès Analytics:</strong> 
              <span className={subscription.features.analytics ? 'text-green-600' : 'text-red-600'}>
                {subscription.features.analytics ? ' ✅ OUI' : ' ❌ NON'}
              </span>
            </div>
            <div>
              <strong>Accès IA:</strong> 
              <span className={subscription.features.ai ? 'text-green-600' : 'text-red-600'}>
                {subscription.features.ai ? ' ✅ OUI' : ' ❌ NON'}
              </span>
            </div>
            <div>
              <strong>Max propriétés:</strong> {subscription.features.maxProperties === -1 ? 'Illimitées' : subscription.features.maxProperties}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">Emails super admin configurés</h3>
          
          <div className="text-sm">
            <ul className="list-disc list-inside space-y-1">
              <li>philippe@initiative-immo.fr</li>
              <li>admin@initiative-immo.fr</li>
              <li>coual.philippe@gmail.com</li>
              <li className="font-bold text-blue-600">philippe@gclicke.com</li>
            </ul>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-sm">
              <strong>Votre email:</strong> {user?.email} 
              {user?.email === 'philippe@gclicke.com' ? 
                <span className="text-green-600 font-bold"> ✅ CORRESPOND</span> : 
                <span className="text-red-600 font-bold"> ❌ NE CORRESPOND PAS</span>
              }
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function DebugPage() {
  return <DebugContent />
}