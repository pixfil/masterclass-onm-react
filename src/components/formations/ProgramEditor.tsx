'use client'

import React, { useState } from 'react'
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Input from '@/shared/Input'
import Textarea from '@/shared/Textarea'
import ButtonSecondary from '@/shared/ButtonSecondary'

export interface DayProgram {
  day: string
  title: string
  topics: {
    title: string
    description: string
    duration: string
  }[]
}

export interface FormationProgram {
  objectives: string[]
  curriculum: DayProgram[]
  prerequisites: string[]
  includes: string[]
}

interface ProgramEditorProps {
  value: FormationProgram
  onChange: (program: FormationProgram) => void
  durationDays: number
}

const ProgramEditor: React.FC<ProgramEditorProps> = ({ value, onChange, durationDays }) => {
  const [expandedDays, setExpandedDays] = useState<number[]>([0])

  // Initialiser le programme avec le bon nombre de jours
  React.useEffect(() => {
    if (!value.curriculum || value.curriculum.length !== durationDays) {
      const newCurriculum: DayProgram[] = []
      for (let i = 0; i < durationDays; i++) {
        newCurriculum.push(
          value.curriculum?.[i] || {
            day: `Jour ${i + 1}`,
            title: '',
            topics: []
          }
        )
      }
      onChange({
        ...value,
        curriculum: newCurriculum
      })
    }
  }, [durationDays])

  const toggleDay = (index: number) => {
    setExpandedDays(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...(value.objectives || [])]
    newObjectives[index] = value
    onChange({ ...value, objectives: newObjectives })
  }

  const addObjective = () => {
    onChange({ 
      ...value, 
      objectives: [...(value.objectives || []), ''] 
    })
  }

  const removeObjective = (index: number) => {
    const newObjectives = (value.objectives || []).filter((_, i) => i !== index)
    onChange({ ...value, objectives: newObjectives })
  }

  const updatePrerequisite = (index: number, val: string) => {
    const newPrerequisites = [...(value.prerequisites || [])]
    newPrerequisites[index] = val
    onChange({ ...value, prerequisites: newPrerequisites })
  }

  const addPrerequisite = () => {
    onChange({ 
      ...value, 
      prerequisites: [...(value.prerequisites || []), ''] 
    })
  }

  const removePrerequisite = (index: number) => {
    const newPrerequisites = (value.prerequisites || []).filter((_, i) => i !== index)
    onChange({ ...value, prerequisites: newPrerequisites })
  }

  const updateInclude = (index: number, val: string) => {
    const newIncludes = [...(value.includes || [])]
    newIncludes[index] = val
    onChange({ ...value, includes: newIncludes })
  }

  const addInclude = () => {
    onChange({ 
      ...value, 
      includes: [...(value.includes || []), ''] 
    })
  }

  const removeInclude = (index: number) => {
    const newIncludes = (value.includes || []).filter((_, i) => i !== index)
    onChange({ ...value, includes: newIncludes })
  }

  const updateDayTitle = (dayIndex: number, title: string) => {
    const newCurriculum = [...(value.curriculum || [])]
    newCurriculum[dayIndex] = { ...newCurriculum[dayIndex], title }
    onChange({ ...value, curriculum: newCurriculum })
  }

  const addTopic = (dayIndex: number) => {
    const newCurriculum = [...(value.curriculum || [])]
    newCurriculum[dayIndex].topics.push({
      title: '',
      description: '',
      duration: ''
    })
    onChange({ ...value, curriculum: newCurriculum })
  }

  const updateTopic = (dayIndex: number, topicIndex: number, field: string, val: string) => {
    const newCurriculum = [...(value.curriculum || [])]
    newCurriculum[dayIndex].topics[topicIndex] = {
      ...newCurriculum[dayIndex].topics[topicIndex],
      [field]: val
    }
    onChange({ ...value, curriculum: newCurriculum })
  }

  const removeTopic = (dayIndex: number, topicIndex: number) => {
    const newCurriculum = [...(value.curriculum || [])]
    newCurriculum[dayIndex].topics = newCurriculum[dayIndex].topics.filter((_, i) => i !== topicIndex)
    onChange({ ...value, curriculum: newCurriculum })
  }

  return (
    <div className="space-y-6">
      {/* Objectifs d'apprentissage */}
      <div>
        <h4 className="text-base font-medium text-neutral-900 dark:text-white mb-3">
          Objectifs d'apprentissage
        </h4>
        <div className="space-y-2">
          {(value.objectives || []).map((objective, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={objective}
                onChange={(e) => updateObjective(index, e.target.value)}
                placeholder="Ex: Maîtriser l'approche pluridisciplinaire de l'ONM"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeObjective(index)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <ButtonSecondary
            type="button"
            onClick={addObjective}
            sizeClass="py-2 px-4"
            className="text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Ajouter un objectif
          </ButtonSecondary>
        </div>
      </div>

      {/* Programme par jour */}
      <div>
        <h4 className="text-base font-medium text-neutral-900 dark:text-white mb-3">
          Programme détaillé
        </h4>
        <div className="space-y-3">
          {(value.curriculum || []).map((day, dayIndex) => (
            <div key={dayIndex} className="border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleDay(dayIndex)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {day.day}
                  </span>
                  {day.title && (
                    <span className="text-neutral-600 dark:text-neutral-400">
                      - {day.title}
                    </span>
                  )}
                </div>
                {expandedDays.includes(dayIndex) ? (
                  <ChevronUpIcon className="h-5 w-5 text-neutral-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-neutral-500" />
                )}
              </button>

              {expandedDays.includes(dayIndex) && (
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
                  <Input
                    value={day.title}
                    onChange={(e) => updateDayTitle(dayIndex, e.target.value)}
                    placeholder="Titre du jour (ex: Fondamentaux et Classe III)"
                  />

                  {/* Sujets du jour */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Sujets abordés
                    </label>
                    {day.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={topic.title}
                            onChange={(e) => updateTopic(dayIndex, topicIndex, 'title', e.target.value)}
                            placeholder="Titre du sujet"
                            className="flex-1"
                          />
                          <Input
                            value={topic.duration}
                            onChange={(e) => updateTopic(dayIndex, topicIndex, 'duration', e.target.value)}
                            placeholder="Durée (ex: 2h)"
                            className="w-24"
                          />
                          <button
                            type="button"
                            onClick={() => removeTopic(dayIndex, topicIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <Textarea
                          value={topic.description}
                          onChange={(e) => updateTopic(dayIndex, topicIndex, 'description', e.target.value)}
                          placeholder="Description détaillée du sujet..."
                          rows={3}
                        />
                      </div>
                    ))}
                    <ButtonSecondary
                      type="button"
                      onClick={() => addTopic(dayIndex)}
                      sizeClass="py-2 px-4"
                      className="text-sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Ajouter un sujet
                    </ButtonSecondary>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Prérequis */}
      <div>
        <h4 className="text-base font-medium text-neutral-900 dark:text-white mb-3">
          Prérequis
        </h4>
        <div className="space-y-2">
          {(value.prerequisites || []).map((prerequisite, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={prerequisite}
                onChange={(e) => updatePrerequisite(index, e.target.value)}
                placeholder="Ex: Être chirurgien-dentiste ou orthodontiste diplômé"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removePrerequisite(index)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <ButtonSecondary
            type="button"
            onClick={addPrerequisite}
            sizeClass="py-2 px-4"
            className="text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Ajouter un prérequis
          </ButtonSecondary>
        </div>
      </div>

      {/* Ce qui est inclus */}
      <div>
        <h4 className="text-base font-medium text-neutral-900 dark:text-white mb-3">
          Ce qui est inclus
        </h4>
        <div className="space-y-2">
          {(value.includes || []).map((include, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={include}
                onChange={(e) => updateInclude(index, e.target.value)}
                placeholder="Ex: Support de cours complet"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeInclude(index)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <ButtonSecondary
            type="button"
            onClick={addInclude}
            sizeClass="py-2 px-4"
            className="text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Ajouter un élément inclus
          </ButtonSecondary>
        </div>
      </div>
    </div>
  )
}

export default ProgramEditor