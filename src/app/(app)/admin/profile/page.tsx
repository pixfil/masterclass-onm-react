'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Input from '@/shared/Input'
import Textarea from '@/shared/Textarea'
import Avatar from '@/shared/Avatar'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentUserProfile, updateUserProfile, uploadAvatar, UserProfile } from '@/lib/supabase/profiles'
import { ImageAdd02Icon } from '@/components/Icons'
import { 
  UserIcon, 
  CameraIcon, 
  CheckIcon,
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const ProfileContent = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    location: '',
    website: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const userProfile = await getCurrentUserProfile()
        setProfile(userProfile)
        
        if (userProfile) {
          setFormData({
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || '',
            phone: userProfile.phone || '',
            bio: userProfile.bio || '',
            location: userProfile.location || '',
            website: userProfile.website || ''
          })
        }
      }
      setLoading(false)
    }

    loadProfile()
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    const updatedProfile = await updateUserProfile(formData)
    
    if (updatedProfile) {
      setProfile(updatedProfile)
      setMessage('Profil mis à jour avec succès !')
    } else {
      setMessage('Erreur lors de la mise à jour du profil')
    }

    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    const avatarUrl = await uploadAvatar(file)
    
    if (avatarUrl) {
      const updatedProfile = await updateUserProfile({ avatar_url: avatarUrl })
      if (updatedProfile) {
        setProfile(updatedProfile)
        setMessage('Photo de profil mise à jour !')
      }
    } else {
      setMessage('Erreur lors du téléchargement de la photo')
    }

    setUploading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <AdminLayout currentPage="settings">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="settings">
      <div className="max-w-4xl">
        <div className="mb-8">
          <Heading as="h2">Mon compte</Heading>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.includes('succès') 
              ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm dark:bg-neutral-800">
          {/* Photo de profil */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
              Photo de profil
            </h3>
            <div className="flex items-center space-x-6">
              <div className="relative flex overflow-hidden rounded-full">
                <Avatar 
                  src={profile?.avatar_url} 
                  className="h-32 w-32" 
                />
                <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 text-neutral-50 opacity-0 hover:opacity-100 transition-opacity">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ImageAdd02Icon className="h-6 w-6" />
                      <span className="mt-1 text-xs">Modifier la photo</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="absolute inset-0 cursor-pointer opacity-0" 
                />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  JPG, GIF ou PNG. 5MB max.
                </p>
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-6">
              Informations personnelles
            </h3>
            
            <div className="space-y-6">
              {/* Email (lecture seule) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    className="pl-10" 
                    value={user?.email || ''} 
                    disabled 
                    placeholder="Votre email"
                  />
                </div>
              </div>

              {/* Prénom et Nom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Prénom
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <Input 
                      className="pl-10" 
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Jean"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nom
                  </label>
                  <Input 
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Dupont"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    className="pl-10" 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Localisation
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    className="pl-10" 
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Strasbourg, France"
                  />
                </div>
              </div>

              {/* Site web */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Site web
                </label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    className="pl-10" 
                    type="url" 
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Biographie
                </label>
                <Textarea 
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Parlez-nous de vous..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                {message && message.includes('succès') && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <CheckIcon className="h-4 w-4 mr-1" />
                    {message}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <ButtonPrimary 
                  onClick={handleSave}
                  disabled={saving}
                  className="min-w-32"
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </ButtonPrimary>
                
                <Button 
                  color="light" 
                  onClick={() => setFormData({
                    first_name: profile?.first_name || '',
                    last_name: profile?.last_name || '',
                    phone: profile?.phone || '',
                    bio: profile?.bio || '',
                    location: profile?.location || '',
                    website: profile?.website || ''
                  })}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <ProfileContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}