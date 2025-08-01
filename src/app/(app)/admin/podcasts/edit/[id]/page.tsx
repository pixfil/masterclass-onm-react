"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import PodcastForm from '@/components/admin/PodcastForm'
import { PodcastsService } from '@/lib/supabase/podcasts'
import type { PodcastEpisode } from '@/lib/supabase/types/podcast-types'

export default function EditPodcastPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEpisode()
  }, [params.id])

  const fetchEpisode = async () => {
    // Pour l'édition, on doit récupérer par ID, pas par slug
    // Ajoutons une méthode getEpisodeById dans le service
    const { data } = await PodcastsService.getEpisodeBySlug(params.id) // À remplacer par getEpisodeById
    if (data) {
      setEpisode(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!episode) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Épisode non trouvé</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Modifier l'épisode</h1>
          <p className="text-gray-600 mt-2">Modifiez les informations de l'épisode</p>
        </div>

        <PodcastForm 
          episode={episode}
          onSuccess={() => router.push('/admin/podcasts')}
          onCancel={() => router.push('/admin/podcasts')}
        />
      </div>
    </AdminLayout>
  )
}