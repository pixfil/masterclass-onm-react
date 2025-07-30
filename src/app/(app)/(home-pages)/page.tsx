import React from 'react'
import ModernHero from '@/components/hero/ModernHero'

function HomePage() {
  return (
    <div className="min-h-screen">
      <ModernHero />
      
      {/* Section de présentation */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              L'Orthodontie Neuro-Musculaire
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une approche révolutionnaire qui intègre la fonction neuro-musculaire 
              dans le traitement orthodontique pour des résultats durables et une 
              amélioration globale de la santé bucco-dentaire.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Diagnostic Précis</h3>
              <p className="text-gray-600">
                Analyse complète de la fonction neuro-musculaire pour un diagnostic précis et personnalisé.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Traitement Innovant</h3>
              <p className="text-gray-600">
                Méthodes de traitement révolutionnaires basées sur la recherche scientifique avancée.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Résultats Durables</h3>
              <p className="text-gray-600">
                Des résultats stables dans le temps grâce à une approche holistique du traitement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à révolutionner votre pratique ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez la communauté des orthodontistes formés à la méthode ONM 
            et découvrez une nouvelle approche du traitement orthodontique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/formations"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Voir nos formations
            </a>
            <a
              href="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
