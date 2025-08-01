import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'

async function updateAdminColors() {
  console.log('🎨 Mise à jour des couleurs admin...')

  // Trouver tous les fichiers admin
  const files = await glob('src/**/admin/**/*.tsx', {
    cwd: 'D:/PRO/AI PROJETS/Masterclass-onm/chisfis-nextjs',
    absolute: true
  })

  console.log(`📁 ${files.length} fichiers trouvés`)

  const replacements = [
    // Remplacer purple par blue
    { from: /purple-(\d+)/g, to: 'blue-$1' },
    { from: /from-purple-/g, to: 'from-blue-' },
    { from: /to-purple-/g, to: 'to-blue-' },
    { from: /via-purple-/g, to: 'via-blue-' },
    { from: /bg-purple-/g, to: 'bg-blue-' },
    { from: /text-purple-/g, to: 'text-blue-' },
    { from: /border-purple-/g, to: 'border-blue-' },
    { from: /hover:bg-purple-/g, to: 'hover:bg-blue-' },
    { from: /hover:text-purple-/g, to: 'hover:text-blue-' },
    { from: /focus:ring-purple-/g, to: 'focus:ring-blue-' },
    { from: /ring-purple-/g, to: 'ring-blue-' },
    
    // Remplacer indigo par blue
    { from: /indigo-(\d+)/g, to: 'blue-$1' },
    { from: /from-indigo-/g, to: 'from-blue-' },
    { from: /to-indigo-/g, to: 'to-cyan-' },
    { from: /via-indigo-/g, to: 'via-blue-' },
    { from: /bg-indigo-/g, to: 'bg-blue-' },
    { from: /text-indigo-/g, to: 'text-blue-' },
    { from: /border-indigo-/g, to: 'border-blue-' },
    { from: /hover:bg-indigo-/g, to: 'hover:bg-blue-' },
    { from: /hover:text-indigo-/g, to: 'hover:text-blue-' },
    { from: /focus:ring-indigo-/g, to: 'focus:ring-blue-' },
    { from: /ring-indigo-/g, to: 'ring-blue-' },
    
    // Remplacer violet par blue
    { from: /violet-(\d+)/g, to: 'blue-$1' },
    { from: /from-violet-/g, to: 'from-blue-' },
    { from: /to-violet-/g, to: 'to-cyan-' },
    { from: /via-violet-/g, to: 'via-blue-' },
    { from: /bg-violet-/g, to: 'bg-blue-' },
    { from: /text-violet-/g, to: 'text-blue-' },
    { from: /border-violet-/g, to: 'border-blue-' },
    
    // Cas spéciaux pour les gradients
    { from: /from-purple-600 to-indigo-600/g, to: 'from-blue-600 to-cyan-600' },
    { from: /from-indigo-600 to-purple-600/g, to: 'from-blue-600 to-cyan-600' },
    { from: /from-purple-500 to-indigo-500/g, to: 'from-blue-500 to-cyan-500' },
    { from: /from-indigo-500 to-purple-500/g, to: 'from-blue-500 to-cyan-500' },
    { from: /from-purple-50 to-indigo-50/g, to: 'from-blue-50 to-cyan-50' },
    { from: /from-indigo-50 to-purple-50/g, to: 'from-blue-50 to-cyan-50' },
  ]

  let totalReplacements = 0

  for (const filePath of files) {
    try {
      let content = await fs.readFile(filePath, 'utf-8')
      let fileChanged = false

      for (const { from, to } of replacements) {
        const matches = content.match(from)
        if (matches) {
          content = content.replace(from, to)
          fileChanged = true
          totalReplacements += matches.length
        }
      }

      if (fileChanged) {
        await fs.writeFile(filePath, content, 'utf-8')
        console.log(`✅ ${path.basename(filePath)}`)
      }
    } catch (error) {
      console.error(`❌ Erreur avec ${filePath}:`, error)
    }
  }

  console.log(`\n🎉 Terminé ! ${totalReplacements} remplacements effectués`)
}

// Exécuter le script
updateAdminColors().catch(console.error)