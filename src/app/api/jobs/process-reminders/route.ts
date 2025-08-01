import { NextRequest, NextResponse } from 'next/server'
import { ReminderWorkflowsService } from '@/lib/supabase/reminder-workflows'
import { supabase } from '@/lib/supabaseClient'

// Protection par clé API pour sécuriser l'endpoint
const CRON_SECRET_KEY = process.env.CRON_SECRET_KEY || 'your-secret-key-here'

export async function POST(request: NextRequest) {
  try {
    // Vérifier la clé secrète
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔔 Début du traitement des rappels automatiques')
    
    const startTime = Date.now()
    const results = {
      reminders_processed: 0,
      emails_sent: 0,
      notifications_sent: 0,
      errors: 0,
      inactive_users_checked: 0,
      expiring_certs_checked: 0
    }

    // 1. Traiter les rappels en attente
    console.log('📧 Traitement des rappels en attente...')
    await ReminderWorkflowsService.processReminders()
    
    // Récupérer les stats de traitement
    const { data: processedReminders } = await supabase
      .from('scheduled_reminders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('last_attempt_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Dernières 5 minutes
    
    results.reminders_processed = processedReminders?.count || 0

    // 2. Vérifier les utilisateurs inactifs (une fois par jour)
    const lastInactiveCheck = await getLastJobRun('check_inactive_users')
    if (!lastInactiveCheck || isOlderThan(lastInactiveCheck, 24 * 60)) { // 24 heures
      console.log('👥 Vérification des utilisateurs inactifs...')
      await ReminderWorkflowsService.checkInactiveUsers()
      await updateLastJobRun('check_inactive_users')
      results.inactive_users_checked = 1
    }

    // 3. Vérifier les certifications qui expirent (une fois par jour)
    const lastCertCheck = await getLastJobRun('check_expiring_certifications')
    if (!lastCertCheck || isOlderThan(lastCertCheck, 24 * 60)) { // 24 heures
      console.log('📜 Vérification des certifications qui expirent...')
      await ReminderWorkflowsService.checkExpiringCertifications()
      await updateLastJobRun('check_expiring_certifications')
      results.expiring_certs_checked = 1
    }

    // 4. Nettoyer les vieux rappels (une fois par semaine)
    const lastCleanup = await getLastJobRun('cleanup_old_reminders')
    if (!lastCleanup || isOlderThan(lastCleanup, 7 * 24 * 60)) { // 7 jours
      console.log('🧹 Nettoyage des anciens rappels...')
      await cleanupOldReminders()
      await updateLastJobRun('cleanup_old_reminders')
    }

    const duration = Date.now() - startTime
    console.log(`✅ Traitement terminé en ${duration}ms`, results)

    // Enregistrer l'exécution du job
    await supabase
      .from('cron_job_logs')
      .insert({
        job_name: 'process_reminders',
        status: 'success',
        duration_ms: duration,
        results: results,
        executed_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Rappels traités avec succès',
      results,
      duration
    })

  } catch (error) {
    console.error('❌ Erreur traitement des rappels:', error)
    
    // Enregistrer l'erreur
    await supabase
      .from('cron_job_logs')
      .insert({
        job_name: 'process_reminders',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        executed_at: new Date().toISOString()
      })

    return NextResponse.json(
      { error: 'Erreur lors du traitement des rappels' },
      { status: 500 }
    )
  }
}

// Méthode GET pour vérifier le statut
export async function GET(request: NextRequest) {
  try {
    // Vérifier la clé secrète
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Récupérer les dernières exécutions
    const { data: lastJobs } = await supabase
      .from('cron_job_logs')
      .select('*')
      .eq('job_name', 'process_reminders')
      .order('executed_at', { ascending: false })
      .limit(10)

    // Récupérer les stats actuelles
    const { data: pendingReminders } = await supabase
      .from('scheduled_reminders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())

    return NextResponse.json({
      status: 'active',
      pending_reminders: pendingReminders?.count || 0,
      last_executions: lastJobs || [],
      next_run: getNextRunTime()
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    )
  }
}

// Fonctions utilitaires
async function getLastJobRun(jobType: string): Promise<Date | null> {
  const { data } = await supabase
    .from('cron_job_metadata')
    .select('last_run')
    .eq('job_type', jobType)
    .single()
  
  return data?.last_run ? new Date(data.last_run) : null
}

async function updateLastJobRun(jobType: string): Promise<void> {
  await supabase
    .from('cron_job_metadata')
    .upsert({
      job_type: jobType,
      last_run: new Date().toISOString()
    })
}

function isOlderThan(date: Date, minutes: number): boolean {
  return Date.now() - date.getTime() > minutes * 60 * 1000
}

function getNextRunTime(): string {
  // Le job s'exécute toutes les 5 minutes
  const nextRun = new Date(Date.now() + 5 * 60 * 1000)
  return nextRun.toISOString()
}

async function cleanupOldReminders(): Promise<void> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Supprimer les rappels envoyés ou annulés de plus de 30 jours
  await supabase
    .from('scheduled_reminders')
    .delete()
    .in('status', ['sent', 'cancelled'])
    .lt('last_attempt_at', thirtyDaysAgo.toISOString())
}