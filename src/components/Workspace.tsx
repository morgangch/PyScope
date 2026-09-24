import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  GraduationCap,
  HelpCircle,
  Layers3,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  Search,
  Sparkles,
  X,
  Box,
  CheckCircle2,
  LoaderCircle,
  PanelLeftClose,
} from 'lucide-react';
import { exercises } from '../../exercises';
import type { Exercise, Step } from '../engine/types';
import { useTrace } from '../engine/useTrace';
import { readProgress, saveProgress } from '../storage';
import { CodePanel } from './CodePanel';
import { StackPanel } from './StackPanel';
import { MemoryPanel } from './MemoryPanel';
import { displayValue } from './ValueView';

import { resolveQuestions } from '../engine/questions';
import { notions, levelLabels, difficultyLabels } from '../curriculum/notions';
const eventLabels = {
  line: 'Ligne à exécuter',
  call: 'Nouvel appel',
  return: 'Valeur de retour',
  output: 'Sortie standard',
  error: 'Exception Python',
  end: 'Programme terminé',
};
export function Workspace({
  exercise,
  savedPositions,
  onProgress,
}: {
  exercise: Exercise;
  savedPositions: Record<string, number>;
  onProgress: (key: string, index: number, done: boolean) => void;
}) {
  const [variant, setVariant] = useState(exercise.variants?.[0]?.id || 'default');
  const selectedVariant = exercise.variants?.find((v) => v.id === variant);
  const initial = { ...exercise.initial, ...selectedVariant?.initial };
  const [attempt, setAttempt] = useState(0);
  const { trace, status, failure } = useTrace(exercise.code, initial, attempt, exercise.freeCode);
  const progressKey = `${exercise.id}:${variant}`;
  const [index, setIndex] = useState(savedPositions[progressKey] || 0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hints, setHints] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [skipped, setSkipped] = useState<string[]>([]);
  const steps = trace?.steps || [];
  const safeIndex = Math.min(index, Math.max(steps.length - 1, 0));
  const step = steps[safeIndex];
  const previous = steps[safeIndex - 1];
  const finished = !!step && safeIndex === steps.length - 1;
  const verified = useMemo(() => resolveQuestions(exercise, trace), [exercise, trace]);
  const legacy = step?.event === 'line' ? exercise.questions?.find(q => q.line === step.line) : undefined;
  const question = hints ? verified.find(q => q.stepIndex === safeIndex) || (legacy ? {...legacy, id: `legacy-${legacy.line}`, stepIndex: safeIndex} : undefined) : undefined;
  const waiting =
    !!question && answers[question.id] === undefined && !skipped.includes(question.id);
  const progressCallback = useRef(onProgress);
  progressCallback.current = onProgress;
  useEffect(() => {
    if (step) progressCallback.current(progressKey, safeIndex, finished && !trace?.error);
  }, [progressKey, safeIndex, finished, step, trace?.error]);
  useEffect(() => {
    if (!playing || !step || finished || waiting) {
      if (finished || waiting) setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setIndex(safeIndex + 1), 1100 / speed);
    return () => clearTimeout(timer);
  }, [playing, safeIndex, speed, finished, step, waiting]);
  function next() {
    if (!waiting) setIndex(Math.min(safeIndex + 1, steps.length - 1));
  }
  useEffect(() => {
    function keyboard(e: KeyboardEvent) {
      if ((e.target as HTMLElement).closest('input, select, textarea, button, a, dialog')) return;
      if (e.key === 'ArrowRight' && step && !finished && !waiting) {
        e.preventDefault();
        setPlaying(false);
        setIndex(safeIndex + 1);
      }
      if (e.key === 'ArrowLeft' && safeIndex > 0) {
        e.preventDefault();
        setPlaying(false);
        setIndex(safeIndex - 1);
      }
      if (e.code === 'Space' && step && !finished && !waiting) {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    }
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [safeIndex, step, finished, waiting]);
  const customExplanation =
    step &&
    exercise.explanations?.find(
      (e) =>
        (!e.event || e.event === step.event) &&
        (!e.line || e.line === step.line) &&
        (!e.functionName || e.functionName === step.functionName),
    );
  return (
    <>
      <div className="lesson-heading">
        <div>
          <div className="eyebrow">
            <span>{exercise.freeCode ? 'CODE LIBRE' : 'ATELIER NSI'}</span>
            <span className="eyebrow-separator" />
            {exercise.themes.join(' · ')}
          </div>
          <h1>
            {exercise.title}
            <span className="title-dot">.</span>
          </h1>
          <p>{exercise.instruction}</p>
        </div>
        <div className="level-tag">
          <GraduationCap size={15} /> {levelLabels[exercise.recommendedLevel]}
        </div>
      </div>
      <div className="learning-meta"><strong>Objectif : {exercise.objective}</strong><span>{difficultyLabels[exercise.difficulty]}</span><p>Prérequis conseillés, sans verrouillage : {exercise.prerequisites.map(id => notions[id]).join(' · ') || 'Aucun'}</p></div>
      {exercise.questionSpecs && trace && <p className="verification-note" role="status">{verified.length} / {exercise.questionSpecs.length} questions vérifiées sur la trace réelle.{verified.length !== exercise.questionSpecs.length ? ' Les questions non vérifiables sont masquées.' : ''}</p>}
      <div className="lesson-toolbar">
        <div className="mode-label">
          <span className="green-dot" /> Mode exploration <span>·</span> Python réel
        </div>
        <div className="toolbar-options">
          {exercise.variants && (
            <select
              aria-label="Cas de recherche"
              value={variant}
              onChange={(e) => {
                setPlaying(false);
                setVariant(e.target.value);
                setIndex(savedPositions[`${exercise.id}:${e.target.value}`] || 0);
              }}
            >
              {exercise.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          )}
          <label className="hint-toggle">
            <input type="checkbox" checked={hints} onChange={(e) => setHints(e.target.checked)} />
            <Lightbulb size={15} /> Coups de pouce
          </label>
        </div>
      </div>
      {!step && (
        <div className={`engine-status ${failure ? 'failure' : ''}`} role="status">
          {failure ? <HelpCircle size={19} /> : <LoaderCircle className="spin" size={19} />}
          <span>
            {failure || status}
            <small>
              {failure
                ? 'La navigation reste disponible.'
                : 'Le moteur est hébergé avec le site. Le premier chargement peut prendre quelques secondes.'}
            </small>
          </span>
          {failure && <button onClick={() => setAttempt((a) => a + 1)}>Réessayer</button>}
        </div>
      )}
      {trace?.error && <div role="alert" className="engine-status failure"><span>Exécution interrompue : {trace.error}<small>Les étapes déjà enregistrées restent consultables. Le programme n’est pas marqué comme terminé.</small></span></div>}
      <div className="workspace-grid">
        <CodePanel code={exercise.code} step={step} id={exercise.id} />
        <StackPanel step={step} previous={previous} />
        <MemoryPanel step={step} previous={previous} exercise={exercise} />
      </div>
      <div
        className={`context-bar ${step?.event === 'error' ? 'context-error' : ''}`}
        aria-live="polite"
      >
        <span className="context-icon">
          {finished ? <CheckCircle2 size={19} /> : <Lightbulb size={19} />}
        </span>
        <div>
          <strong>
            {step ? eventLabels[step.event] : 'Prêt à explorer ?'}
            {step && step.event !== 'end' && <span> · ligne {step.line}</span>}
          </strong>
          <p>{step?.error || step?.explanation || (hints && customExplanation?.text) || explanation(step)}</p>
        </div>
        <span className="context-counter">{step ? `${safeIndex + 1} / ${steps.length}` : '…'}</span>
      </div>
      {question && (
        <div className="question-card">
          <div>
            <Sparkles size={17} />
            <strong>À votre avis…</strong>
            <span>{question.prompt}</span>
          </div>
          <div className="question-choices">
            {question.choices.map((choice, i) => (
              <button
                key={choice}
                onClick={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
                aria-pressed={answers[question.id] === i}
              >
                {answers[question.id] === i && <Check size={14} />}
                {choice}
              </button>
            ))}
            <button
              className="skip-question"
              onClick={() => setSkipped((s) => [...s, question.id])}
            >
              Passer la question
            </button>
          </div>
          {answers[question.id] !== undefined && (
            <p role="status">
              {answers[question.id] === question.answer ? 'Bien vu ! ' : 'Pas tout à fait. '}
              {question.explanation}
            </p>
          )}
        </div>
      )}
      <div className="playback">
        <div className="timeline-row">
          <span>PARCOURS D’EXÉCUTION</span>
          <input
            aria-label="Étape d’exécution"
            type="range"
            min={0}
            max={Math.max(0, steps.length - 1)}
            value={safeIndex}
            disabled={!step}
            onChange={(e) => {
              setPlaying(false);
              setIndex(Number(e.target.value));
            }}
            style={
              {
                '--progress': `${steps.length > 1 ? (safeIndex / (steps.length - 1)) * 100 : 0}%`,
              } as React.CSSProperties
            }
          />
          <span>{steps.length ? Math.round(((safeIndex + 1) / steps.length) * 100) : 0} %</span>
        </div>
        <div className="playback-controls">
          <button
            className="restart-button"
            disabled={!step}
            onClick={() => {
              setPlaying(false);
              setIndex(0);
              setAnswers({});
              setSkipped([]);
            }}
          >
            <RotateCcw size={16} />
            <span>Recommencer</span>
          </button>
          <div className="step-buttons">
            <button
              disabled={!step || safeIndex === 0}
              onClick={() => {
                setPlaying(false);
                setIndex(safeIndex - 1);
              }}
              aria-label="Étape précédente"
            >
              <ArrowLeft size={16} />
              <span>Précédent</span>
            </button>
            <button
              className="play-button"
              disabled={!step || finished || waiting}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? (
                <Pause size={17} fill="currentColor" />
              ) : (
                <Play size={17} fill="currentColor" />
              )}
              {playing ? 'Pause' : 'Lecture automatique'}
            </button>
            <button
              disabled={!step || finished || waiting}
              onClick={() => {
                setPlaying(false);
                next();
              }}
              aria-label="Étape suivante"
            >
              <span>Suivant</span>
              <ArrowRight size={16} />
            </button>
          </div>
          <label className="speed-control">
            Vitesse{' '}
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              aria-label="Vitesse de lecture"
            >
              <option value={0.5}>0,5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
              <option value={4}>4×</option>
            </select>
          </label>
        </div>
      </div>
      <div className="below-player">
        <span>
          <span className="key-cap">←</span>
          <span className="key-cap">→</span> pour avancer à votre rythme{' '}
          <span className="key-cap space-key">espace</span> pour lire / mettre en pause
        </span>
        <span>
          <Check size={13} /> Progression locale
        </span>
      </div>
      <details className="limits">
        <summary>Ce que le moteur visualise</summary>
        <p>
          Exécution réelle de Python avec Pyodide, dans un Worker isolé de l’interface. La vue
          détaille les fonctions synchrones, la récursion, les primitives, les listes, les tuples,
          les dictionnaires à clés simples et les instances avec attributs. Les classes et fonctions
          elles-mêmes ne sont pas affichées comme objets. Les objets présentés sont ceux accessibles
          depuis les variables ou la valeur de retour.
        </p>
        <p>
          Les générateurs, coroutines, threads et détails internes des bibliothèques ne sont pas
          représentés fidèlement. Collections : 80 entrées ; profondeur : 8 ; texte : 2 000
          caractères. Les objets tronqués sont signalés. Limites : 1 200 étapes, 16 000 caractères
          de sortie et 8 secondes d’exécution. Le mode libre ajoute une vérification préalable de son sous-ensemble Python et des budgets de mémoire distincts.
        </p>
      </details>
    </>
  );
}

function explanation(step?: Step) {
  if (!step) return 'Choisissez un atelier, puis avancez avec le bouton « Suivant ».';
  if (step.event === 'call')
    return `Python entre dans ${step.functionName}. L’appelant attend son résultat.`;
  if (step.event === 'return')
    return `${step.functionName} renvoie ${displayValue(step.returnValue)}. Sa carte disparaîtra à l’étape suivante.`;
  if (step.event === 'output')
    return 'print() écrit dans la sortie standard. Une fonction peut afficher une valeur sans la renvoyer.';
  if (step.event === 'end')
    return 'La pile est vide. Vous pouvez revenir à n’importe quelle étape pour observer ce qui a changé.';
  if (step.resumeLine)
    return `L’appel de la ligne ${step.resumeLine} a rendu la main. Python poursuit le programme.`;
  return `La ligne ${step.line} va s’exécuter. Avancez d’une étape pour observer son effet sur les variables.`;
}

