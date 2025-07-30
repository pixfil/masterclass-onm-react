import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Catégorie requise' }, { status: 400 })
    }

    // Fallback vers localStorage si la base de données n'est pas disponible
    try {
      const { data, error } = await supabase
        .rpc('get_admin_settings_by_category', { p_category: category })

      if (error) {
        throw error
      }

      // Transformer en objet clé-valeur
      const settings = {}
      if (data) {
        data.forEach((item: any) => {
          // Masquer les clés sensibles
          if (item.setting_key.includes('key') || item.setting_key.includes('secret') || item.setting_key.includes('password')) {
            settings[item.setting_key] = item.setting_value ? '••••••••••••' : ''
          } else {
            settings[item.setting_key] = item.setting_value || ''
          }
        })
      }

      return NextResponse.json(settings)
    } catch (dbError) {
      console.log('Base de données non disponible, utilisation du fallback localStorage')
      
      // Fallback: retourner structure vide pour que le frontend charge depuis localStorage
      return NextResponse.json({})
    }

  } catch (error) {
    console.error('Erreur API paramètres:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { category, settings } = await request.json()

    if (!category || !settings) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Essayer de sauvegarder en base de données
    try {
      const promises = Object.entries(settings).map(([key, value]) => {
        // Ne pas sauvegarder les valeurs masquées
        if (value === '••••••••••••') {
          return Promise.resolve({ data: true, error: null })
        }

        const isEncrypted = key.includes('key') || key.includes('secret') || key.includes('password')
        
        return supabase.rpc('set_admin_setting', {
          p_category: category,
          p_key: key,
          p_value: value as string,
          p_encrypted: isEncrypted
        })
      })

      const results = await Promise.all(promises)
      const allSuccess = results.every(result => !result.error && result.data === true)

      if (!allSuccess) {
        throw new Error('Erreur lors de la sauvegarde en base')
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Paramètres sauvegardés avec succès' 
      })

    } catch (dbError) {
      console.log('Erreur base de données, fallback localStorage:', dbError)
      
      // Fallback: indiquer au frontend d'utiliser localStorage
      return NextResponse.json({ 
        success: true, 
        message: 'Paramètres sauvegardés localement',
        useLocalStorage: true
      })
    }

  } catch (error) {
    console.error('Erreur sauvegarde paramètres:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}