'use client'

import { useState } from 'react'

export const EstimationFormSimple = () => {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto p-8">
      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
        Test formulaire - Étape {currentStep}
      </h3>
      
      <div className="space-y-4">
        <p>Si vous voyez ce texte, le composant fonctionne !</p>
        
        <button 
          onClick={() => setCurrentStep(currentStep === 1 ? 2 : 1)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Changer d'étape
        </button>
      </div>
    </div>
  )
}