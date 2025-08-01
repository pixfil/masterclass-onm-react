"use client"

import React, { useState, useEffect } from 'react'
import { FileText, Microscope, Calendar, User, Eye, Heart, Clock, Filter, Search, Tag } from 'lucide-react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { ArticlesService } from '@/lib/supabase/articles'
import type { Article, ArticleCategory } from '@/lib/supabase/types/article-types'
import ModernHeader from '@/components/Header/ModernHeader'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Link from 'next/link'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState<'article' | 'case_study' | ''>('')
  const [selectedTag, setSelectedTag] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [currentPage, searchQuery, selectedCategory, selectedType, selectedTag])

  const fetchInitialData = async () => {
    const [featuredRes, categoriesRes, tagsRes] = await Promise.all([
      ArticlesService.getFeaturedArticles(3),
      ArticlesService.getCategories(),
      ArticlesService.getPopularTags(15)
    ])
    
    if (featuredRes.data) setFeaturedArticles(featuredRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (tagsRes.data) setPopularTags(tagsRes.data)
  }

  const fetchArticles = async () => {
    setLoading(true)
    const filters: any = {}
    if (selectedCategory) filters.category_id = selectedCategory
    if (selectedType) filters.type = selectedType
    if (selectedTag) filters.tags = [selectedTag]

    const { data, pagination } = await ArticlesService.getArticles({
      query: searchQuery,
      filters,
      page: currentPage,
      limit: 9
    })
    
    if (data) {
      setArticles(data)
      setTotalPages(pagination.total_pages)
    }
    setLoading(false)
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

  return (
    <>
      <ModernHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Publications scientifiques
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Articles & <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Recherche</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Découvrez les dernières avancées et partagez vos expériences 
              en orthodontie neuro-musculaire
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/formations">
                <ButtonPrimary className="w-full sm:w-auto">
                  Découvrir nos formations
                </ButtonPrimary>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Articles en vedette */}
          {featuredArticles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles en vedette</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArticles.map((article) => {
                  const TypeIcon = getTypeIcon(article.type)
                  return (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {article.featured_image && (
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden bg-gray-100">
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(article.type)}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {getTypeLabel(article.type)}
                          </span>
                          {article.category && (
                            <span className="text-xs text-gray-500">
                              {article.category.name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          {article.author && (
                            <>
                              <User className="w-4 h-4 mr-1" />
                              <span className="mr-3">{article.author.first_name} {article.author.last_name}</span>
                            </>
                          )}
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Titre, contenu..."
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value as any)
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les types</option>
                  <option value="article">Articles</option>
                  <option value="case_study">Cas cliniques</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                    setSelectedType('')
                    setSelectedTag('')
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            {/* Tags populaires */}
            {popularTags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Tags populaires</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(selectedTag === tag ? '' : tag)
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTag === tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Liste des articles */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun article trouvé</p>
              <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const TypeIcon = getTypeIcon(article.type)
                return (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {article.featured_image ? (
                      <div className="aspect-w-16 aspect-h-9 overflow-hidden bg-gray-100">
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <TypeIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(article.type)}`}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {getTypeLabel(article.type)}
                        </span>
                        {article.reading_time && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {article.reading_time} min
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      
                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs text-gray-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {article.view_count || 0}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {article.like_count || 0}
                          </span>
                        </div>
                        <span className="text-xs">
                          {formatDate(article.published_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

    </>
  )
}