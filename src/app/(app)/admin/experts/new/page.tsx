'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { CEPROFExpertsService, type CEPROFExpert } from '@/lib/supabase/ceprof-experts'
import { toast } from 'react-hot-toast'

const NewExpertPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newCredential, setNewCredential] = useState('')
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    profile_photo: '',
    specialties: [] as string[],
    years_experience: 0,
    credentials: [] as string[],
    practice_location: '',
    website: '',
    linkedin: '',
    is_active: true,
    is_instructor: false,
    is_verified: false,
    joined_date: new Date().toISOString().split('T')[0]
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'years_experience') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty('')
    }
  }

  const handleRemoveSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }))
  }

  const handleAddCredential = () => {
    if (newCredential.trim() && !formData.credentials.includes(newCredential.trim())) {
      setFormData(prev => ({
        ...prev,
        credentials: [...prev.credentials, newCredential.trim()]
      }))
      setNewCredential('')
    }
  }

  const handleRemoveCredential = (index: number) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const result = await CEPROFExpertsService.createExpert(formData)
      if (result.success) {
        toast.success('Expert créé avec succès')
        router.push('/admin/experts')
      } else {
        toast.error(result.message || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminLayout currentPage="experts">
          <div className="nc-NewExpertPage">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="mb-8">
                <Link
                  href="/admin/experts"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Retour aux experts
                </Link>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Nouvel expert CEPROF
                </h1>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  Ajoutez un nouveau professionnel au réseau CEPROF
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Informations personnelles */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Informations personnelles
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          URL Photo de profil
                        </label>
                        <input
                          type="url"
                          name="profile_photo"
                          value={formData.profile_photo}
                          onChange={handleInputChange}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Biographie
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Présentez l'expert et son parcours..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expérience professionnelle */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Expérience professionnelle
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Années d'expérience
                        </label>
                        <input
                          type="number"
                          name="years_experience"
                          value={formData.years_experience}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Localisation du cabinet
                        </label>
                        <input
                          type="text"
                          name="practice_location"
                          value={formData.practice_location}
                          onChange={handleInputChange}
                          placeholder="Ville, Région"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Site web
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date d'adhésion CEPROF
                        </label>
                        <input
                          type="date"
                          name="joined_date"
                          value={formData.joined_date}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spécialités */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Spécialités
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="text"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="Ajouter une spécialité..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecialty}
                        className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          {specialty}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialty(index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Diplômes et certifications */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Diplômes et certifications
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="text"
                        value={newCredential}
                        onChange={(e) => setNewCredential(e.target.value)}
                        placeholder="Ajouter un diplôme..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCredential}
                        className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.credentials.map((credential, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">{credential}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCredential(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Statuts */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Statuts
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Expert actif
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_instructor"
                        checked={formData.is_instructor}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Instructeur de formations
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_verified"
                        checked={formData.is_verified}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Expert vérifié
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Link
                    href="/admin/experts"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? 'Création...' : 'Créer l\'expert'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default NewExpertPage