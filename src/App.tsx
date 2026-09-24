import { useEffect, useRef, useState } from 'react';
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
import { exercises } from '../exercises';
import type { Exercise, Step } from './engine/types';
import { useTrace } from './engine/useTrace';
import { readProgress, saveProgress } from './storage';
import { CodePanel } from './components/CodePanel';
import { StackPanel } from './components/StackPanel';
import { MemoryPanel } from './components/MemoryPanel';
import { displayValue } from './components/ValueView';

const eventLabels = {
  line: 'Ligne à exécuter',
  call: 'Nouvel appel',
  return: 'Valeur de retour',
  output: 'Sortie standard',
  error: 'Exception Python',
  end: 'Programme terminé',
};
const initialProgress = readProgress();

export default function App() {
  const [selected, setSelected] = useState(
    exercises.find((e) => e.id === initialProgress.last) || exercises[0],
  );
  const [progress, setProgress] = useState(initialProgress);
  const [filter, setFilter] = useState('Tous');
  const [query, setQuery] = useState('');
  const [guide, setGuide] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const themes = ['Tous', ...new Set(exercises.flatMap((e) => e.themes))];
  const filtered = exercises.filter(
    (e) =>
      (filter === 'Tous' || e.themes.includes(filter)) &&
      `${e.title} ${e.subtitle}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')),
  );
  const completed = exercises.filter((e) => progress.completed.includes(e.id)).length;
  function choose(exercise: Exercise) {
    setSelected(exercise);
    setProgress((p) => {
      const next = { ...p, last: exercise.id };
      saveProgress(next);
      return next;
    });
  }
  return (
    <div className={`app ${sidebar ? '' : 'sidebar-closed'}`}>
      <a href="#atelier" className="skip-link">
        Aller à l’atelier
      </a>
      <aside className="sidebar" aria-label="Catalogue des exercices">
        <a className="brand" href={import.meta.env.BASE_URL}>
          <span className="brand-icon">
            <Code2 size={24} />
          </span>
          <span>
            PyScope<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="sidebar-caption">PYTHON, À LA LOUPE</div>
        <div className="nav-section-title">VOTRE ESPACE</div>
        <div className="nav-current">
          <BookOpen size={18} /> Les ateliers <span>{exercises.length}</span>
        </div>
        <button className="nav-guide" onClick={() => setGuide(true)}>
          <HelpCircle size={18} /> Comment ça marche ?
        </button>
        <div className="catalogue-header">
          <h2>À vous d’explorer</h2>
          <span>{exercises.length} ateliers</span>
        </div>
        <label className="catalogue-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un atelier…"
            aria-label="Rechercher un atelier"
          />
        </label>
        <div className="theme-filters">
          {themes.map((theme) => (
            <button key={theme} aria-pressed={filter === theme} onClick={() => setFilter(theme)}>
              {theme}
            </button>
          ))}
        </div>
        <div className="exercise-list">
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              className={`exercise-card ${selected.id === exercise.id ? 'selected' : ''}`}
              onClick={() => choose(exercise)}
              aria-current={selected.id === exercise.id ? 'page' : undefined}
            >
              <span className={`exercise-icon ${exercise.visualization}`}>
                {exercise.visualization === 'recursion' ? (
                  <Layers3 size={19} />
                ) : exercise.visualization === 'search' ? (
                  <Search size={19} />
                ) : (
                  <Box size={19} />
                )}
              </span>
              <span>
                <strong>{exercise.title}</strong>
                <small>{exercise.subtitle}</small>
                <span className="exercise-meta">
                  {exercise.level} <span>·</span> {exercise.themes[0]}
                </span>
              </span>
              {progress.completed.includes(exercise.id) ? (
                <CheckCircle2 className="exercise-check" size={16} />
              ) : (
                <ChevronRight className="exercise-chevron" size={15} />
              )}
            </button>
          ))}
          {!filtered.length && (
            <p className="empty-small">Aucun atelier trouvé. Essayez un autre thème ou mot-clé.</p>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="progress-heading">
            <GraduationCap size={20} />
            <strong>Un pas après l’autre</strong>
          </div>
          <p>
            {completed} sur {exercises.length} ateliers explorés
          </p>
          <div className="progress-track">
            <span style={{ width: `${(completed / exercises.length) * 100}%` }} />
          </div>
          <small>Votre progression reste dans ce navigateur.</small>
        </div>
        <div className="sidebar-footer">
          <span className="green-dot" /> Sans compte. Juste de la curiosité.
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="icon-button"
              onClick={() => setSidebar((s) => !s)}
              aria-label={sidebar ? 'Masquer le catalogue' : 'Afficher le catalogue'}
              aria-expanded={sidebar}
            >
              <PanelLeftClose size={19} />
            </button>
            <span className="breadcrumb">
              Les ateliers <ChevronRight size={14} /> <strong>{selected.title}</strong>
            </span>
          </div>
          <span className="topbar-note">
            <span className="green-dot" /> Exécution dans votre navigateur
          </span>
          <button className="help-button" onClick={() => setGuide(true)}>
            <HelpCircle size={16} />
            <span>Le guide</span>
          </button>
        </header>
        <main id="atelier" tabIndex={-1}>
          <Workspace
            key={selected.id}
            exercise={selected}
            savedPositions={progress.positions}
            onProgress={(key, index, done) =>
              setProgress((p) => {
                const next = {
                  ...p,
                  positions: { ...p.positions, [key]: index },
                  completed:
                    done && !p.completed.includes(selected.id)
                      ? [...p.completed, selected.id]
                      : p.completed,
                };
                saveProgress(next);
                return next;
              })
            }
          />
          <footer className="main-footer">
            <span>Comprendre le code, une étape à la fois.</span>
            <span>
              Fait pour apprendre <span className="footer-spark">✳</span>
            </span>
          </footer>
        </main>
      </div>
      {guide && <Guide onClose={() => setGuide(false)} />}
    </div>
  );
}

function Workspace({
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
  const { trace, status, failure } = useTrace(exercise.code, initial, attempt);
  const progressKey = `${exercise.id}:${variant}`;
  const [index, setIndex] = useState(savedPositions[progressKey] || 0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hints, setHints] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [skipped, setSkipped] = useState<number[]>([]);
  const steps = trace?.steps || [];
  const safeIndex = Math.min(index, Math.max(steps.length - 1, 0));
  const step = steps[safeIndex];
  const previous = steps[safeIndex - 1];
  const finished = !!step && safeIndex === steps.length - 1;
  const question =
    hints && step?.event === 'line'
      ? exercise.questions?.find((q) => q.line === step.line)
      : undefined;
  const waiting =
    !!question && answers[question.line] === undefined && !skipped.includes(question.line);
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
            <span>ATELIER {String(exercises.indexOf(exercise) + 1).padStart(2, '0')}</span>
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
          <GraduationCap size={15} /> {exercise.level}
        </div>
      </div>
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
          <p>{step?.error || (hints && customExplanation?.text) || explanation(step)}</p>
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
                onClick={() => setAnswers((a) => ({ ...a, [question.line]: i }))}
                aria-pressed={answers[question.line] === i}
              >
                {answers[question.line] === i && <Check size={14} />}
                {choice}
              </button>
            ))}
            <button
              className="skip-question"
              onClick={() => setSkipped((s) => [...s, question.line])}
            >
              Passer la question
            </button>
          </div>
          {answers[question.line] !== undefined && (
            <p role="status">
              {answers[question.line] === question.answer ? 'Bien vu ! ' : 'Pas tout à fait. '}
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
          de sortie et 8 secondes d’exécution. Cette version propose des exercices définis dans le
          dépôt, sans éditeur libre.
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

function Guide({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="guide-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button className="icon-button dialog-close" onClick={onClose} aria-label="Fermer le guide">
        <X size={20} />
      </button>
      <span className="guide-symbol">
        <BookOpen size={27} />
      </span>
      <div className="eyebrow">BIENVENUE DANS L’ATELIER</div>
      <h2>
        Un programme.
        <br />
        Tous ses petits pas.
      </h2>
      <p>PyScope vous permet de voir ce qui se passe pendant l’exécution de Python.</p>
      <ol>
        <li>
          <strong>Lisez la ligne éclairée.</strong> Pour un événement « ligne », elle n’a pas encore
          été exécutée. ↗ marque l’appel, ↩ marque la reprise.
        </li>
        <li>
          <strong>Observez la pile.</strong> Chaque fonction a sa carte. Le dernier appel est en
          haut ; les autres attendent.
        </li>
        <li>
          <strong>Suivez les références.</strong> Un lien comme ↗ #o1 désigne un objet. Plusieurs
          noms peuvent pointer vers ce même objet.
        </li>
        <li>
          <strong>Avancez, puis revenez.</strong> Les valeurs barrées sont les anciennes valeurs.
          Chaque étape est un instantané indépendant.
        </li>
      </ol>
      <p className="guide-note">
        Les questions sont facultatives : utilisez « Passer la question » ou désactivez les coups de
        pouce. Le curseur permet de rejoindre librement une étape.
      </p>
      <button className="primary-button" onClick={onClose}>
        C’est parti <ArrowRight size={17} />
      </button>
    </dialog>
  );
}
