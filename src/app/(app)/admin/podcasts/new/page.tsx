"use client"

import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import PodcastForm from '@/components/admin/PodcastForm'

export default function NewPodcastPage() {
  const router = useRouter()

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nouvel épisode</h1>
          <p className="text-gray-600 mt-2">Créez un nouveau podcast, interview ou webinaire</p>
        </div>

        <PodcastForm 
          onSuccess={() => router.push('/admin/podcasts')}
          onCancel={() => router.push('/admin/podcasts')}
        />
      </div>
    </AdminLayout>
  )
}