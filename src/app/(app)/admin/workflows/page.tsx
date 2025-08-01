"use client"

import React, { useState, useEffect } from 'react'
import { Bell, Clock, Mail, ToggleLeft, ToggleRight, Zap, Calendar, RefreshCw, Play, Pause } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ReminderWorkflowsService } from '@/lib/supabase/reminder-workflows'
import type { ReminderWorkflow, ScheduledReminder } from '@/lib/supabase/reminder-workflows'
import { supabase } from '@/lib/supabaseClient'

export default function AdminWorkflowsPage() {
  const [workflows, setWorkflows] = useState<ReminderWorkflow[]>([])
  const [pendingReminders, setPendingReminders] = useState<ScheduledReminder[]>([])
  const [stats, setStats] = useState({
    total_scheduled: 0,
    sent_today: 0,
    failed_today: 0,
    active_workflows: 0
  })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchWorkflows(),
      fetchPendingReminders(),
      fetchStats()
    ])
    setLoading(false)
  }

  const fetchWorkflows = async () => {
    try {
      const { data } = await supabase
        .from('reminder_workflows')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setWorkflows(data)
    } catch (error) {
      console.error('Erreur récupération workflows:', error)
    }
  }

  const fetchPendingReminders = async () => {
    try {
      const { data } = await supabase
        .from('scheduled_reminders')
        .select(`
          *,
          user:profiles(first_name, last_name, email),
          workflow:reminder_workflows(name, type)
        `)
        .eq('status', 'pending')
        .order('scheduled_for', { ascending: true })
        .limit(20)
      
      if (data) setPendingReminders(data)
    } catch (error) {
      console.error('Erreur récupération rappels:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const [totalRes, sentRes, failedRes, activeRes] = await Promise.all([
        supabase
          .from('scheduled_reminders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('scheduled_reminders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'sent')
          .gte('last_attempt_at', today.toISOString()),
        supabase
          .from('scheduled_reminders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'failed')
          .gte('last_attempt_at', today.toISOString()),
        supabase
          .from('reminder_workflows')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
      ])

      setStats({
        total_scheduled: totalRes.count || 0,
        sent_today: sentRes.count || 0,
        failed_today: failedRes.count || 0,
        active_workflows: activeRes.count || 0
      })
    } catch (error) {
      console.error('Erreur récupération stats:', error)
    }
  }

  const toggleWorkflow = async (workflowId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reminder_workflows')
        .update({ is_active: !currentStatus })
        .eq('id', workflowId)
      
      if (!error) {
        setWorkflows(workflows.map(w => 
          w.id === workflowId ? { ...w, is_active: !currentStatus } : w
        ))
      }
    } catch (error) {
      console.error('Erreur mise à jour workflow:', error)
    }
  }

  const processRemindersNow = async () => {
    setProcessing(true)
    try {
      await ReminderWorkflowsService.processReminders()
      alert('Rappels traités avec succès')
      await fetchData()
    } catch (error) {
      console.error('Erreur traitement rappels:', error)
      alert('Erreur lors du traitement des rappels')
    } finally {
      setProcessing(false)
    }
  }

  const initializeWorkflows = async () => {
    try {
      await ReminderWorkflowsService.initializeWorkflows()
      alert('Workflows initialisés avec succès')
      await fetchWorkflows()
    } catch (error) {
      console.error('Erreur initialisation workflows:', error)
      alert('Erreur lors de l\'initialisation')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'formation_reminder':
        return <Calendar className="w-5 h-5" />
      case 'incomplete_profile':
        return <Zap className="w-5 h-5" />
      case 'inactive_user':
        return <RefreshCw className="w-5 h-5" />
      case 'referral_pending':
        return <Mail className="w-5 h-5" />
      case 'certification_expiry':
        return <Clock className="w-5 h-5" />
      case 'session_reminder':
        return <Bell className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="w-6 h-6 mr-2" />
              Workflows de rappels automatiques
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez les rappels automatiques et les notifications
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={initializeWorkflows}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Initialiser workflows
            </button>
            <button
              onClick={processRemindersNow}
              disabled={processing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Traiter maintenant
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rappels planifiés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_scheduled}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Envoyés aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sent_today}</p>
              </div>
              <Mail className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Échecs aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed_today}</p>
              </div>
              <Bell className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workflows actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_workflows}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Workflows */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Workflows configurés</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workflow
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflows.map((workflow) => (
                  <tr key={workflow.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getWorkflowIcon(workflow.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {workflow.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {workflow.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {workflow.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {workflow.actions.length} action{workflow.actions.length > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleWorkflow(workflow.id, workflow.is_active)}
                        className="inline-flex items-center"
                      >
                        {workflow.is_active ? (
                          <ToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prochains rappels */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Prochains rappels planifiés</h2>
          </div>
          
          {pendingReminders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun rappel planifié pour le moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date/Heure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workflow
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tentatives
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {pendingReminders.map((reminder) => (
                    <tr key={reminder.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(reminder.scheduled_for)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {reminder.user?.first_name} {reminder.user?.last_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {reminder.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reminder.workflow?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reminder.metadata?.action_data?.type === 'email'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {reminder.metadata?.action_data?.type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reminder.attempts || 0}/3
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}