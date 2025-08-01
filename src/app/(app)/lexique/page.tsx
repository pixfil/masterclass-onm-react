"use client"

import React, { useState, useEffect } from 'react'
import { Search, BookOpen, ChevronRight, Filter, X } from 'lucide-react'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import { LexiconService } from '@/lib/supabase/lexicon'
import type { LexiconEntry } from '@/lib/supabase/types/badge-types'
import ModernHeader from '@/components/Header/ModernHeader'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Link from 'next/link'

export default function LexiquePage() {
  const [entries, setEntries] = useState<LexiconEntry[]>([])
  const [featuredEntries, setFeaturedEntries] = useState<LexiconEntry[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [alphabet, setAlphabet] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLetter, setSelectedLetter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [currentPage, searchQuery, selectedCategory, selectedLetter])

  const fetchInitialData = async () => {
    const [categoriesRes, alphabetRes, featuredRes] = await Promise.all([
      LexiconService.getCategories(),
      LexiconService.getAlphabet(),
      LexiconService.getFeaturedEntries(6)
    ])
    
    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (alphabetRes.data) setAlphabet(alphabetRes.data)
    if (featuredRes.data) setFeaturedEntries(featuredRes.data)
  }

  const fetchEntries = async () => {
    setLoading(true)
    const { data, pagination } = await LexiconService.getEntries({
      query: searchQuery,
      filters: {
        category: selectedCategory || undefined,
        starts_with: selectedLetter || undefined
      },
      page: currentPage,
      limit: 20
    })
    
    if (data) {
      setEntries(data)
      setTotalPages(pagination.total_pages)
    }
    setLoading(false)
  }

  const highlightTerm = (text: string, term: string) => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, 'gi')
    return text.replace(regex, '<span class="bg-yellow-200">$1</span>')
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
              <BookOpenIcon className="w-4 h-4 mr-2" />
              Dictionnaire ONM
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Lexique <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ONM</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Découvrez et comprenez tous les termes essentiels 
              de l'orthodontie neuro-musculaire
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
          {/* Termes en vedette */}
          {featuredEntries.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Termes essentiels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/lexique/${entry.slug}`}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                      {entry.term}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {entry.definition}
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 mt-2" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-8">
            {/* Sidebar desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Filtrer par</h3>
                
                {/* Recherche */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                      }}
                      placeholder="Terme à rechercher..."
                      className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* Alphabet */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Par lettre
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    <button
                      onClick={() => {
                        setSelectedLetter('')
                        setCurrentPage(1)
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        !selectedLetter
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Tous
                    </button>
                    {alphabet.map((letter) => (
                      <button
                        key={letter}
                        onClick={() => {
                          setSelectedLetter(letter)
                          setCurrentPage(1)
                        }}
                        className={`px-2 py-1 text-xs rounded ${
                          selectedLetter === letter
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catégories */}
                {categories.length > 0 && (
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                    setSelectedLetter('')
                    setCurrentPage(1)
                  }}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1">
              {/* Bouton filtres mobile */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden mb-4 flex items-center px-4 py-2 bg-white rounded-lg shadow-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </button>

              {/* Liste des entrées */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune entrée trouvée</p>
                  <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="divide-y divide-gray-200">
                    {entries.map((entry) => (
                      <Link
                        key={entry.id}
                        href={`/lexique/${entry.slug}`}
                        className="block p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 
                              className="text-lg font-semibold text-gray-900 mb-2"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightTerm(entry.term, searchQuery) 
                              }}
                            />
                            <p 
                              className="text-gray-600 line-clamp-2"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightTerm(entry.definition, searchQuery) 
                              }}
                            />
                            {(entry.category || entry.related_terms?.length) && (
                              <div className="mt-3 flex items-center gap-4 text-sm">
                                {entry.category && (
                                  <span className="text-gray-500">
                                    Catégorie: <span className="text-gray-700">{entry.category}</span>
                                  </span>
                                )}
                                {entry.related_terms && entry.related_terms.length > 0 && (
                                  <span className="text-gray-500">
                                    Voir aussi: {entry.related_terms.slice(0, 3).join(', ')}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
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
                              ? 'bg-indigo-600 text-white'
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

          {/* Sidebar mobile */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Filtres</h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Même contenu que la sidebar desktop */}
                  <div className="space-y-6">
                    {/* Recherche */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rechercher
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                          }}
                          placeholder="Terme à rechercher..."
                          className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Alphabet */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Par lettre
                      </label>
                      <div className="grid grid-cols-5 gap-1">
                        <button
                          onClick={() => {
                            setSelectedLetter('')
                            setCurrentPage(1)
                          }}
                          className={`px-2 py-1 text-xs rounded ${
                            !selectedLetter
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Tous
                        </button>
                        {alphabet.map((letter) => (
                          <button
                            key={letter}
                            onClick={() => {
                              setSelectedLetter(letter)
                              setCurrentPage(1)
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              selectedLetter === letter
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Catégories */}
                    {categories.length > 0 && (
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                          <option value="">Toutes les catégories</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('')
                        setSelectedLetter('')
                        setCurrentPage(1)
                        setShowMobileFilters(false)
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Réinitialiser les filtres
                    </button>

                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  )
}