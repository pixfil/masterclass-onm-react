'use client'

import { useState } from 'react'
import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import { 
  AcademicCapIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'text'
  options?: string[]
  correctAnswer: string | number
  points: number
}

interface EvaluationFormData {
  formation_title: string
  session_date: string
  session_location: string
  user_name: string
  user_email: string
  answers: Record<string, any>
  start_time: number
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Quel est le principe fondamental de l\'orthodontie neuro-musculaire (ONM) ?',
    type: 'multiple_choice',
    options: [
      'Aligner uniquement les dents pour un aspect esthétique',
      'Équilibrer l\'occlusion et la fonction musculaire',
      'Réduire le temps de traitement au maximum',
      'Utiliser exclusivement des appareils fixes'
    ],
    correctAnswer: 1,
    points: 20
  },
  {
    id: 'q2',
    question: 'L\'ONM permet d\'améliorer la fonction respiratoire du patient.',
    type: 'true_false',
    correctAnswer: 'true',
    points: 15
  },
  {
    id: 'q3',
    question: 'Quels sont les principaux outils d\'analyse utilisés en ONM ?',
    type: 'multiple_choice',
    options: [
      'Radiographies panoramiques uniquement',
      'Électromyographie et analyse occlusale',
      'Photographies intra-orales seulement',
      'Examens cliniques visuels'
    ],
    correctAnswer: 1,
    points: 20
  },
  {
    id: 'q4',
    question: 'L\'analyse électromyographique (EMG) est-elle importante en ONM ?',
    type: 'true_false',
    correctAnswer: 'true',
    points: 15
  },
  {
    id: 'q5',
    question: 'Citez deux avantages principaux de l\'approche ONM par rapport à l\'orthodontie traditionnelle.',
    type: 'text',
    correctAnswer: 'Meilleure stabilité des résultats et amélioration de la fonction respiratoire',
    points: 15
  },
  {
    id: 'q6',
    question: 'Quelle est la durée moyenne d\'un traitement ONM ?',
    type: 'multiple_choice',
    options: [
      '3 à 6 mois',
      '12 à 18 mois',
      '2 à 3 ans',
      '4 à 5 ans'
    ],
    correctAnswer: 1,
    points: 15
  }
]

const EvaluationFormPage = () => {
  const [currentStep, setCurrentStep] = useState(0) // 0: info, 1+: questions
  const [formData, setFormData] = useState<EvaluationFormData>({
    formation_title: '',
    session_date: '',
    session_location: '',
    user_name: '',
    user_email: '',
    answers: {},
    start_time: Date.now()
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes en secondes

  const currentQuestion = currentStep > 0 ? quizQuestions[currentStep - 1] : null
  const totalSteps = quizQuestions.length + 1 // +1 pour les infos

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep(1)
    // Démarrer le timer
    setFormData(prev => ({ ...prev, start_time: Date.now() }))
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setFormData(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }))
  }

  const goToNextQuestion = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const goToPrevQuestion = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const calculateScore = () => {
    let totalScore = 0
    let maxScore = 0

    quizQuestions.forEach(question => {
      maxScore += question.points
      const userAnswer = formData.answers[question.id]
      
      if (question.type === 'multiple_choice' && userAnswer === question.correctAnswer) {
        totalScore += question.points
      } else if (question.type === 'true_false' && userAnswer === question.correctAnswer) {
        totalScore += question.points
      } else if (question.type === 'text' && userAnswer && userAnswer.length > 10) {
        // Simulation d'évaluation de texte - en réalité, ce serait évalué manuellement
        totalScore += question.points * 0.8 // 80% des points
      }
    })

    return { totalScore, maxScore, percentage: (totalScore / maxScore) * 100 }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const timeTaken = Math.floor((Date.now() - formData.start_time) / 1000 / 60) // en minutes
      const score = calculateScore()
      
      // Ici on ferait l'appel API pour sauvegarder les données
      // await submitEvaluationForm({ ...formData, timeTaken, score })
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert('Erreur lors de l\'envoi du quiz')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (submitted) {
    const score = calculateScore()
    const passed = score.percentage >= 60

    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-12">
        <div className="max-w-lg mx-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            passed 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-orange-100 dark:bg-orange-900/20'
          }`}>
            {passed ? (
              <TrophyIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : (
              <AcademicCapIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            {passed ? 'Félicitations !' : 'Quiz terminé'}
          </h2>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {score.percentage.toFixed(0)}%
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {score.totalScore} / {score.maxScore} points
            </p>
          </div>

          <div className={`p-4 rounded-lg mb-6 ${
            passed 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
              : 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
          }`}>
            <p className="font-medium">
              {passed 
                ? 'Vous avez réussi le quiz ! Vous êtes éligible pour la certification ONM.'
                : 'Score insuffisant pour la certification. Vous pouvez repasser le quiz après révision.'
              }
            </p>
          </div>

          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            <p>Temps total : {Math.floor((Date.now() - formData.start_time) / 1000 / 60)} minutes</p>
            <p>Note minimale requise : 60%</p>
          </div>

          <Button 
            onClick={() => window.close()}
            className="w-full"
          >
            Fermer
          </Button>
        </div>
      </div>
    )
  }

  // Étape d'information
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-6">
              <AcademicCapIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <span className="text-sm font-medium text-primary-800 dark:text-primary-400">
                Quiz d'évaluation ONM
              </span>
            </div>
            <Heading className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Évaluation post-formation
            </Heading>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Ce quiz vous permettra de valider vos connaissances acquises lors de la formation ONM.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Informations importantes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">30 minutes</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Durée maximum</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">6 questions</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Quiz complet</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <TrophyIcon className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">60% minimum</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Pour réussir</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Formation suivie *
                  </label>
                  <select
                    value={formData.formation_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, formation_title: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    required
                  >
                    <option value="">Sélectionnez votre formation</option>
                    <option value="Formation ONM Niveau 1">Formation ONM Niveau 1</option>
                    <option value="Formation ONM Niveau 2">Formation ONM Niveau 2</option>
                    <option value="Formation ONM Avancée">Formation ONM Avancée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Date de la session *
                  </label>
                  <input
                    type="date"
                    value={formData.session_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, session_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Lieu de la formation *
                  </label>
                  <input
                    type="text"
                    value={formData.session_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, session_location: e.target.value }))}
                    placeholder="Ex: Paris, Lyon, En ligne..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Votre nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.user_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                    placeholder="Dr. Prénom Nom"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Votre email *
                  </label>
                  <input
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                    placeholder="votre.email@exemple.fr"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <Button type="submit" className="w-full">
                  Commencer le quiz
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Questions du quiz
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header avec progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Question {currentStep} sur {quizQuestions.length}
              </span>
              <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {currentQuestion?.points} points
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
              <ClockIcon className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
          {currentQuestion && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                {currentQuestion.question}
              </h2>

              <div className="space-y-4">
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerChange(currentQuestion.id, index)}
                        className={`w-full p-4 text-left border rounded-lg transition-all ${
                          formData.answers[currentQuestion.id] === index
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                      >
                        <span className="text-neutral-900 dark:text-white">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'true_false' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleAnswerChange(currentQuestion.id, 'true')}
                      className={`flex-1 p-4 border rounded-lg transition-all ${
                        formData.answers[currentQuestion.id] === 'true'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <CheckCircleIcon className="h-6 w-6 mx-auto mb-2" />
                      <span className="font-medium">Vrai</span>
                    </button>
                    <button
                      onClick={() => handleAnswerChange(currentQuestion.id, 'false')}
                      className={`flex-1 p-4 border rounded-lg transition-all ${
                        formData.answers[currentQuestion.id] === 'false'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <XCircleIcon className="h-6 w-6 mx-auto mb-2" />
                      <span className="font-medium">Faux</span>
                    </button>
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <textarea
                    value={formData.answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    rows={4}
                    placeholder="Votre réponse..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={goToPrevQuestion}
                  disabled={currentStep === 1}
                  className="flex items-center px-4 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Précédent
                </button>

                <Button
                  onClick={goToNextQuestion}
                  disabled={!formData.answers[currentQuestion.id] || loading}
                  className="flex items-center"
                >
                  {loading ? 'Envoi...' : 
                    currentStep === quizQuestions.length ? 'Terminer le quiz' : 'Suivant'}
                  {currentStep < quizQuestions.length && (
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EvaluationFormPage