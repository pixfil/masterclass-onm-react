'use client'

import { useState } from 'react'
import { Textarea } from '@/shared/Textarea'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'

export default function DebugLogPage() {
  const [logContent, setLogContent] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Créer un blob avec le contenu
    const blob = new Blob([logContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    // Créer un lien de téléchargement
    const a = document.createElement('a')
    a.href = url
    a.download = `formations-debug-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleClear = () => {
    setLogContent('')
    setSaved(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Log - Formations</h1>
      
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          Colle ici le contenu de la console pour débugger les erreurs de formations.
        </p>
        
        <Textarea
          value={logContent}
          onChange={(e) => setLogContent(e.target.value)}
          placeholder="Colle ici le log de la console..."
          rows={20}
          className="font-mono text-xs"
        />
        
        <div className="flex gap-4 mt-6">
          <ButtonPrimary onClick={handleSave} disabled={!logContent.trim()}>
            Télécharger le fichier log
          </ButtonPrimary>
          
          <ButtonSecondary onClick={handleClear}>
            Effacer
          </ButtonSecondary>
          
          {saved && (
            <span className="text-green-600 dark:text-green-400 flex items-center">
              ✓ Fichier téléchargé
            </span>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions :</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            <li>Ouvre la console du navigateur (F12)</li>
            <li>Reproduis l'erreur en sauvegardant une formation</li>
            <li>Sélectionne tout le contenu de la console (Ctrl+A)</li>
            <li>Copie (Ctrl+C)</li>
            <li>Colle ici (Ctrl+V)</li>
            <li>Clique sur "Télécharger le fichier log"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}