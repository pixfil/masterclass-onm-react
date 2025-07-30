// Types générés depuis la base de données Supabase enrichie

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          title: string
          description: string | null
          handle: string | null
          price: number
          transaction_type: 'vente' | 'location'
          property_type: 'maison' | 'appartement' | 'locaux_commerciaux' | 'parking' | 'terrain' | 'autres'
          status: 'disponible' | 'sous_offre' | 'vendu' | 'loue'
          address: string | null
          city: string
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          surface: number | null
          acreage: number | null
          rooms: number | null
          bedrooms: number | null
          bathrooms: number | null
          floor: number | null
          max_guests: number | null
          balcony: boolean | null
          terrace: boolean | null
          garden: boolean | null
          elevator: boolean | null
          furnished: boolean | null
          parking: number | null
          energy_class: string | null
          heating_type: string | null
          construction_year: number | null
          charges: number | null
          tax_fonciere: number | null
          sale_off: string | null
          featured_image: string | null
          slug: string | null
          published: boolean
          is_ads: boolean | null
          views_count: number
          like_count: number
          review_rating: number | null
          review_count: number
          created_at: string
          updated_at: string
          listing_date: string | null
          note_moyenne: number | null
          nombre_avis: number | null
          nombre_invites_max: number | null
          surface_pieds_carres: number | null
          agence_id: string | null
          agent_id: string | null
          prix_hors_honoraires: number | null
          honoraires: number | null
          honoraires_charge: string | null
          reference_mandat: string | null
          reference_interne: string | null
          disponibilite: string | null
          surface_habitable: number | null
          surface_totale: number | null
          nombre_wc: number | null
          nombre_sde: number | null
          adresse_complete: string | null
          etage: number | null
          nombre_etages_total: number | null
          ascenseur: boolean | null
          chauffage_type: string | null
          chauffage_energie: string | null
          chauffage_systeme: string | null
          eau_chaude_type: string | null
          eau_chaude_energie: string | null
          dpe_valeur: number | null
          ges_valeur: number | null
          charges_copropriete: number | null
          nombre_lots: number | null
          cave: boolean | null
          cellier: boolean | null
          grenier: boolean | null
          garage: boolean | null
          climatisation: boolean | null
          cuisine_equipee: boolean | null
          cuisine_americaine: boolean | null
          interphone: boolean | null
          gardien: boolean | null
          piscine: boolean | null
          surface_sejour: number | null
          veranda: boolean | null
          energie_depenses_min: number | null
          energie_depenses_max: number | null
          dpe_date: string | null
          deleted_at: string | null
          ubiflow_active: boolean | null
          hide_address: boolean | null
          property_label: string | null
          is_featured: boolean
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at' | 'views_count'>
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          image_url: string
          image_order: number
          alt_text: string | null
          caption: string | null
          is_featured: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['property_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['property_images']['Insert']>
      }
      property_amenities: {
        Row: {
          id: string
          property_id: string
          amenity_type: string
          amenity_name: string
          amenity_value: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['property_amenities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['property_amenities']['Insert']>
      }
      property_reviews: {
        Row: {
          id: string
          property_id: string
          reviewer_name: string
          reviewer_email: string | null
          reviewer_avatar: string | null
          rating: number
          title: string | null
          comment: string | null
          verified: boolean
          helpful_count: number
          published: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['property_reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['property_reviews']['Insert']>
      }
      property_favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['property_favorites']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['property_favorites']['Insert']>
      }
      contact_requests: {
        Row: {
          id: string
          property_id: string | null
          name: string
          email: string
          phone: string | null
          message: string | null
          request_type: 'information' | 'visite' | 'estimation' | 'autre'
          created_at: string
          processed: boolean
          processed_at: string | null
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['contact_requests']['Row'], 'id' | 'created_at' | 'processed' | 'processed_at' | 'notes'>
        Update: Partial<Database['public']['Tables']['contact_requests']['Insert']>
      }
      property_estimations: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          property_type: 'maison' | 'appartement' | 'locaux_commerciaux' | 'parking' | 'terrain' | 'autres'
          address: string | null
          city: string
          zipcode: string
          surface: number | null
          rooms: number | null
          year_built: number | null
          condition: 'neuf' | 'tres_bon' | 'bon' | 'a_rafraichir' | 'a_renover' | null
          description: string | null
          created_at: string
          processed: boolean
          estimated_value: number | null
          estimation_notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['property_estimations']['Row'], 'id' | 'created_at' | 'processed' | 'estimated_value' | 'estimation_notes'>
        Update: Partial<Database['public']['Tables']['property_estimations']['Insert']>
      }
      points_forts_propriete: {
        Row: {
          id: string
          property_id: string
          titre: string
          description: string | null
          ordre_affichage: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['points_forts_propriete']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['points_forts_propriete']['Insert']>
      }
      equipements_propriete: {
        Row: {
          id: string
          property_id: string
          nom_equipement: string
          icone_nom: string | null
          quantite: number
          est_disponible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['equipements_propriete']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['equipements_propriete']['Insert']>
      }
      avis_proprietes: {
        Row: {
          id: string
          property_id: string
          nom_client: string | null
          email_client: string | null
          note: number
          commentaire: string | null
          date_sejour: string | null
          est_verifie: boolean
          est_publie: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['avis_proprietes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['avis_proprietes']['Insert']>
      }
      agences: {
        Row: {
          id: string
          nom_agence: string
          description_agence: string | null
          photo_agence: string | null
          email: string | null
          telephone: string | null
          adresse_agence: string | null
          ville_agence: string | null
          code_postal_agence: string | null
          est_super_hote: boolean
          est_verifie: boolean
          note_moyenne: number
          nombre_avis_total: number
          nombre_proprietes_total: number
          taux_reponse: number
          temps_reponse_moyen: string | null
          date_creation_compte: string | null
          annees_experience: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['agences']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['agences']['Insert']>
      }
      agents_immobiliers: {
        Row: {
          id: string
          prenom: string
          nom: string
          email: string | null
          telephone: string | null
          photo_agent: string | null
          photo_couverture: string | null
          description_agent: string | null
          specialites: string[] | null
          est_super_agent: boolean
          est_verifie: boolean
          note_moyenne: number
          nombre_avis_agent: number
          nombre_proprietes_gerees: number
          taux_reponse: number
          temps_reponse_moyen: string | null
          date_embauche: string | null
          annees_experience: number
          agence_id: string | null
          est_actif: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['agents_immobiliers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['agents_immobiliers']['Insert']>
      }
      types_equipements: {
        Row: {
          id: string
          nom: string
          icone_nom: string | null
          categorie: string | null
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['types_equipements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['types_equipements']['Insert']>
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          prenom: string | null
          is_active: boolean
          source: string | null
          created_at: string
          unsubscribed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['newsletter_subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['newsletter_subscriptions']['Insert']>
      }
    }
    Views: {
      property_statistics: {
        Row: {
          total_properties: number
          for_sale: number
          for_rent: number
          available: number
          under_offer: number
          avg_sale_price: number | null
          avg_rent_price: number | null
        }
      }
    }
  }
}

// Types utilitaires
export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export type PropertyImage = Database['public']['Tables']['property_images']['Row']
export type PropertyImageInsert = Database['public']['Tables']['property_images']['Insert']
export type PropertyImageUpdate = Database['public']['Tables']['property_images']['Update']

export type PropertyAmenity = Database['public']['Tables']['property_amenities']['Row']
export type PropertyAmenityInsert = Database['public']['Tables']['property_amenities']['Insert']
export type PropertyAmenityUpdate = Database['public']['Tables']['property_amenities']['Update']

export type PropertyReview = Database['public']['Tables']['property_reviews']['Row']
export type PropertyReviewInsert = Database['public']['Tables']['property_reviews']['Insert']
export type PropertyReviewUpdate = Database['public']['Tables']['property_reviews']['Update']

export type PropertyFavorite = Database['public']['Tables']['property_favorites']['Row']
export type PropertyFavoriteInsert = Database['public']['Tables']['property_favorites']['Insert']

export type ContactRequest = Database['public']['Tables']['contact_requests']['Row']
export type ContactRequestInsert = Database['public']['Tables']['contact_requests']['Insert']

export type PropertyEstimation = Database['public']['Tables']['property_estimations']['Row']
export type PropertyEstimationInsert = Database['public']['Tables']['property_estimations']['Insert']

// Nouveaux types pour les tables enrichies
export type PointFortPropriete = Database['public']['Tables']['points_forts_propriete']['Row']
export type PointFortProprieteInsert = Database['public']['Tables']['points_forts_propriete']['Insert']
export type PointFortProprieteUpdate = Database['public']['Tables']['points_forts_propriete']['Update']

export type EquipementPropriete = Database['public']['Tables']['equipements_propriete']['Row']
export type EquipementProprieteInsert = Database['public']['Tables']['equipements_propriete']['Insert']
export type EquipementProprieteUpdate = Database['public']['Tables']['equipements_propriete']['Update']

export type AvisPropriete = Database['public']['Tables']['avis_proprietes']['Row']
export type AvisProprieteInsert = Database['public']['Tables']['avis_proprietes']['Insert']
export type AvisProprieteUpdate = Database['public']['Tables']['avis_proprietes']['Update']

export type Agence = Database['public']['Tables']['agences']['Row']
export type AgenceInsert = Database['public']['Tables']['agences']['Insert']
export type AgenceUpdate = Database['public']['Tables']['agences']['Update']

export type AgentImmobilier = Database['public']['Tables']['agents_immobiliers']['Row']
export type AgentImmobilierInsert = Database['public']['Tables']['agents_immobiliers']['Insert']
export type AgentImmobilierUpdate = Database['public']['Tables']['agents_immobiliers']['Update']

export type TypeEquipement = Database['public']['Tables']['types_equipements']['Row']
export type TypeEquipementInsert = Database['public']['Tables']['types_equipements']['Insert']
export type TypeEquipementUpdate = Database['public']['Tables']['types_equipements']['Update']

export type NewsletterSubscription = Database['public']['Tables']['newsletter_subscriptions']['Row']
export type NewsletterSubscriptionInsert = Database['public']['Tables']['newsletter_subscriptions']['Insert']
export type NewsletterSubscriptionUpdate = Database['public']['Tables']['newsletter_subscriptions']['Update']

export type PropertyStatistics = Database['public']['Views']['property_statistics']['Row']

export interface PropertyWithImages extends Property {
  gallery_images?: string[]
}