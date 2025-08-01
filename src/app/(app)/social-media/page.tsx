'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  LightBulbIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  BeakerIcon,
  UserCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

// Types de posts
type PostType = 'single' | 'carousel' | 'video'
type Category = 'interviews' | 'mythes' | 'techniques' | 'portraits' | 'savoir' | 'all'

interface Post {
  id: string
  type: PostType
  category: Category
  title: string
  subtitle?: string
  content: string | string[]
  image: string | string[]
  likes: number
  comments: number
  isLiked: boolean
  isSaved: boolean
  bgPattern?: string
  textStyle?: string
  author?: {
    name: string
    title: string
    image?: string
  }
}

// Patterns et styles créatifs
const bgPatterns = {
  dots: 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]',
  grid: 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]',
  waves: 'bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 30q15-10 30 0t30 0" stroke="%23e5e7eb" fill="none"/%3E%3C/svg%3E")]',
  circles: 'bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]'
}

// Données mockées avec plus de créativité
const mockPosts: Post[] = [
  {
    id: '1',
    type: 'carousel',
    category: 'mythes',
    title: '🧠 Mythes & Réalités',
    subtitle: 'Déconstruisons les idées reçues !',
    content: [
      '💭 "Mon enfant parlera quand il sera prêt"\n\n❌ MYTHE !\n\n✅ L\'intervention précoce peut faire toute la différence. N\'attendez pas !',
      '🌍 "Le bilinguisme retarde le langage"\n\n❌ FAUX !\n\n✅ C\'est une richesse cognitive qui stimule le cerveau différemment.',
      '📱 "Les écrans aident au développement"\n\n❌ ATTENTION !\n\n✅ Rien ne remplace l\'interaction humaine et le jeu libre.'
    ],
    image: ['/images/formation-default.svg', '/images/formation-default.svg', '/images/formation-default.svg'],
    likes: 342,
    comments: 28,
    isLiked: false,
    isSaved: false,
    bgPattern: 'dots'
  },
  {
    id: '2',
    type: 'single',
    category: 'interviews',
    title: '🎤 3 Questions à...',
    subtitle: 'Dr. Marie Dubois',
    content: '"L\'orthophonie moderne, c\'est allier science et créativité. Chaque patient est unique, chaque parcours est une aventure."',
    image: '/images/formation-default.svg',
    likes: 567,
    comments: 45,
    isLiked: true,
    isSaved: false,
    author: {
      name: 'Dr. Marie Dubois',
      title: '20 ans d\'expérience • Spécialiste TSA'
    },
    textStyle: 'italic'
  },
  {
    id: '3',
    type: 'single',
    category: 'techniques',
    title: '💡 Astuce du Jour',
    subtitle: 'La méthode PROMPT',
    content: '👆 Utilisez le toucher pour guider !\n\n1️⃣ Placez délicatement vos doigts\n2️⃣ Guidez la production des sons\n3️⃣ Renforcez positivement\n\n💪 La magie du tactile !',
    image: '/images/formation-default.svg',
    likes: 892,
    comments: 67,
    isLiked: false,
    isSaved: true,
    bgPattern: 'grid'
  },
  {
    id: '4',
    type: 'carousel',
    category: 'savoir',
    title: '🤯 Le Saviez-Vous ?',
    subtitle: 'Faits surprenants',
    content: [
      '📊 À 2 ans, un enfant connaît en moyenne 200-300 mots\n\nMais certains en connaissent 50, d\'autres 500 !\n\n✨ Chaque enfant est unique',
      '🧠 Le cerveau traite le langage dans 2 hémisphères\n\nGauche : grammaire et vocabulaire\nDroit : intonation et contexte',
      '💬 70% de notre communication est non-verbale\n\nGestes, expressions, posture...\n\n👀 Observez autant que vous écoutez !'
    ],
    image: ['/images/formation-default.svg', '/images/formation-default.svg', '/images/formation-default.svg'],
    likes: 445,
    comments: 23,
    isLiked: false,
    isSaved: false,
    bgPattern: 'waves'
  },
  {
    id: '5',
    type: 'video',
    category: 'portraits',
    title: '✨ Portrait Inspirant',
    subtitle: 'Sophie, libérale épanouie',
    content: '"J\'ai transformé ma pratique grâce à l\'approche neuro-développementale. Mes patients progressent, et moi aussi !"',
    image: '/images/formation-default.svg',
    likes: 1203,
    comments: 89,
    isLiked: true,
    isSaved: true,
    author: {
      name: 'Sophie Martin',
      title: 'Cabinet libéral • Paris'
    }
  },
  {
    id: '6',
    type: 'single',
    category: 'techniques',
    title: '🎯 Outil Pratique',
    subtitle: 'Tableau de motivation',
    content: '⭐ Créez un système visuel !\n\n✓ Objectifs clairs\n✓ Récompenses immédiates\n✓ Progression visible\n\n📥 Template gratuit en bio !',
    image: '/images/formation-default.svg',
    likes: 678,
    comments: 34,
    isLiked: false,
    isSaved: false,
    bgPattern: 'circles'
  }
]

const categories = [
  { id: 'all', label: 'Tous', icon: SparklesIcon },
  { id: 'interviews', label: 'Interviews Express', icon: MicrophoneIcon },
  { id: 'mythes', label: 'Mythes & Réalités', icon: LightBulbIcon },
  { id: 'techniques', label: 'Techniques & Outils', icon: BeakerIcon },
  { id: 'portraits', label: 'Portraits Inspirants', icon: UserCircleIcon },
  { id: 'savoir', label: 'Le Saviez-Vous ?', icon: AcademicCapIcon }
]

export default function SocialMediaPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [carouselIndexes, setCarouselIndexes] = useState<{[key: string]: number}>({})

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory)

  const handleLike = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ))
  }

  const handleSave = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ))
  }

  const handleCarouselNav = (postId: string, direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation()
    const post = posts.find(p => p.id === postId)
    if (!post || post.type !== 'carousel') return

    const currentIndex = carouselIndexes[postId] || 0
    const contentLength = Array.isArray(post.content) ? post.content.length : 1
    
    setCarouselIndexes(prev => ({
      ...prev,
      [postId]: direction === 'prev' 
        ? (currentIndex === 0 ? contentLength - 1 : currentIndex - 1)
        : (currentIndex === contentLength - 1 ? 0 : currentIndex + 1)
    }))
  }

  const PostCard = ({ post }: { post: Post }) => {
    const currentIndex = carouselIndexes[post.id] || 0

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm hover:shadow-xl transition-shadow overflow-hidden"
      >
        {/* Image/Content Area */}
        <div className="relative aspect-square bg-neutral-50 dark:bg-neutral-900">
          {post.type === 'carousel' ? (
            <>
              <div className={`absolute inset-0 ${bgPatterns[post.bgPattern as keyof typeof bgPatterns] || ''}`} />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-cyan-600/90" />
              <div className="relative z-10 h-full p-8 flex flex-col justify-center text-white">
                <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
                {post.subtitle && <p className="text-lg mb-6 opacity-90">{post.subtitle}</p>}
                <div className="flex-1 flex items-center">
                  <p className="text-lg leading-relaxed whitespace-pre-line">
                    {Array.isArray(post.content) ? post.content[currentIndex] : post.content}
                  </p>
                </div>
              </div>
              
              {/* Carousel Navigation */}
              <button
                onClick={(e) => handleCarouselNav(post.id, 'prev', e)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition-all"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => handleCarouselNav(post.id, 'next', e)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition-all"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              
              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {Array.isArray(post.content) && post.content.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCarouselIndexes(prev => ({ ...prev, [post.id]: idx }))
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : post.type === 'video' ? (
            <div className="relative h-full group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <Image
                src={post.image as string}
                alt={post.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 group-hover:bg-white rounded-full p-4 transform group-hover:scale-110 transition-all shadow-lg">
                  <PlayIcon className="h-8 w-8 text-neutral-900" />
                </div>
              </div>
              {post.author && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4">
                    <h3 className="font-bold text-lg mb-1">{post.title}</h3>
                    <p className="text-sm text-neutral-600 mb-2">{post.subtitle}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{post.author.name}</p>
                        <p className="text-xs text-neutral-500">{post.author.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-full">
              <div className={`absolute inset-0 ${bgPatterns[post.bgPattern as keyof typeof bgPatterns] || ''}`} />
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900" />
              <div className="relative z-10 h-full p-8 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                    {post.title}
                  </h3>
                  {post.subtitle && (
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      {post.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex-1 flex items-center">
                  <p className={`text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line ${
                    post.textStyle === 'italic' ? 'italic text-lg' : ''
                  }`}>
                    {post.content}
                  </p>
                </div>
                {post.author && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <UserCircleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {post.author.name}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {post.author.title}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1.5 hover:scale-110 transition-transform"
              >
                {post.isLiked ? (
                  <HeartIconSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 hover:text-red-500 transition-colors" />
                )}
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <ChatBubbleOvalLeftIcon className="h-6 w-6" />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>
              <button className="hover:text-blue-600 hover:scale-110 transition-all">
                <PaperAirplaneIcon className="h-6 w-6 -rotate-45" />
              </button>
            </div>
            <button
              onClick={() => handleSave(post.id)}
              className={`hover:scale-110 transition-transform ${
                post.isSaved ? 'text-blue-600' : 'hover:text-blue-600'
              }`}
            >
              <BookmarkIcon className={`h-6 w-6 ${post.isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Inspiration Quotidienne
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-600 dark:text-neutral-400"
          >
            Découvrez nos contenus créatifs pour enrichir votre pratique
          </motion.p>
        </div>

        {/* Category Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as Category)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:shadow-md hover:scale-105'
                }`}
              >
                <Icon className="h-5 w-5" />
                {category.label}
              </button>
            )
          })}
        </motion.div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </AnimatePresence>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">
                Rejoignez notre communauté !
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Plus de 10 000 orthophonistes nous suivent déjà sur Instagram
              </p>
              <button className="group bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center gap-2">
                @masterclass_onm
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}