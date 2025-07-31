'use client'

import React, { useState } from 'react'
import { Heading } from '@/shared/Heading'
import Image from 'next/image'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import { CalendarIcon, UserIcon, TagIcon, ChevronRightIcon, MagnifyingGlassIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

// Données fictives pour les cas cliniques
const casCliniques = [
  {
    id: 1,
    title: "Correction d'une Classe II avec approche neuro-musculaire",
    description: "Patient de 14 ans présentant une classe II division 1 avec surplomb important. Traitement par rééducation fonctionnelle et aligneurs.",
    category: "Classe II",
    difficulty: "Intermédiaire",
    duration: "18 mois",
    author: "Dr. Sophie Martin",
    date: "Mars 2024",
    images: {
      before: "/api/placeholder/400/300",
      after: "/api/placeholder/400/300"
    },
    tags: ["Adolescent", "Classe II", "Aligneurs", "Rééducation"],
    featured: true
  },
  {
    id: 2,
    title: "Traitement d'une asymétrie faciale complexe",
    description: "Patiente adulte de 35 ans avec asymétrie mandibulaire et troubles de l'ATM. Approche multidisciplinaire avec kinésithérapie.",
    category: "Asymétrie",
    difficulty: "Avancé",
    duration: "24 mois",
    author: "Dr. Jean-Pierre Dubois",
    date: "Février 2024",
    images: {
      before: "/api/placeholder/400/300",
      after: "/api/placeholder/400/300"
    },
    tags: ["Adulte", "ATM", "Asymétrie", "Multidisciplinaire"]
  },
  {
    id: 3,
    title: "Expansion palatine chez l'enfant",
    description: "Enfant de 8 ans avec palais étroit et respiration buccale. Traitement par expansion palatine et rééducation de la déglutition.",
    category: "Pédiatrie",
    difficulty: "Débutant",
    duration: "12 mois",
    author: "Dr. Marie Lefebvre",
    date: "Janvier 2024",
    images: {
      before: "/api/placeholder/400/300",
      after: "/api/placeholder/400/300"
    },
    tags: ["Enfant", "Expansion", "Respiration", "Déglutition"],
    featured: true
  },
  {
    id: 4,
    title: "Béance antérieure et dysfonction linguale",
    description: "Adolescente de 16 ans avec béance antérieure importante liée à une dysfonction linguale. Traitement combiné orthodontique et orthophonique.",
    category: "Béance",
    difficulty: "Intermédiaire",
    duration: "20 mois",
    author: "Dr. François Bernard",
    date: "Décembre 2023",
    images: {
      before: "/api/placeholder/400/300",
      after: "/api/placeholder/400/300"
    },
    tags: ["Adolescent", "Béance", "Langue", "Orthophonie"]
  },
  {
    id: 5,
    title: "Classe III avec compensation dento-alvéolaire",
    description: "Patient adulte de 28 ans présentant une classe III squelettique. Traitement de compensation sans chirurgie par approche neuro-musculaire.",
    category: "Classe III",
    difficulty: "Expert",
    duration: "30 mois",
    author: "Dr. Philippe Rousseau",
    date: "Novembre 2023",
    images: {
      before: "/api/placeholder/400/300",
      after: "/api/placeholder/400/300"
    },
    tags: ["Adulte", "Classe III", "Non-chirurgical", "Compensation"]
  },
  {
    id: 6,
    title: "Encombrement sévère sans extraction",
    description: "Patiente de 12 ans avec encombrement dentaire sévère. Traitement par expansion et alignement progressif sans extraction.",
    category: "Encombrement",
    difficulty: "Intermédiaire",
    duration: "22 mois",
    author: "Dr. Isabelle Petit",
    date: "Octobre 2023",
    images: {
      before: "/api/placeholder/400/300",
      after: "/api/placeholder/400/300"
    },
    tags: ["Adolescent", "Encombrement", "Sans extraction", "Expansion"]
  }
]

const categories = ["Tous", "Classe II", "Classe III", "Asymétrie", "Béance", "Pédiatrie", "Encombrement"]

export default function CasCliniquesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCases = casCliniques.filter(cas => {
    const matchCategory = selectedCategory === "Tous" || cas.category === selectedCategory
    const matchSearch = cas.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cas.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cas.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchCategory && matchSearch
  })

  return (
    <div className="nc-CasCliniquesPage">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-200 border border-indigo-500/30 backdrop-blur-sm mb-6">
              <PhotoIcon className="w-4 h-4 mr-2" />
              Résultats cliniques documentés
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Cas <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Cliniques</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Découvrez des cas réels traités avec succès grâce à l'approche 
              neuro-musculaire et ses résultats exceptionnels
            </p>
          </div>
        </div>
      </section>

      {/* Filtres et recherche */}
      <section className="py-8 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Catégories */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Recherche */}
            <div className="relative w-full lg:w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher un cas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cas mis en avant */}
      {filteredCases.filter(c => c.featured).length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Cas Remarquables
            </Heading>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {filteredCases.filter(c => c.featured).map(cas => (
                <div key={cas.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mb-3">
                        {cas.category}
                      </span>
                      <h3 className="text-2xl font-bold mb-2">{cas.title}</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">{cas.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                      <div className="absolute top-2 left-2 z-10 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                        Avant
                      </div>
                      <Image
                        src={cas.images.before}
                        alt="Avant traitement"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                      <div className="absolute top-2 left-2 z-10 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                        Après
                      </div>
                      <Image
                        src={cas.images.after}
                        alt="Après traitement"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        {cas.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {cas.duration}
                      </span>
                    </div>
                    <Link href={`/cas-cliniques/${cas.id}`}>
                      <ButtonPrimary sizeClass="px-4 py-2 sm:px-5">
                        Voir le cas complet
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </ButtonPrimary>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Liste des cas */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.filter(c => !c.featured).map(cas => (
              <div key={cas.id} className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={cas.images.after}
                    alt={cas.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/90 text-neutral-800">
                      {cas.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{cas.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                    {cas.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {cas.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                        <TagIcon className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      <span>{cas.author}</span> • <span>{cas.date}</span>
                    </div>
                    <Link href={`/cas-cliniques/${cas.id}`}>
                      <ButtonSecondary sizeClass="px-3 py-1.5 text-sm">
                        Voir plus
                      </ButtonSecondary>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Aucun cas clinique ne correspond à votre recherche.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Heading as="h2" className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Apprenez de cas réels
            </Heading>
            <p className="text-xl mb-8 text-blue-100">
              Maîtrisez l'approche neuro-musculaire à travers des cas cliniques détaillés dans nos formations
            </p>
            <Link href="/formations">
              <ButtonPrimary className="bg-white text-blue-600 hover:bg-blue-50">
                Découvrir nos formations
              </ButtonPrimary>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}