'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { supabase } from '@/lib/supabaseClient'

// Données du lexique ONM
const lexiconEntries = [
  // Catégorie: Anatomie
  {
    term: "ATM",
    definition: "Articulation Temporo-Mandibulaire. Articulation complexe qui relie la mandibule au crâne, permettant les mouvements de mastication et de parole.",
    category: "Anatomie",
    related_terms: ["Condyle", "Disque articulaire", "Fosse mandibulaire"],
    is_featured: true
  },
  {
    term: "Condyle mandibulaire",
    definition: "Partie arrondie de la mandibule qui s'articule avec l'os temporal. Structure clé dans les mouvements mandibulaires.",
    category: "Anatomie",
    related_terms: ["ATM", "Mandibule", "Articulation"]
  },
  {
    term: "Disque articulaire",
    definition: "Structure fibro-cartilagineuse située entre le condyle mandibulaire et la fosse mandibulaire, permettant des mouvements fluides de l'ATM.",
    category: "Anatomie",
    related_terms: ["ATM", "Condyle", "Luxation discale"]
  },
  {
    term: "Muscles masticateurs",
    definition: "Ensemble des muscles responsables des mouvements de la mandibule : masséter, temporal, ptérygoïdiens médial et latéral.",
    category: "Anatomie",
    related_terms: ["Masséter", "Temporal", "Ptérygoïdien"],
    is_featured: true
  },
  {
    term: "Ligament temporo-mandibulaire",
    definition: "Ligament principal de l'ATM qui limite les mouvements excessifs de la mandibule et protège les structures articulaires.",
    category: "Anatomie",
    related_terms: ["ATM", "Ligaments", "Stabilité articulaire"]
  },

  // Catégorie: Diagnostic
  {
    term: "AFMP",
    definition: "Angles Fonctionnels Masticateurs de Planas. Angles formés entre le plan d'occlusion et les trajectoires des mouvements masticatoires latéraux.",
    category: "Diagnostic",
    related_terms: ["Planas", "Mastication", "Diagnostic fonctionnel"],
    is_featured: true
  },
  {
    term: "Analyse céphalométrique",
    definition: "Étude radiographique du crâne et de la face permettant d'évaluer les relations squelettiques et dentaires.",
    category: "Diagnostic",
    related_terms: ["Radiographie", "Téléradiographie", "Mesures squelettiques"]
  },
  {
    term: "Axiographie",
    definition: "Technique d'enregistrement des mouvements condyliens permettant d'analyser la cinématique mandibulaire.",
    category: "Diagnostic",
    related_terms: ["Condyle", "Mouvements mandibulaires", "Enregistrement"]
  },
  {
    term: "Électromyographie (EMG)",
    definition: "Technique d'enregistrement de l'activité électrique des muscles masticateurs pour évaluer leur fonction et leur coordination.",
    category: "Diagnostic",
    related_terms: ["Muscles masticateurs", "Activité musculaire", "Diagnostic"]
  },
  {
    term: "Pattern masticatoire",
    definition: "Schéma de mouvement caractéristique adopté par un individu lors de la mastication, pouvant être vertical, horizontal ou mixte.",
    category: "Diagnostic",
    related_terms: ["Mastication", "Fonction", "Diagnostic"],
    is_featured: true
  },

  // Catégorie: Pathologie
  {
    term: "Bruxisme",
    definition: "Parafonction caractérisée par le serrement ou le grincement involontaire des dents, souvent nocturne.",
    category: "Pathologie",
    related_terms: ["Parafonction", "Usure dentaire", "Troubles du sommeil"],
    is_featured: true
  },
  {
    term: "DCM",
    definition: "Dysfonctions Cranio-Mandibulaires. Ensemble de troubles affectant l'ATM, les muscles masticateurs et les structures associées.",
    category: "Pathologie",
    related_terms: ["ATM", "Dysfonction", "Douleur oro-faciale"],
    is_featured: true
  },
  {
    term: "Luxation discale",
    definition: "Déplacement anormal du disque articulaire de l'ATM, pouvant causer des claquements, blocages ou limitations d'ouverture.",
    category: "Pathologie",
    related_terms: ["Disque articulaire", "ATM", "Blocage"]
  },
  {
    term: "Syndrome algo-dysfonctionnel",
    definition: "Ensemble de symptômes douloureux liés à une dysfonction de l'appareil manducateur, incluant douleurs, limitations et bruits articulaires.",
    category: "Pathologie",
    related_terms: ["DCM", "Douleur", "Dysfonction"]
  },
  {
    term: "Parafonctions",
    definition: "Activités non physiologiques de l'appareil manducateur comme le bruxisme, la succion du pouce, ou l'onychophagie.",
    category: "Pathologie",
    related_terms: ["Bruxisme", "Habitudes nocives", "Dysfonction"]
  },

  // Catégorie: Traitement
  {
    term: "Gouttière occlusale",
    definition: "Dispositif amovible en résine placé sur les dents pour modifier l'occlusion, protéger les dents ou reprogrammer la fonction musculaire.",
    category: "Traitement",
    related_terms: ["Occlusion", "Protection", "Thérapeutique"],
    is_featured: true
  },
  {
    term: "Équilibration occlusale",
    definition: "Ajustement sélectif des contacts dentaires pour harmoniser l'occlusion et optimiser la fonction masticatoire.",
    category: "Traitement",
    related_terms: ["Occlusion", "Ajustement", "Fonction"]
  },
  {
    term: "Rééducation fonctionnelle",
    definition: "Ensemble de techniques visant à restaurer une fonction normale de l'appareil manducateur par des exercices et la correction des parafonctions.",
    category: "Traitement",
    related_terms: ["Kinésithérapie", "Exercices", "Fonction"],
    is_featured: true
  },
  {
    term: "Thérapie myofonctionnelle",
    definition: "Rééducation des muscles oro-faciaux pour corriger les dysfonctions linguales, labiales et les troubles de la déglutition.",
    category: "Traitement",
    related_terms: ["Orthophonie", "Déglutition", "Rééducation"]
  },
  {
    term: "Orthodontie neuro-musculaire",
    definition: "Approche orthodontique qui intègre les concepts neuro-musculaires pour obtenir une occlusion fonctionnelle optimale.",
    category: "Traitement",
    related_terms: ["ONM", "Orthodontie", "Fonction"],
    is_featured: true
  },

  // Catégorie: Concepts ONM
  {
    term: "Position de repos physiologique",
    definition: "Position mandibulaire d'équilibre neuro-musculaire où les muscles sont au repos et l'espace libre d'inocclusion est présent.",
    category: "Concepts ONM",
    related_terms: ["Repos musculaire", "Espace libre", "Équilibre"]
  },
  {
    term: "Dimension verticale d'occlusion",
    definition: "Distance entre deux points de référence (maxillaire et mandibulaire) lorsque les dents sont en occlusion d'intercuspidie maximale.",
    category: "Concepts ONM",
    related_terms: ["DVO", "Occlusion", "Hauteur faciale"]
  },
  {
    term: "Proprioception",
    definition: "Perception inconsciente de la position et des mouvements des différentes parties du corps, essentielle dans la fonction mandibulaire.",
    category: "Concepts ONM",
    related_terms: ["Sensibilité", "Contrôle moteur", "Feedback"],
    is_featured: true
  },
  {
    term: "Engramme moteur",
    definition: "Schéma de mouvement mémorisé au niveau du système nerveux central, déterminant les patterns de mastication et de fonction.",
    category: "Concepts ONM",
    related_terms: ["Mémoire motrice", "Pattern", "Neurologie"]
  },
  {
    term: "Réflexe myotatique",
    definition: "Réflexe de contraction musculaire en réponse à l'étirement, important dans le maintien du tonus des muscles masticateurs.",
    category: "Concepts ONM",
    related_terms: ["Réflexe", "Tonus musculaire", "Neurologie"]
  },

  // Catégorie: Techniques
  {
    term: "TENS",
    definition: "Transcutaneous Electrical Nerve Stimulation. Stimulation électrique transcutanée utilisée pour relaxer les muscles masticateurs.",
    category: "Techniques",
    related_terms: ["Électrothérapie", "Relaxation musculaire", "Thérapeutique"]
  },
  {
    term: "Kinésiographie",
    definition: "Technique d'enregistrement tridimensionnel des mouvements mandibulaires permettant une analyse précise de la cinématique.",
    category: "Techniques",
    related_terms: ["Enregistrement", "Mouvements", "Analyse 3D"]
  },
  {
    term: "Phonétique appliquée",
    definition: "Utilisation de sons spécifiques pour déterminer la position mandibulaire optimale et la dimension verticale.",
    category: "Techniques",
    related_terms: ["Phonation", "Position mandibulaire", "Diagnostic"]
  },
  {
    term: "Manipulation mandibulaire",
    definition: "Techniques manuelles utilisées pour guider la mandibule dans une position thérapeutique ou diagnostique.",
    category: "Techniques",
    related_terms: ["Thérapie manuelle", "Position", "Guidance"]
  },
  {
    term: "Déprogrammation",
    definition: "Processus visant à éliminer les patterns de fermeture habituels pour retrouver une position mandibulaire non contrainte.",
    category: "Techniques",
    related_terms: ["Reprogrammation", "Position de référence", "Thérapeutique"]
  }
]

const InitializeLexiconContent = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  const initializeLexicon = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    setProgress(0)

    try {
      // Vérifier si des entrées existent déjà
      const { count } = await supabase
        .from('lexicon_entries')
        .select('*', { count: 'exact', head: true })
      
      if (count && count > 0) {
        if (!confirm(`Le lexique contient déjà ${count} entrées. Voulez-vous les remplacer ?`)) {
          setMessage('Initialisation annulée.')
          setLoading(false)
          return
        }
        
        // Supprimer les entrées existantes
        const { error: deleteError } = await supabase
          .from('lexicon_entries')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')
        
        if (deleteError) {
          throw deleteError
        }
      }
      
      // Préparer les entrées avec les slugs
      const entriesToInsert = lexiconEntries.map(entry => ({
        ...entry,
        slug: entry.term
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim(),
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      // Insérer les entrées par lots
      const batchSize = 10
      let inserted = 0
      
      for (let i = 0; i < entriesToInsert.length; i += batchSize) {
        const batch = entriesToInsert.slice(i, i + batchSize)
        
        const { error } = await supabase
          .from('lexicon_entries')
          .insert(batch)
        
        if (error) {
          throw error
        }
        
        inserted += batch.length
        setProgress(Math.round((inserted / entriesToInsert.length) * 100))
      }
      
      setMessage(`✅ ${inserted} entrées ont été ajoutées au lexique ONM avec succès !`)
      
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout currentPage="lexique">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Initialisation du Lexique ONM</h1>
        
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">À propos de cette initialisation</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Cette page permet d'initialiser le lexique ONM avec {lexiconEntries.length} termes essentiels 
            répartis dans les catégories suivantes :
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {['Anatomie', 'Diagnostic', 'Pathologie', 'Traitement', 'Concepts ONM', 'Techniques'].map(cat => {
              const count = lexiconEntries.filter(e => e.category === cat).length
              return (
                <div key={cat} className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3">
                  <div className="font-medium">{cat}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{count} termes</div>
                </div>
              )
            })}
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              ⚠️ Attention : Cette action remplacera toutes les entrées existantes du lexique.
            </p>
          </div>
          
          {message && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <p className="text-green-800 dark:text-green-300">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}
          
          {loading && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Progression</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <ButtonPrimary
            onClick={initializeLexicon}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Initialisation en cours...' : 'Initialiser le lexique'}
          </ButtonPrimary>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 Une fois le lexique initialisé, vous pourrez ajouter, modifier ou supprimer des entrées 
            depuis la page de gestion du lexique.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function InitializeLexiconPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <InitializeLexiconContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}