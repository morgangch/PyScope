import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { exercises } from '../../exercises';
import { chapters, themes, chapterExercises, chapterProgress, statusLabels, type Chapter } from '../curriculum/catalogue';
import { notions, levelLabels, difficultyLabels } from '../curriculum/notions';
import type { Exercise } from '../engine/types';
import type { Progress } from '../storage';

export function ExerciseCards({ items, progress, chapter }: {items:Exercise[];progress:Progress;chapter?:string}) {
  return <div className="learning-exercises">{items.map((exercise,index)=><a className="learning-exercise" key={exercise.id} href={`#exercise/${exercise.id}${chapter?`?chapter=${chapter}`:''}`}>
    <span className="order-number">{String(index+1).padStart(2,'0')}</span><div><h3>{exercise.title}</h3><p>{exercise.objective}</p><div className="notion-tags">{exercise.notions.map(id=><span key={id}>{notions[id]}</span>)}</div><small>{levelLabels[exercise.recommendedLevel]} · {difficultyLabels[exercise.difficulty]}</small></div>
    {progress.completed.includes(exercise.id)?<span className="completion-mark"><CheckCircle2 size={17}/> Exploré</span>:<ArrowRight size={17}/>}</a>)}{!items.length&&<p className="catalogue-empty">Aucun exercice ne correspond à ces filtres.</p>}</div>;
}
function ChapterCard({chapter,progress}:{chapter:Chapter;progress:Progress}) {
  const state=chapterProgress(chapter,progress.completed);
  return <a href={`#chapter/${chapter.id}`} className={`chapter-card chapter-${chapter.status}`}><span className="chapter-status">{statusLabels[chapter.status]}</span><h3>{chapter.title}</h3><p>{chapter.description}</p><small>{chapter.levels.map(l=>levelLabels[l]).join(' · ')}</small>{state.total>0?<div className="chapter-progress"><span>{state.done} / {state.total} exercices explorés</span><progress max={state.total} value={state.done} aria-label={`Progression ${chapter.title}`}/></div>:<strong className="not-available">Aucun exercice disponible</strong>}</a>;
}
export function Catalogue({progress,all=false}:{progress:Progress;all?:boolean}) {
  const [query,setQuery]=useState('');const [notion,setNotion]=useState('');const [level,setLevel]=useState('');
  const filtered=exercises.filter(e=>(!notion||e.notions.some(n=>n===notion))&&(!level||e.recommendedLevel===level)&&`${e.title} ${e.objective} ${e.notions.map(n=>notions[n]).join(' ')}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')));
  return <><div className="lesson-heading"><div><div className="eyebrow">PREMIÈRE & TERMINALE · NSI</div><h1>{all?'Tous les exercices':'Un parcours, plusieurs chemins'}<span className="title-dot">.</span></h1><p>{all?'Explorez librement. Les prérequis conseillent un ordre, ils ne ferment aucune porte.':'Des notions qui se rencontrent dans de vrais programmes. La structure couvre le programme ; les ateliers disponibles constituent une première étape.'}</p></div></div>
    {!all&&<><div className="catalogue-banner"><strong>{exercises.length} exercices uniques · {chapters.filter(c=>c.status==='available').length} chapitres avec ateliers</strong><p>Un exercice partagé entre chapitres conserve une seule progression. « Exploré » signifie que vous avez atteint la fin de sa trace, pas que la notion est évaluée comme acquise.</p>{exercises.some(e=>e.id===progress.last)&&<a className="text-link" href={`#exercise/${progress.last}`}>Reprendre le dernier exercice →</a>}</div><div className="status-legend"><span>● Exercices disponibles</span><span>◷ Prévu, sans exercice</span><span>◇ Autre visualisation à concevoir</span></div>{themes.map(theme=><section className="theme-section" key={theme.id}><h2>{theme.title}</h2><div className="chapter-grid">{chapters.filter(c=>c.theme===theme.id).map(chapter=><ChapterCard key={chapter.id} chapter={chapter} progress={progress}/>)}</div></section>)}</>}
    {all&&<><div className="catalogue-controls"><label>Rechercher<input aria-label="Rechercher un exercice" placeholder="Titre, objectif, notion…" value={query} onChange={e=>setQuery(e.target.value)}/></label><label>Notion<select aria-label="Filtrer par notion" value={notion} onChange={e=>setNotion(e.target.value)}><option value="">Toutes les notions</option>{Object.entries(notions).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Niveau<select value={level} onChange={e=>setLevel(e.target.value)} aria-label="Niveau conseillé"><option value="">Tous les niveaux</option>{Object.entries(levelLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label></div><p className="result-count">{filtered.length} exercice(s)</p><ExerciseCards items={filtered} progress={progress}/></>}
  </>;
}
export function ChapterView({chapter,progress}:{chapter:Chapter;progress:Progress}) {
  const state=chapterProgress(chapter,progress.completed);
  return <><a className="text-link" href="#parcours">← Tous les chapitres</a><div className="lesson-heading"><div><div className="eyebrow">{statusLabels[chapter.status]}</div><h1>{chapter.title}</h1><p>{chapter.description}</p></div></div><div className="notion-sequence"><h2>Notions · ordre conseillé</h2><ol>{chapter.notions.map(id=><li key={id}>{notions[id]}</li>)}</ol></div>
    {chapter.status==='available'?<><p className="result-count">{state.done} / {state.total} exercices explorés · ordre conseillé, accès libre</p><ExerciseCards items={chapterExercises(chapter)} progress={progress} chapter={chapter.id}/></>:<div className="catalogue-empty"><h2>{chapter.status==='conceptual'?'Une autre visualisation est nécessaire':'Ce chapitre est prévu'}</h2><p>{chapter.status==='conceptual'?'Ce sujet ne se réduit pas à une trace Python. Son support pédagogique reste à construire.':'Les notions sont repérées, mais aucun exercice n’a encore été réalisé.'}</p><strong>Aucun exercice disponible · aucune progression calculée</strong><a href="#exercices" className="text-link">Parcourir les exercices disponibles →</a></div>}
  </>;
}
