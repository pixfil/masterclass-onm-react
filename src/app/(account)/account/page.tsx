'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUserProfile, updateUserProfile, uploadAvatar, UserProfile } from '@/lib/supabase/profiles'
import { ImageAdd02Icon } from '@/components/Icons'
import Avatar from '@/shared/Avatar'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { Button } from '@/shared/Button'
import { Divider } from '@/shared/divider'
import { Field, Label } from '@/shared/fieldset'
import Input from '@/shared/Input'
import Textarea from '@/shared/Textarea'
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
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
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const userProfile = await getCurrentUserProfile()
        setProfile(userProfile)
        
        if (userProfile) {
          // Valeurs par défaut pour Philippe H. si les champs sont vides
          const isPhilippe = user.email === 'philippe@gclicke.com'
          
          setFormData({
            first_name: userProfile.first_name || (isPhilippe ? 'Philippe' : ''),
            last_name: userProfile.last_name || (isPhilippe ? 'H.' : ''),
            phone: userProfile.phone || '',
            bio: userProfile.bio || '',
            location: userProfile.location || (isPhilippe ? 'Strasbourg, France' : ''),
            website: userProfile.website || ''
          })
        } else if (user.email === 'philippe@gclicke.com') {
          // Si pas de profil pour Philippe, créer les valeurs par défaut
          setFormData({
            first_name: 'Philippe',
            last_name: 'H.',
            phone: '',
            bio: '',
            location: 'Strasbourg, France',
            website: ''
          })
        }
      }
      setLoading(false)
    }

    getUser()
  }, [])

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">
          Vous devez être connecté pour accéder à cette page.
        </p>
        <Button href="/connexion" className="mt-4">
          Se connecter
        </Button>
      </div>
    )
  }

  // Déterminer si l'utilisateur est admin
  const isAdmin = user.email === 'philippe@gclicke.com'

  return (
    <div>
      {/* HEADING */}
      <h1 className="text-3xl font-semibold">Informations du compte</h1>

      <Divider className="my-8 w-14!" />

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
          message.includes('succès') 
            ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Photo de profil */}
        <div className="flex shrink-0 items-start">
          <div className="relative flex overflow-hidden rounded-full">
            <Avatar 
              src={profile?.avatar_url || (isAdmin ? '/default-avatar.png' : undefined)} 
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
        </div>

        {/* Formulaire */}
        <div className="mt-10 max-w-3xl grow space-y-6 md:mt-0 md:ps-16">
          {/* Email (lecture seule) */}
          <Field>
            <Label>Email</Label>
            <div className="relative mt-1.5">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input 
                className="pl-10" 
                value={user.email || ''} 
                disabled 
                placeholder="Votre email"
              />
            </div>
          </Field>

          {/* Prénom et Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label>Prénom</Label>
              <div className="relative mt-1.5">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input 
                  className="pl-10" 
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Jean"
                />
              </div>
            </Field>
            <Field>
              <Label>Nom</Label>
              <Input 
                className="mt-1.5" 
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Dupont"
              />
            </Field>
          </div>

          {/* Téléphone */}
          <Field>
            <Label>Téléphone</Label>
            <div className="relative mt-1.5">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input 
                className="pl-10" 
                type="tel" 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>
          </Field>

          {/* Localisation */}
          <Field>
            <Label>Localisation</Label>
            <div className="relative mt-1.5">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input 
                className="pl-10" 
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Strasbourg, France"
              />
            </div>
          </Field>

          {/* Site web */}
          <Field>
            <Label>Site web</Label>
            <div className="relative mt-1.5">
              <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input 
                className="pl-10" 
                type="url" 
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.example.com"
              />
            </div>
          </Field>

          {/* Bio */}
          <Field>
            <Label>Biographie</Label>
            <Textarea 
              className="mt-1.5" 
              rows={4}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Parlez-nous de vous..."
            />
          </Field>

          {/* Boutons d'action */}
          <div className="flex gap-4 pt-4">
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
  )
}