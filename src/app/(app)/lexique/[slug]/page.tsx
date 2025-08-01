"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, BookOpen, Link as LinkIcon, Tag, Eye } from 'lucide-react'
import { LexiconService } from '@/lib/supabase/lexicon'
import type { LexiconEntry } from '@/lib/supabase/types/badge-types'
import ModernHeader from '@/components/Header/ModernHeader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LexiconDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [entry, setEntry] = useState<LexiconEntry | null>(null)
  const [relatedEntries, setRelatedEntries] = useState<LexiconEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntry()
  }, [params.slug])

  const fetchEntry = async () => {
    setLoading(true)
    const { data } = await LexiconService.getEntryBySlug(params.slug)
    
    if (data) {
      setEntry(data)
      fetchRelatedEntries(data.id)
    } else {
      router.push('/lexique')
    }
    setLoading(false)
  }

  const fetchRelatedEntries = async (entryId: string) => {
    const { data } = await LexiconService.getRelatedEntries(entryId, 5)
    if (data) setRelatedEntries(data)
  }

  if (loading) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </>
    )
  }

  if (!entry) {
    return null
  }

  return (
    <>
      <ModernHeader />
      
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/lexique"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au lexique
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {entry.term}
                </h1>

                {entry.category && (
                  <div className="mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {entry.category}
                    </span>
                  </div>
                )}

                <div className="prose prose-gray max-w-none mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Définition</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {entry.definition}
                  </p>

                  {entry.long_description && (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Description détaillée</h2>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {entry.long_description}
                      </div>
                    </>
                  )}

                  {entry.examples && entry.examples.length > 0 && (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Exemples</h2>
                      <ul className="list-disc pl-5 space-y-2">
                        {entry.examples.map((example, index) => (
                          <li key={index} className="text-gray-700">
                            {example}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Informations complémentaires */}
                <div className="border-t pt-6 mt-8">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {entry.created_at && (
                        <span>
                          Ajouté le {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {entry.view_count || 0} vues
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Images */}
              {entry.images && entry.images.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Illustrations</h3>
                  <div className="space-y-4">
                    {entry.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${entry.term} - illustration ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Références externes */}
              {entry.external_references && entry.external_references.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    <LinkIcon className="w-5 h-5 inline mr-2" />
                    Références
                  </h3>
                  <ul className="space-y-2">
                    {entry.external_references.map((ref, index) => (
                      <li key={index}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 text-sm break-all"
                        >
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    <Tag className="w-5 h-5 inline mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Termes connexes */}
              {entry.related_terms && entry.related_terms.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Termes connexes</h3>
                  <div className="space-y-2">
                    {entry.related_terms.map((term, index) => (
                      <Link
                        key={index}
                        href={`/lexique?search=${encodeURIComponent(term)}`}
                        className="block text-indigo-600 hover:text-indigo-700"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Entrées similaires */}
              {relatedEntries.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Entrées similaires</h3>
                  <div className="space-y-3">
                    {relatedEntries.map((related) => (
                      <Link
                        key={related.id}
                        href={`/lexique/${related.slug}`}
                        className="block group"
                      >
                        <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {related.term}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {related.definition}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Formations liées */}
              {entry.related_formations && entry.related_formations.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    <BookOpen className="w-5 h-5 inline mr-2" />
                    Formations associées
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Approfondissez vos connaissances sur ce sujet
                  </p>
                  <Link
                    href="/formations"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Voir les formations
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  )
}