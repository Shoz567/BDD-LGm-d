'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Check, Printer, Mail, Home, GripVertical } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Footer } from '@/components/layout/footer'
import { ChatWidget } from '@/components/chat-widget'
import { Button } from '@/components/ui/button'
import { PathwayCard } from '@/components/pathway-card'
import { cn } from '@/lib/utils'
import { questionnaireSteps, pathways, calculateGIR } from '@/lib/data'

const TOTAL_STEPS = questionnaireSteps.length + 1 // +1 for priorities step

export default function QuestionnairePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [priorities, setPriorities] = useState<string[]>([
    'aide-marche',
    'salle-de-bain',
    'chambre'
  ])
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = questionnaireSteps[currentStep - 1]
  const isPrioritiesStep = currentStep === TOTAL_STEPS

  const canProceed = isPrioritiesStep || answers[currentStep] !== undefined

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: optionId }))
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newPriorities = [...priorities]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < priorities.length) {
      [newPriorities[index], newPriorities[newIndex]] = [newPriorities[newIndex], newPriorities[index]]
      setPriorities(newPriorities)
    }
  }

  // Calculate total score and GIR
  const { totalScore, girResult, dimensionScores } = useMemo(() => {
    let total = 0
    const scores: Record<string, number> = {}
    const dimensions = ['Mobilité', 'Toilette', 'Transferts', 'Habillage', 'Alimentation', 'Continence', 'Orientation', 'Communication', 'Comportement']

    questionnaireSteps.forEach((step, i) => {
      const answer = answers[i + 1]
      if (answer) {
        const option = step.options.find(o => o.id === answer)
        if (option) {
          total += option.value
          scores[dimensions[i]] = option.value
        }
      }
    })

    return {
      totalScore: total,
      girResult: calculateGIR(total),
      dimensionScores: scores
    }
  }, [answers])

  if (showResults) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <TopBar showModeSwitch={false} />

        <main className="flex-1 py-8 lg:py-12">
          <div className="max-w-3xl mx-auto px-4 lg:px-6">
            {/* GIR Banner */}
            <div 
              className={cn(
                'rounded-2xl p-8 text-center mb-8',
                girResult.category === 'fragile' && 'bg-gir-fragile text-white',
                girResult.category === 'moderate' && 'bg-gir-moderate text-white',
                girResult.category === 'severe' && 'bg-gir-severe text-white'
              )}
            >
              <p className="text-sm font-medium uppercase tracking-wide opacity-80 mb-2">
                Niveau d&apos;autonomie estimé
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                GIR {girResult.level}
              </h1>
              <p className="text-lg opacity-90">
                {girResult.level <= 2 && 'Dépendance importante — Accompagnement renforcé nécessaire'}
                {girResult.level >= 3 && girResult.level <= 4 && 'Dépendance modérée — Aides techniques recommandées'}
                {girResult.level >= 5 && 'Autonomie préservée — Prévention et confort'}
              </p>
            </div>

            {/* KPI boxes */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-elevated rounded-xl border border-border p-6 text-center">
                <p className="text-sm text-text-secondary mb-1">Niveau GIR</p>
                <p className="text-3xl font-bold text-text-primary">{girResult.level}</p>
              </div>
              <div className="bg-surface-elevated rounded-xl border border-border p-6 text-center">
                <p className="text-sm text-text-secondary mb-1">Logique de soin</p>
                <p className="text-3xl font-bold text-text-primary capitalize">{girResult.category === 'severe' ? 'Intensif' : girResult.category === 'moderate' ? 'Adapté' : 'Préventif'}</p>
              </div>
            </div>

            {/* Dimension scores */}
            <div className="bg-surface-elevated rounded-2xl border border-border p-6 mb-8">
              <h2 className="font-semibold text-text-primary mb-4">Scores par dimension</h2>
              <div className="space-y-3">
                {Object.entries(dimensionScores).map(([dimension, score]) => (
                  <div key={dimension} className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary w-28 shrink-0">{dimension}</span>
                    <div className="flex-1 h-3 bg-surface-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(score / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary w-8 text-right">{score}/4</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended pathways */}
            <div className="mb-8">
              <h2 className="font-semibold text-text-primary mb-4">Parcours recommandés</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {priorities.slice(0, 3).map((slug) => {
                  const pathway = pathways.find(p => p.slug === slug)
                  if (!pathway) return null
                  return <PathwayCard key={slug} pathway={pathway} />
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" className="rounded-xl border-border-strong gap-2">
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>
              <Button variant="outline" className="rounded-xl border-border-strong gap-2">
                <Mail className="w-4 h-4" />
                Envoyer par mail
              </Button>
              <Link href="/">
                <Button className="rounded-xl bg-primary hover:bg-primary-light gap-2">
                  <Home className="w-4 h-4" />
                  Retour à l&apos;accueil
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
        <ChatWidget />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar showModeSwitch={false} />

      {/* Progress bar */}
      <div className="sticky top-[112px] z-40 bg-surface border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">
              Étape {currentStep} / {TOTAL_STEPS}
            </span>
            <span className="px-3 py-1 bg-primary-soft text-primary text-sm font-medium rounded-full">
              Questionnaire autonomie
            </span>
          </div>
          <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto px-4 lg:px-6">
          {isPrioritiesStep ? (
            /* Priorities step */
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-4 text-balance">
                Classez les parcours par priorité
              </h1>
              <p className="text-text-secondary mb-8">
                Organisez les parcours de soins selon les besoins prioritaires du patient.
              </p>

              <div className="space-y-3 mb-8">
                {priorities.map((slug, index) => {
                  const pathway = pathways.find(p => p.slug === slug)
                  if (!pathway) return null
                  return (
                    <div 
                      key={slug}
                      className="flex items-center gap-4 p-4 bg-surface-elevated rounded-xl border border-border shadow-warm"
                    >
                      <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-left font-medium text-text-primary">
                        {pathway.nom}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => movePriority(index, 'up')}
                          disabled={index === 0}
                          className="p-2 rounded-lg hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4 rotate-90" />
                        </button>
                        <button
                          onClick={() => movePriority(index, 'down')}
                          disabled={index === priorities.length - 1}
                          className="p-2 rounded-lg hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </button>
                      </div>
                      <GripVertical className="w-5 h-5 text-text-tertiary" />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Question step */
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-8 text-balance">
                {currentQuestion.question}
              </h1>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentStep] === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={cn(
                        'w-full p-5 rounded-2xl border-2 text-left transition-all duration-200',
                        'hover:shadow-warm-md hover:-translate-y-0.5',
                        isSelected
                          ? 'border-primary bg-primary-soft'
                          : 'border-border bg-surface-elevated hover:border-border-strong'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-border-strong'
                        )}>
                          {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                        </div>
                        <span className={cn(
                          'text-lg font-medium',
                          isSelected ? 'text-primary' : 'text-text-primary'
                        )}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-surface-elevated border-t border-border">
        <div className="max-w-2xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="rounded-xl gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="rounded-xl bg-primary hover:bg-primary-light gap-2"
          >
            {isPrioritiesStep ? 'Voir les résultats' : 'Suivant'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Footer />
      <ChatWidget />
    </div>
  )
}
