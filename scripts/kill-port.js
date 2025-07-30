const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

async function killNodeProcesses() {
  try {
    console.log('🔍 Recherche des processus Node.js...')
    
    // Tuer tous les processus node.exe
    try {
      await execAsync('taskkill /F /IM node.exe')
      console.log('✅ Processus Node.js terminés')
    } catch (error) {
      console.log('✅ Aucun processus Node.js en cours')
    }
    
    // Tuer aussi les processus Next.js si ils existent
    try {
      await execAsync('taskkill /F /IM "next-server.exe"')
      console.log('✅ Processus Next.js terminés')
    } catch (error) {
      // Pas grave si pas trouvé
    }
    
    // Attendre que les ports se libèrent
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('🎉 Tous les processus Node.js ont été terminés !')
    
    // Vérifier si le port est maintenant libre
    try {
      const { stdout } = await execAsync('netstat -ano | findstr :3000')
      if (stdout.trim()) {
        console.log('⚠️  Le port 3000 est encore occupé par:')
        console.log(stdout)
        
        // Essayer de tuer par port spécifiquement
        const lines = stdout.trim().split('\n')
        for (const line of lines) {
          const parts = line.trim().split(/\s+/)
          const pid = parts[parts.length - 1]
          if (pid && pid !== '0') {
            try {
              // Essayer différentes syntaxes
              await execAsync(`taskkill /F /PID ${pid}`)
              console.log(`✅ Processus PID ${pid} terminé`)
            } catch (err) {
              try {
                // Essayer avec wmic
                await execAsync(`wmic process where ProcessId=${pid} delete`)
                console.log(`✅ Processus PID ${pid} terminé via wmic`)
              } catch (err2) {
                console.log(`⚠️  Impossible de terminer PID ${pid}`)
              }
            }
          }
        }
      } else {
        console.log('✅ Port 3000 est maintenant libre')
      }
    } catch (error) {
      console.log('✅ Port 3000 est libre')
    }
    
  } catch (error) {
    console.log(`❌ Erreur générale: ${error.message}`)
  }
}

killNodeProcesses()