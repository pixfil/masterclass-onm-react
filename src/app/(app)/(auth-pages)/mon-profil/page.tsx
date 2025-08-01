"use client"

import React, { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar, 
  Edit3, 
  Camera, 
  Save, 
  X, 
  Award, 
  Activity,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Lock
} from 'lucide-react'
import ProfileTags from '@/components/ProfileTags'
import BadgeONM from '@/components/BadgeONM'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentUserProfile, updateUserProfile, uploadAvatar } from '@/lib/supabase/profiles'
import type { UserProfile } from '@/lib/supabase/profiles'
import Link from 'next/link'
import Image from 'next/image'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'

// Données fictives pour les formations
const formationsData = {
  completed: [
    {
      id: 1,
      title: "Les fondamentaux de l'orthodontie neuro-musculaire",
      duration: "12h",
      completedDate: "15 janvier 2024",
      score: 95,
      certificate: true
    },
    {
      id: 2,
      title: "Diagnostic et analyse fonctionnelle",
      duration: "8h",
      completedDate: "22 février 2024",
      score: 88,
      certificate: true
    }
  ],
  inProgress: [
    {
      id: 3,
      title: "Traitement des Classes II complexes",
      duration: "16h",
      progress: 65,
      nextSession: "5 avril 2024",
      modules: { completed: 4, total: 6 }
    }
  ],
  upcoming: [
    {
      id: 4,
      title: "Innovations numériques en ONM",
      duration: "10h",
      startDate: "15 avril 2024",
      price: "750€"
    },
    {
      id: 5,
      title: "Approche interdisciplinaire avancée",
      duration: "20h",
      startDate: "3 mai 2024",
      price: "1200€"
    }
  ],
  suggested: [
    {
      id: 6,
      title: "Gestion des cas d'asymétrie",
      duration: "12h",
      level: "Avancé",
      matchScore: 92
    },
    {
      id: 7,
      title: "Orthodontie pédiatrique ONM",
      duration: "14h",
      level: "Intermédiaire",
      matchScore: 85
    }
  ]
}

export default function MonProfilPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    website: '',
    bio: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const userProfile = await getCurrentUserProfile()
      if (userProfile) {
        setProfile(userProfile)
        setFormData({
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || '',
          phone: userProfile.phone || '',
          location: userProfile.location || '',
          website: userProfile.website || '',
          bio: userProfile.bio || ''
        })
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        bio: profile.bio || ''
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedProfile = await updateUserProfile(formData)
      if (updatedProfile) {
        setProfile(updatedProfile)
        setEditing(false)
      }
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const avatarUrl = await uploadAvatar(file)
      if (avatarUrl) {
        const updatedProfile = await updateUserProfile({ avatar_url: avatarUrl })
        if (updatedProfile) {
          setProfile(updatedProfile)
        }
      }
    } catch (error) {
      console.error('Erreur upload avatar:', error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (!user) {
    return (
      <>
        {/* Hero Section avec le style de /la-methode */}
        <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
          
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Espace <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Membre</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
                Connectez-vous pour accéder à votre profil et suivre vos formations
              </p>

              <Link href="/connexion">
                <ButtonPrimary className="w-full sm:w-auto">
                  Se connecter
                </ButtonPrimary>
              </Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      {/* Hero Section avec le style de /la-methode */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Avatar et infos principales */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white overflow-hidden">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <User className="w-16 h-16 text-neutral-400 dark:text-neutral-500" />
                      </div>
                    )}
                  </div>
                  
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  )}
                </div>

                <div className="text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {profile?.first_name} {profile?.last_name}
                  </h1>
                  <p className="text-slate-300 text-lg">{user.email}</p>
                  {profile?.is_certified && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">Praticien certifié ONM</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats rapides */}
              <div className="flex-1 grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">{formationsData.completed.length}</div>
                  <div className="text-slate-300">Formations terminées</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">24h</div>
                  <div className="text-slate-300">Total d'apprentissage</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">92%</div>
                  <div className="text-slate-300">Score moyen</div>
                </div>
              </div>

              {/* Actions */}
              <div>
                {!editing ? (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Modifier le profil
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-white/80 hover:text-white transition-colors"
                      disabled={saving}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      disabled={saving}
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation tabs */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-20">
        <div className="container">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
              { id: 'formations', label: 'Mes formations', icon: BookOpen },
              { id: 'achievements', label: 'Badges & Succès', icon: Award },
              { id: 'profile', label: 'Informations', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-neutral-50 dark:bg-neutral-800 min-h-screen py-8">
        <div className="container">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Vue d'ensemble */}
              {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Progression actuelle */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                        Formation en cours
                      </h2>
                      
                      {formationsData.inProgress.map((formation) => (
                        <div key={formation.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{formation.title}</h3>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Module {formation.modules.completed}/{formation.modules.total} • Prochaine session : {formation.nextSession}
                              </p>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">{formation.progress}%</span>
                          </div>
                          
                          <div className="w-full bg-neutral-200 rounded-full h-3 mb-4">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${formation.progress}%` }}
                            />
                          </div>
                          
                          <Link href={`/formations/${formation.id}`}>
                            <ButtonPrimary sizeClass="px-4 py-2">
                              Continuer la formation
                            </ButtonPrimary>
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Activité récente */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-semibold mb-6">Activité récente</h2>
                      <ProfileTags userId={user.id} showStats={true} showAll={true} />
                    </div>
                  </div>

                  {/* Colonne latérale */}
                  <div className="space-y-6">
                    {/* Prochaines formations */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        Prochaines formations
                      </h3>
                      <div className="space-y-3">
                        {formationsData.upcoming.slice(0, 2).map((formation) => (
                          <div key={formation.id} className="border-l-4 border-blue-600 pl-4">
                            <h4 className="font-medium">{formation.title}</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {formation.startDate} • {formation.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Badge ONM Certifié */}
                    {profile?.is_certified && (
                      <BadgeONM
                        userName={`${profile.first_name} ${profile.last_name}`}
                        certificationDate={profile.certification_date || profile.created_at}
                        certificationNumber={`ONM-${profile.id.slice(0, 8).toUpperCase()}`}
                        profileUrl={`${window.location.origin}/praticien/${profile.id}`}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Mes formations */}
              {activeTab === 'formations' && (
                <div className="space-y-8">
                  {/* Formations terminées */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                      Formations terminées ({formationsData.completed.length})
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {formationsData.completed.map((formation) => (
                        <div key={formation.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-lg flex-1">{formation.title}</h3>
                            {formation.certificate && (
                              <Award className="w-6 h-6 text-yellow-500" />
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <p>Durée : {formation.duration}</p>
                            <p>Terminé le : {formation.completedDate}</p>
                            <p>Score : <span className="font-semibold text-green-600">{formation.score}%</span></p>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            {formation.certificate && (
                              <ButtonSecondary sizeClass="px-3 py-1.5 text-sm">
                                Télécharger le certificat
                              </ButtonSecondary>
                            )}
                            <Link href={`/formations/${formation.id}/replay`}>
                              <ButtonSecondary sizeClass="px-3 py-1.5 text-sm">
                                Revoir
                              </ButtonSecondary>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formations en cours */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Clock className="w-6 h-6 mr-3 text-blue-600" />
                      En cours ({formationsData.inProgress.length})
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {formationsData.inProgress.map((formation) => (
                        <div key={formation.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                          <h3 className="font-semibold text-lg mb-4">{formation.title}</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progression</span>
                                <span className="font-semibold">{formation.progress}%</span>
                              </div>
                              <div className="w-full bg-neutral-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                                  style={{ width: `${formation.progress}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                              <p>Modules : {formation.modules.completed}/{formation.modules.total}</p>
                              <p>Prochaine session : {formation.nextSession}</p>
                            </div>
                          </div>
                          
                          <Link href={`/formations/${formation.id}`} className="mt-4 block">
                            <ButtonPrimary className="w-full">
                              Continuer
                            </ButtonPrimary>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formations à venir */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
                      À venir ({formationsData.upcoming.length})
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {formationsData.upcoming.map((formation) => (
                        <div key={formation.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                          <h3 className="font-semibold text-lg mb-4">{formation.title}</h3>
                          
                          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <p>Début : {formation.startDate}</p>
                            <p>Durée : {formation.duration}</p>
                            <p>Prix : <span className="font-semibold text-neutral-900 dark:text-white">{formation.price}</span></p>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <Link href={`/formations/${formation.id}`}>
                              <ButtonSecondary sizeClass="px-3 py-1.5 text-sm">
                                Voir les détails
                              </ButtonSecondary>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions personnalisées */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Star className="w-6 h-6 mr-3 text-yellow-500" />
                      Recommandées pour vous
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {formationsData.suggested.map((formation) => (
                        <div key={formation.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-lg">{formation.title}</h3>
                            <span className="text-sm font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                              {formation.matchScore}% de correspondance
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <p>Niveau : {formation.level}</p>
                            <p>Durée : {formation.duration}</p>
                          </div>
                          
                          <Link href={`/formations/${formation.id}`} className="mt-4 block">
                            <ButtonPrimary className="w-full">
                              Découvrir
                            </ButtonPrimary>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Badges & Succès */}
              {activeTab === 'achievements' && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                      <h2 className="text-2xl font-bold mb-6">Mes badges et réalisations</h2>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Badges acquis */}
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                          <Award className="w-12 h-12 mx-auto mb-2 text-yellow-600" />
                          <h4 className="font-semibold">Expert ONM</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Niveau 1</p>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                          <Star className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                          <h4 className="font-semibold">Formation Star</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">5 formations</p>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                          <TrendingUp className="w-12 h-12 mx-auto mb-2 text-green-600" />
                          <h4 className="font-semibold">Progression</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">+50% ce mois</p>
                        </div>
                        
                        {/* Badges verrouillés */}
                        <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl opacity-60">
                          <Lock className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
                          <h4 className="font-semibold">Master ONM</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">2/10 formations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                      <h3 className="font-semibold mb-4">Statistiques</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Niveau global</span>
                            <span className="font-semibold">Intermédiaire</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full w-3/5" />
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Points XP</span>
                            <span className="font-semibold">2,450</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rang</span>
                            <span className="font-semibold">#127</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Série actuelle</span>
                            <span className="font-semibold">15 jours</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations du profil */}
              {activeTab === 'profile' && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-semibold mb-6">Informations personnelles</h2>
                      
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Prénom
                            </label>
                            {editing ? (
                              <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-neutral-900 dark:text-white">{profile?.first_name || 'Non renseigné'}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Nom
                            </label>
                            {editing ? (
                              <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-neutral-900 dark:text-white">{profile?.last_name || 'Non renseigné'}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Bio
                          </label>
                          {editing ? (
                            <textarea
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                              placeholder="Parlez-nous de vous, de votre parcours en orthodontie..."
                              rows={4}
                              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                              {profile?.bio || 'Aucune description ajoutée'}
                            </p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              <Phone className="w-4 h-4 mr-2" />
                              Téléphone
                            </label>
                            {editing ? (
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+33 6 12 34 56 78"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-neutral-600 dark:text-neutral-400">{profile?.phone || 'Non renseigné'}</p>
                            )}
                          </div>

                          <div>
                            <label className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              <MapPin className="w-4 h-4 mr-2" />
                              Localisation
                            </label>
                            {editing ? (
                              <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Paris, France"
                                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-neutral-600 dark:text-neutral-400">{profile?.location || 'Non renseigné'}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            <Globe className="w-4 h-4 mr-2" />
                            Site web
                          </label>
                          {editing ? (
                            <input
                              type="url"
                              value={formData.website}
                              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                              placeholder="https://monsite.com"
                              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : profile?.website ? (
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {profile.website.replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            <p className="text-neutral-600 dark:text-neutral-400">Non renseigné</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Informations du compte */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                      <h3 className="font-semibold mb-4">Informations du compte</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
                          <p className="text-neutral-600 dark:text-neutral-400">{user.email}</p>
                        </div>
                        <div>
                          <label className="flex items-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            <Calendar className="w-4 h-4 mr-2" />
                            Membre depuis
                          </label>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {new Date(profile?.created_at || '').toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6">
                      <h3 className="font-semibold mb-4">Actions rapides</h3>
                      <div className="space-y-2">
                        <Link
                          href="/account/mes-badges"
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <span className="flex items-center text-neutral-700 dark:text-neutral-300">
                            <Award className="w-5 h-5 mr-3" />
                            Mes badges
                          </span>
                          <span className="text-neutral-400">→</span>
                        </Link>
                        
                        <Link
                          href="/account/mon-activite"
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <span className="flex items-center text-neutral-700 dark:text-neutral-300">
                            <Activity className="w-5 h-5 mr-3" />
                            Mon activité
                          </span>
                          <span className="text-neutral-400">→</span>
                        </Link>
                        
                        <Link
                          href="/account/mon-parcours"
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <span className="flex items-center text-neutral-700 dark:text-neutral-300">
                            <TrendingUp className="w-5 h-5 mr-3" />
                            Mon parcours
                          </span>
                          <span className="text-neutral-400">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}