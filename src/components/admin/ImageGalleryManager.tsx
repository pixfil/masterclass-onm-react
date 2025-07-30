'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  PhotoIcon, 
  TrashIcon, 
  StarIcon,
  PlusIcon,
  ArrowsUpDownIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Button } from '@/shared/Button'
import Input from '@/shared/Input'
import { 
  getPropertyImages, 
  addPropertyImage, 
  deletePropertyImage, 
  setFeaturedImage,
  reorderPropertyImages 
} from '@/lib/supabase/property-images'
import { PropertyImage } from '@/lib/supabase/types'
import { supabase } from '@/lib/supabaseClient'

interface ImageGalleryManagerProps {
  propertyId: string | null
  onImagesChange?: (images: PropertyImage[]) => void
}

export const ImageGalleryManager = ({ propertyId, onImagesChange }: ImageGalleryManagerProps) => {
  const [images, setImages] = useState<PropertyImage[]>([])
  const [loading, setLoading] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([])
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (propertyId) {
      loadImages()
    }
  }, [propertyId])

  const loadImages = async () => {
    if (!propertyId) return
    
    try {
      const propertyImages = await getPropertyImages(propertyId)
      setImages(propertyImages)
      onImagesChange?.(propertyImages)
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error)
    }
  }

  const handleAddImage = async () => {
    if (!newImageUrl.trim() || !propertyId) return

    try {
      setLoading(true)
      const newImage = await addPropertyImage({
        property_id: propertyId,
        image_url: newImageUrl.trim(),
        image_order: images.length,
        alt_text: '',
        is_featured: images.length === 0
      })
      
      setImages([...images, newImage])
      setNewImageUrl('')
      onImagesChange?.([...images, newImage])
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return

    try {
      await deletePropertyImage(imageId)
      const updatedImages = images.filter(img => img.id !== imageId)
      setImages(updatedImages)
      onImagesChange?.(updatedImages)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleSetFeatured = async (imageId: string) => {
    if (!propertyId) return

    try {
      await setFeaturedImage(propertyId, imageId)
      const updatedImages = images.map(img => ({
        ...img,
        is_featured: img.id === imageId
      }))
      setImages(updatedImages)
      onImagesChange?.(updatedImages)
    } catch (error) {
      console.error('Erreur lors de la définition de l\'image principale:', error)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex || !propertyId) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    
    newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)
    
    setImages(newImages)
    setDraggedIndex(null)

    try {
      const orderedIds = newImages.map(img => img.id)
      await reorderPropertyImages(propertyId, orderedIds)
      onImagesChange?.(newImages)
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error)
      loadImages()
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleFileUpload = async (files: FileList) => {
    if (!propertyId) return

    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    )

    if (validFiles.length === 0) {
      alert('Veuillez sélectionner des images valides (max 5MB)')
      return
    }

    setUploadingFiles(validFiles.map(f => f.name))

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const timestamp = Date.now()
        const fileName = `${propertyId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        return await addPropertyImage({
          property_id: propertyId,
          image_url: publicUrl,
          image_order: images.length + index,
          alt_text: file.name,
          is_featured: images.length === 0 && index === 0
        })
      })

      const newImages = await Promise.all(uploadPromises)
      setImages([...images, ...newImages])
      onImagesChange?.([...images, ...newImages])
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      alert('Erreur lors de l\'upload des images')
    } finally {
      setUploadingFiles([])
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(true)
  }

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)
  }

  if (!propertyId) {
    return (
      <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center dark:bg-neutral-800 dark:border-neutral-600">
        <PhotoIcon className="mx-auto h-12 w-12 text-neutral-400" />
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Enregistrez d&apos;abord la propriété pour ajouter des images
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 admin-image-gallery">
      {/* Zone d'upload drag & drop */}
      <div
        onDrop={handleFileDrop}
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          isDraggingFile 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
        
        <div className="text-center">
          <CloudArrowUpIcon className={`mx-auto h-12 w-12 ${
            isDraggingFile ? 'text-primary-500' : 'text-neutral-400'
          }`} />
          <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
            {isDraggingFile ? 'Déposez vos images ici' : 'Glissez-déposez vos images ici'}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            ou
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2"
          >
            Parcourir
          </Button>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            PNG, JPG, GIF jusqu&apos;à 5MB
          </p>
        </div>

        {uploadingFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Upload en cours: {uploadingFiles.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Ajout par URL */}
      <div className="bg-neutral-50 rounded-lg p-4 dark:bg-neutral-800">
        <div className="flex items-center space-x-2 mb-4">
          <PlusIcon className="h-5 w-5 text-primary-600" />
          <h4 className="font-medium text-neutral-900 dark:text-white">Ajouter par URL</h4>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="URL de l'image (https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddImage()
                }
              }}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddImage}
            disabled={!newImageUrl.trim() || loading}
            size="sm"
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </Button>
        </div>
      </div>

      {/* Galerie d'images */}
      {images.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PhotoIcon className="h-5 w-5 text-primary-600" />
              <h4 className="font-medium text-neutral-900 dark:text-white">
                Galerie ({images.length} image{images.length > 1 ? 's' : ''})
              </h4>
              <div className="flex items-center text-sm text-neutral-500">
                <ArrowsUpDownIcon className="h-4 w-4 mr-1" />
                Glissez pour réorganiser
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  position: 'relative',
                  cursor: 'move',
                  opacity: draggedIndex === index ? 0.5 : 1,
                  border: '2px solid #ccc',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: 'white'
                }}
              >
                {/* IMAGE SIMPLE comme dans les tests qui fonctionnent */}
                <img
                  src={image.image_url}
                  alt={image.alt_text || ''}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />

                {/* Badge image principale */}
                {image.is_featured && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: '#eab308',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ⭐ Principale
                  </div>
                )}

                {/* Ordre */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  #{index + 1}
                </div>

                {/* Actions */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '4px'
                }}>
                  {!image.is_featured && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleSetFeatured(image.id)
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#eab308',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                      title="Définir comme image principale"
                    >
                      <StarIcon className="h-5 w-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteImage(image.id)
                    }}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Supprimer l'image"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center dark:bg-neutral-800 dark:border-neutral-600">
          <PhotoIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Aucune image ajoutée pour cette propriété
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Utilisez le champ ci-dessus pour ajouter votre première image
          </p>
        </div>
      )}
    </div>
  )
}