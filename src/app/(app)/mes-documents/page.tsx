"use client"

import React, { useState, useEffect } from 'react'
import { Upload, Folder, FileText, Download, Trash2, Share2, Search, Filter, Plus, X, Eye, Grid, List, HardDrive } from 'lucide-react'
import { PersonalDocumentsService } from '@/lib/supabase/personal-documents'
import type { PersonalDocument, DocumentFolder, DocumentStats } from '@/lib/supabase/types/personal-document-types'
import ModernHeader from '@/components/Header/ModernHeader'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function MesDocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<PersonalDocument[]>([])
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<PersonalDocument | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadData, setUploadData] = useState({
    folder_id: '',
    description: '',
    tags: '',
    is_private: true
  })
  const [uploading, setUploading] = useState(false)

  // New folder state
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, selectedFolder, searchQuery, currentPage])

  const fetchData = async () => {
    setLoading(true)
    const [docsRes, foldersRes, statsRes] = await Promise.all([
      PersonalDocumentsService.getDocuments({
        folder_id: selectedFolder || undefined,
        query: searchQuery,
        page: currentPage,
        limit: 12
      }),
      PersonalDocumentsService.getFolders(),
      PersonalDocumentsService.getStorageStats()
    ])

    if (docsRes.data) {
      setDocuments(docsRes.data)
      setTotalPages(docsRes.pagination.total_pages)
    }
    if (foldersRes.data) setFolders(foldersRes.data)
    if (statsRes.data) setStats(statsRes.data)
    setLoading(false)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile || !user) return

    setUploading(true)
    const { success, message } = await PersonalDocumentsService.uploadDocument(uploadFile, {
      folder_id: uploadData.folder_id || undefined,
      description: uploadData.description,
      tags: uploadData.tags ? uploadData.tags.split(',').map(t => t.trim()) : [],
      is_private: uploadData.is_private
    })

    if (success) {
      setShowUploadModal(false)
      setUploadFile(null)
      setUploadData({ folder_id: '', description: '', tags: '', is_private: true })
      fetchData()
    } else {
      alert(message || 'Erreur lors de l\'upload')
    }
    setUploading(false)
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    const { success } = await PersonalDocumentsService.createFolder(newFolderData)
    if (success) {
      setShowNewFolderModal(false)
      setNewFolderData({ name: '', description: '', color: '#3B82F6' })
      fetchData()
    }
  }

  const handleDeleteDocument = async (doc: PersonalDocument) => {
    if (!confirm('Voulez-vous vraiment supprimer ce document ?')) return
    
    const { success } = await PersonalDocumentsService.deleteDocument(doc.id)
    if (success) {
      fetchData()
    }
  }

  const handleShare = async (emails: string[]) => {
    if (!selectedDocument) return
    
    const { success } = await PersonalDocumentsService.shareDocument(selectedDocument.id, emails)
    if (success) {
      setShowShareModal(false)
      setSelectedDocument(null)
      fetchData()
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType?: string) => {
    const type = fileType?.toLowerCase()
    if (!type) return FileText
    
    // Map des types de fichiers vers les icônes
    const iconMap: { [key: string]: any } = {
      'pdf': FileText,
      'doc': FileText,
      'docx': FileText,
      'jpg': FileText,
      'jpeg': FileText,
      'png': FileText,
      'mp4': FileText,
      'zip': FileText
    }
    
    return iconMap[type] || FileText
  }

  if (!user) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connectez-vous pour accéder à vos documents</h2>
            <Link href="/connexion" className="text-blue-600 hover:text-blue-700">Se connecter</Link>
          </div>
        </div>
        </>
    )
  }

  return (
    <>
      <ModernHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mes Documents
            </h1>
            <p className="text-xl opacity-90">
              Votre espace personnel pour stocker et organiser tous vos documents ONM
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Statistiques de stockage */}
          {stats && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <HardDrive className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Espace de stockage</h3>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(stats.storage_used)} utilisés sur {formatFileSize(stats.storage_limit)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.total_documents}</p>
                  <p className="text-sm text-gray-600">documents</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.storage_used / stats.storage_limit) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Barre d'outils */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Uploader
                </button>
                <button
                  onClick={() => setShowNewFolderModal(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau dossier
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Rechercher..."
                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar des dossiers */}
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Dossiers</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => {
                        setSelectedFolder(null)
                        setCurrentPage(1)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
                        !selectedFolder ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Tous les documents
                    </button>
                  </li>
                  {folders.map((folder) => (
                    <li key={folder.id}>
                      <button
                        onClick={() => {
                          setSelectedFolder(folder.id)
                          setCurrentPage(1)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
                          selectedFolder === folder.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                        }`}
                      >
                        <Folder 
                          className="w-4 h-4 mr-2" 
                          style={{ color: folder.color || '#3B82F6' }}
                        />
                        {folder.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Zone principale */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Aucun document dans ce dossier</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Uploader un document
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => {
                    const Icon = getFileIcon(doc.file_type)
                    return (
                      <div key={doc.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => window.open(doc.file_url, '_blank')}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDocument(doc)
                                setShowShareModal(true)
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Partager"
                            >
                              <Share2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1 truncate">{doc.name}</h4>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{doc.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {doc.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Taille
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => {
                        const Icon = getFileIcon(doc.file_type)
                        return (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Icon className="w-5 h-5 text-gray-500 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                  {doc.description && (
                                    <div className="text-sm text-gray-500">{doc.description}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {doc.file_type?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatFileSize(doc.file_size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => window.open(doc.file_url, '_blank')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDocument(doc)
                                    setShowShareModal(true)
                                  }}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(doc)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  
                  <span className="px-4 py-2">
                    Page {currentPage} sur {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Uploader un document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dossier
                </label>
                <select
                  value={uploadData.folder_id}
                  onChange={(e) => setUploadData({ ...uploadData, folder_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Racine</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  placeholder="protocole, formation, cas clinique"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={uploadData.is_private}
                  onChange={(e) => setUploadData({ ...uploadData, is_private: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_private" className="text-sm text-gray-700">
                  Document privé (non partagé)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Upload en cours...' : 'Uploader'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouveau Dossier */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Nouveau dossier</h3>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du dossier
                </label>
                <input
                  type="text"
                  required
                  value={newFolderData.name}
                  onChange={(e) => setNewFolderData({ ...newFolderData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newFolderData.description}
                  onChange={(e) => setNewFolderData({ ...newFolderData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <input
                  type="color"
                  value={newFolderData.color}
                  onChange={(e) => setNewFolderData({ ...newFolderData, color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  )
}