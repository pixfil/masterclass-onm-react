# MASTERCLASS ONM - Instructions pour Claude Code

## 🎯 CONTEXTE DU PROJET

**Client :** Orthodontiste spécialisé - https://masterclass-onm.com/
**Objectif :** E-commerce de formations présentielles orthodontiques multi-villes
**Type :** Formations/conférences en présentiel (pas e-learning)
**Expansion :** France puis international  
**Paiement :** LCL Sherlocks (pas Stripe)

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technology
- **Framework :** Next.js 15.3.2 + TypeScript + React 19
- **Base de données :** Supabase (nouveau projet dédié)
- **Paiement :** LCL Sherlocks integration
- **Styling :** Tailwind CSS (réutiliser le design Initiative)
- **Auth :** Supabase Auth avec rôles personnalisés

### Structure Projet
```
masterclass-onm/
├── src/app/
│   ├── (public)/          # Site vitrine formations
│   ├── admin/             # Backoffice manageable
│   └── api/               # APIs métier
├── src/components/
│   ├── ui/                # Composants réutilisés Initiative
│   ├── formations/        # Spécifique e-learning
│   └── admin/             # Interface admin
└── src/lib/
    ├── supabase/          # Nouveau schéma formations
    ├── lcl-sherlocks/     # Intégration bancaire
    └── emails/            # Questionnaires/factures
```

## 📊 SCHÉMA BASE DE DONNÉES E-COMMERCE

### Tables E-commerce Principales
```sql
-- Formations (Produits)
formations (
  id, title, slug, description, duration_days, price, 
  capacity, level, module_number, prerequisites[], 
  learning_objectives[], program_details[], 
  instructor_id, featured_image, gallery_images[], 
  status, seo_title, seo_description, created_at
)

-- Sessions (Dates/Villes)
formation_sessions (
  id, formation_id, start_date, end_date, city, 
  venue_name, venue_address, available_spots, 
  total_spots, price_override, status, created_at
)

-- Panier & Commandes
carts (id, user_id, session_expire, created_at)
cart_items (id, cart_id, session_id, quantity, price_at_time, added_at)

orders (
  id, user_id, order_number, total_amount, tax_amount,
  status, payment_status, billing_address, 
  shipping_address, notes, created_at
)

order_items (
  id, order_id, session_id, formation_title, 
  quantity, unit_price, total_price
)

-- Inscriptions (Post-commande)
registrations (
  id, user_id, order_id, session_id, status, 
  attendance_status, certificate_issued, created_at
)

-- Questionnaires
questionnaires (id, formation_id, type, title, questions[], is_required)
questionnaire_responses (id, user_id, registration_id, questionnaire_id, responses[], score, submitted_at)

-- Utilisateurs E-commerce
user_profiles (
  id, user_id, first_name, last_name, company, 
  phone, profession, experience_level, 
  billing_address, shipping_address, certificates[]
)

-- Formateurs
instructors (id, name, title, bio, specialties[], photo_url, linkedin_url, rating, formations_count)

-- CEPROF (Cercle de spécialistes)
ceprof_members (
  id, name, title, profession, speciality, bio, 
  photo_url, linkedin_url, website_url, 
  city, country, contributions[], 
  featured, display_order, active, created_at
)

-- Paiements LCL
payments (
  id, order_id, amount, currency, lcl_transaction_id, 
  lcl_response, status, payment_method, created_at
)

-- Reviews & Ratings
reviews (id, user_id, formation_id, rating, comment, verified_purchase, created_at)

-- Coupons/Promotions
coupons (id, code, type, value, min_amount, max_uses, used_count, expires_at, active)
```

## 🎨 FONCTIONNALITÉS À DÉVELOPPER

### 1. Frontend Public E-commerce
- **Catalogue formations présentielles** avec filtres ville/date/niveau
- **Système réservation** temps réel avec places disponibles
- **Profils formateurs** avec expertise et avis participants
- **Page CEPROF** - présentation élégante des spécialistes contributeurs
- **Calendrier visuel** formations par région/ville
- **Panier intelligent** avec suggestions formations complémentaires
- **Paiements LCL Sherlocks** sécurisés avec factures
- **Comptes clients** complets avec authentification Supabase
- **Espace personnel** avec historique, certificats, facturation

### 2. Workflows Présentiels & Emails
- **Avant formation :** Email questionnaire pré-formation + infos pratiques
- **Post-paiement :** Facture + confirmation + plan d'accès
- **Rappels :** SMS/Email 48h avant formation avec infos lieu
- **Post-formation :** Questionnaire satisfaction + certificat PDF
- **Suivi :** Email de suivi avec supports de cours
- **Configuration SMTP/Brevo** comme Initiative (réutiliser système existant)
- **Templates emails** personnalisables par type de formation

### 3. Admin Ultra-Manageable
- **Dashboard** avec métriques business en temps réel
- **Planning visuel** façon calendrier pour sessions
- **Gestion formations** création/modification/duplication
- **Gestion participants** avec CRM intégré complet
- **Gestion CEPROF** attribution membres aux spécialités (comme agents)
- **Analytics avancées** (satisfaction, ROI par ville, conversions)
- **Gestion financière** (CA, impayés, remboursements, TVA)
- **Export données** Excel/PDF pour comptabilité
- **Configuration emails** SMTP/Brevo intégrée

### 4. CEPROF - Cercle de Spécialistes
- **Page publique CEPROF** présentation élégante des contributeurs
- **Profils détaillés** kiné, ostéo, etc. + leurs contributions ONM
- **Admin CEPROF** gestion membres (création/modification/attribution)
- **Catégories spécialités** (kinésithérapie, ostéopathie, chirurgie, etc.)
- **Système de featured** mettre en avant certains membres
- **Témoignages/cas** contributions concrètes à l'orthodontie neuro-musculaire

### 5. Multilingue & International
- **Infrastructure i18n** Next.js + react-intl préparée
- **Langues prioritaires** FR (base) + EN (international)
- **Tables traduites** formations, descriptions, emails
- **Admin multilingue** gestion contenus par langue
- **URLs localisées** /fr/, /en/ pour SEO international
- **Devises multiples** EUR, USD, etc. avec taux conversion

### 6. Fonctionnalités Avancées
- **App mobile PWA** pour participants avec QR codes check-in
- **Programme fidélité** remises formations multiples
- **Réseau professionnel** entre participants orthodontistes
- **IA génération** descriptions formations, supports PDF personnalisés

## 💳 INTÉGRATION LCL SHERLOCKS

### Points Clés
- **API LCL Sherlocks** pour paiements sécurisés
- **3D Secure** obligatoire
- **Webhook** notifications paiement
- **Remboursements** automatiques si annulation
- **Réconciliation bancaire** automatique
- **Reporting financier** détaillé

### Configuration
```javascript
// lib/lcl-sherlocks/config.ts
export const LCL_CONFIG = {
  merchant_id: process.env.LCL_MERCHANT_ID,
  api_key: process.env.LCL_API_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'prod' : 'test',
  webhook_secret: process.env.LCL_WEBHOOK_SECRET
}
```

## 👥 GESTION COMPTES CLIENTS

### Système d'Authentification Complet
- **Inscription/Connexion** Supabase Auth (réutiliser Initiative)
- **Profils complets** nom, entreprise, profession, adresses
- **Espace personnel** historique formations, certificats, factures
- **Gestion préférences** notifications, langue, newsletter
- **Mot de passe oublié** workflow automatique
- **Vérification email** obligatoire avant première commande

### Fonctionnalités Clients
- **Dashboard personnel** formations suivies/à venir
- **Bibliothèque certificats** téléchargement PDF
- **Historique commandes** avec re-téléchargement factures
- **Recommandations** formations selon profil/historique
- **Programme fidélité** points/remises selon fréquentation

## 🎯 COMPOSANTS À RÉUTILISER

### Depuis Initiative Immobilier
- **Components UI :** Button, Input, Heading, Modal, Card
- **AdminLayout :** Structure sidebar + header moderne
- **Système auth complet :** Login/register/rôles/profils
- **Upload images :** Pour photos formateurs/formations/CEPROF
- **Analytics tracker :** Adaptation pour formations
- **SEO components :** Meta tags dynamiques
- **Email system SMTP/Brevo :** Templates adaptés formations

### À Adapter
- **PropertyForm** → **FormationForm**
- **PropertyListing** → **FormationCatalog**
- **PropertyDetail** → **FormationDetail**
- **AdminProperties** → **AdminFormations**

## 📋 PRIORITÉS DÉVELOPPEMENT

### Phase 1 - MVP E-commerce (2-3 semaines)
1. Nettoyage code Initiative → base propre
2. Schéma DB formations + comptes clients
3. Système auth complet (inscription/connexion)
4. Catalogue formations public avec panier
5. Admin gestion formations/sessions
6. Intégration LCL paiements + commandes

### Phase 2 - Workflows & CEPROF (2 semaines)
1. Espace personnel clients complet
2. Questionnaires pré/post formation
3. Génération factures/certificats automatique
4. Page CEPROF publique + admin
5. Emails automatiques SMTP/Brevo
6. Analytics de base

### Phase 3 - Avancé & International (3-4 semaines)
1. Planning visuel admin
2. CRM participants avancé
3. Infrastructure multilingue (i18n)
4. PWA mobile + QR codes
5. Programme fidélité
6. Analytics avancées + exports

## 🚀 ACTIONS IMMÉDIATES

1. **Copier projet Initiative** vers `masterclass-onm/`
2. **Créer nouveau Supabase** projet pour Masterclass
3. **Nettoyer code** - supprimer immobilier, garder UI
4. **Créer structure** e-learning vierge
5. **Configurer environnement** variables

## 💡 IDÉES INNOVATION

- **IA assistant** aide sélection formations
- **Réalité augmentée** pour formations pratiques
- **Blockchain** certificats infalsifiables
- **API RESTful** pour partenaires externes
- **Chatbot** support 24/7 participants
- **Système mentoring** entre participants expérimentés/débutants

---

**Note :** Ce fichier sera la référence complète pour développer la plateforme Masterclass ONM. Conserver précieusement et copier dans le nouveau projet !