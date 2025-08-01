"use client"

import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Globe, Calendar, Edit3, Camera, Save, X, Award, Activity } from 'lucide-react'
import ModernHeader from '@/components/Header/ModernHeader'
import ProfileTags from '@/components/ProfileTags'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentUserProfile, updateUserProfile, uploadAvatar } from '@/lib/supabase/profiles'
import type { UserProfile } from '@/lib/supabase/profiles'
import Link from 'next/link'
import Image from 'next/image'

export default function MonProfilPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
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
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connectez-vous pour voir votre profil</h2>
            <Link href="/connexion" className="text-blue-600 hover:text-blue-700">Se connecter</Link>
          </div>
        </div>
        </>
    )
  }

  return (
    <>
      <ModernHeader />
      
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Header du profil */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
                
                <div className="px-6 pb-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12">
                    {/* Avatar */}
                    <div className="relative mb-4 sm:mb-0 sm:mr-6">
                      <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                        {profile?.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={`${profile.first_name} ${profile.last_name}`}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <User className="w-16 h-16 text-gray-400" />
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

                    {/* Infos principales */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">
                            {profile?.first_name} {profile?.last_name}
                          </h1>
                          <p className="text-gray-600">{user.email}</p>
                        </div>
                        
                        <div className="mt-4 sm:mt-0">
                          {!editing ? (
                            <button
                              onClick={handleEdit}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Modifier
                            </button>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleCancel}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={saving}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Annuler
                              </button>
                              <button
                                onClick={handleSave}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                disabled={saving}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags dynamiques */}
                      <div className="mt-6">
                        <ProfileTags userId={user.id} maxTags={8} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Bio */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">À propos</h2>
                    {editing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Parlez-nous de vous, de votre parcours en orthodontie..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {profile?.bio || 'Aucune description ajoutée'}
                      </p>
                    )}
                  </div>

                  {/* Statistiques détaillées */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Activité & Impact
                    </h2>
                    <ProfileTags userId={user.id} showStats={true} showAll={true} />
                  </div>
                </div>

                {/* Colonne latérale */}
                <div className="space-y-6">
                  {/* Informations de contact */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
                    <div className="space-y-4">
                      {/* Téléphone */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <Phone className="w-4 h-4 mr-2" />
                          Téléphone
                        </label>
                        {editing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+33 6 12 34 56 78"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-600">{profile?.phone || 'Non renseigné'}</p>
                        )}
                      </div>

                      {/* Localisation */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <MapPin className="w-4 h-4 mr-2" />
                          Localisation
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Paris, France"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-600">{profile?.location || 'Non renseigné'}</p>
                        )}
                      </div>

                      {/* Site web */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <Globe className="w-4 h-4 mr-2" />
                          Site web
                        </label>
                        {editing ? (
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://monsite.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                          <p className="text-gray-600">Non renseigné</p>
                        )}
                      </div>

                      {/* Date d'inscription */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          Membre depuis
                        </label>
                        <p className="text-gray-600">
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
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
                    <div className="space-y-2">
                      <Link
                        href="/mes-badges"
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="flex items-center text-gray-700">
                          <Award className="w-5 h-5 mr-3" />
                          Mes badges
                        </span>
                        <span className="text-gray-400">→</span>
                      </Link>
                      
                      <Link
                        href="/mon-activite"
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="flex items-center text-gray-700">
                          <Activity className="w-5 h-5 mr-3" />
                          Mon activité
                        </span>
                        <span className="text-gray-400">→</span>
                      </Link>
                      
                      <Link
                        href="/mon-parcours"
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="flex items-center text-gray-700">
                          <Award className="w-5 h-5 mr-3" />
                          Mon parcours gamifié
                        </span>
                        <span className="text-gray-400">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  )
}