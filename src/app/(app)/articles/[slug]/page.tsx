"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, User, Clock, Eye, Heart, Share2, ArrowLeft, Tag, FileText, Microscope, MessageCircle } from 'lucide-react'
import { ArticlesService } from '@/lib/supabase/articles'
import type { Article } from '@/lib/supabase/types/article-types'
import ModernHeader from '@/components/Header/ModernHeader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    fetchArticle()
  }, [params.slug])

  const fetchArticle = async () => {
    setLoading(true)
    const { data } = await ArticlesService.getArticleBySlug(params.slug)
    
    if (data) {
      setArticle(data)
      fetchRelatedArticles(data.id)
      if (user) {
        checkIfLiked(data.id)
      }
    } else {
      router.push('/articles')
    }
    setLoading(false)
  }

  const fetchRelatedArticles = async (articleId: string) => {
    const { data } = await ArticlesService.getRelatedArticles(articleId, 3)
    if (data) setRelatedArticles(data)
  }

  const checkIfLiked = async (articleId: string) => {
    const liked = await ArticlesService.hasLiked(articleId)
    setIsLiked(liked)
  }

  const handleLike = async () => {
    if (!user || !article) {
      alert('Veuillez vous connecter pour aimer cet article')
      return
    }

    const { data } = await ArticlesService.toggleLike(article.id)
    if (data !== undefined) {
      setIsLiked(data)
      // Mettre à jour le compteur localement
      setArticle({
        ...article,
        like_count: (article.like_count || 0) + (data ? 1 : -1)
      })
    }
  }

  const handleShare = async () => {
    if (!article) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || '',
          url: window.location.href
        })
      } catch (error) {
        console.error('Erreur lors du partage:', error)
      }
    } else {
      // Fallback : copier le lien
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papier!')
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !article || !comment.trim()) return

    setSubmittingComment(true)
    const { success, message } = await ArticlesService.addComment(article.id, comment)
    
    if (success) {
      setComment('')
      setShowCommentForm(false)
      alert(message || 'Commentaire envoyé')
    } else {
      alert(message || 'Erreur lors de l\'envoi')
    }
    setSubmittingComment(false)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getTypeIcon = (type: string) => {
    return type === 'case_study' ? Microscope : FileText
  }

  const getTypeLabel = (type: string) => {
    return type === 'case_study' ? 'Cas clinique' : 'Article'
  }

  const getTypeColor = (type: string) => {
    return type === 'case_study' ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100'
  }

  if (loading) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    )
  }

  if (!article) {
    return null
  }

  const TypeIcon = getTypeIcon(article.type)

  return (
    <>
      <ModernHeader />
      
      <div className="min-h-screen bg-gray-50 pt-24">
        {/* Hero avec image */}
        {article.featured_image && (
          <div className="relative h-96 bg-gray-900">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="container mx-auto max-w-4xl">
                <Link
                  href="/articles"
                  className="inline-flex items-center text-white opacity-80 hover:opacity-100 mb-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Retour aux articles
                </Link>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {article.title}
                </h1>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Méta-informations */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 -mt-16 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(article.type)}`}>
                    <TypeIcon className="w-4 h-4 mr-1" />
                    {getTypeLabel(article.type)}
                  </span>
                  
                  {article.category && (
                    <span className="text-sm text-gray-600">
                      {article.category.name}
                    </span>
                  )}
                  
                  {article.reading_time && (
                    <span className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.reading_time} min de lecture
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                      isLiked
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{article.like_count || 0}</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Partager</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  {article.author && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>Par {article.author.first_name} {article.author.last_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{article.view_count || 0} vues</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu de l'article */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              {article.excerpt && (
                <div className="text-xl text-gray-700 font-medium mb-6 pb-6 border-b border-gray-200">
                  {article.excerpt}
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>

              {/* Galerie d'images */}
              {article.gallery_images && article.gallery_images.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Galerie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {article.gallery_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${article.title} - Image ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/articles?tag=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Références */}
              {article.references && article.references.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Références</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {article.references.map((ref, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {ref}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Section commentaires */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Commentaires</h3>
                {user && (
                  <button
                    onClick={() => setShowCommentForm(!showCommentForm)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Commenter
                  </button>
                )}
              </div>

              {showCommentForm && (
                <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre avis ou votre expérience..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="flex justify-end mt-3 space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCommentForm(false)
                        setComment('')
                      }}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submittingComment ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              )}

              {!user && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Connectez-vous pour commenter cet article</p>
                  <Link
                    href="/connexion"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Se connecter
                  </Link>
                </div>
              )}
            </div>

            {/* Articles similaires */}
            {relatedArticles.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Articles similaires</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((relatedArticle) => {
                    const RelatedTypeIcon = getTypeIcon(relatedArticle.type)
                    return (
                      <Link
                        key={relatedArticle.id}
                        href={`/articles/${relatedArticle.slug}`}
                        className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {relatedArticle.featured_image ? (
                          <div className="aspect-w-16 aspect-h-9 overflow-hidden bg-gray-100">
                            <img
                              src={relatedArticle.featured_image}
                              alt={relatedArticle.title}
                              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <RelatedTypeIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getTypeColor(relatedArticle.type)}`}>
                            <RelatedTypeIcon className="w-3 h-3 mr-1" />
                            {getTypeLabel(relatedArticle.type)}
                          </span>
                          
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {relatedArticle.title}
                          </h4>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {relatedArticle.excerpt}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  )
}