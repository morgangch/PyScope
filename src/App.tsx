import { useEffect, useState } from 'react';
import { BookOpen, Code2, HelpCircle, PanelLeftClose, Sparkles, List } from 'lucide-react';
import { exercises } from '../exercises';
import { chapters, themes, statusLabels } from './curriculum/catalogue';
import { Catalogue, ChapterView } from './components/Catalogue';
import { Workspace } from './components/Workspace';
import { FreeCode } from './components/FreeCode';
import { Generator } from './components/Generator';
import { Guide } from './components/Guide';
import { readProgress, saveProgress } from './storage';
import type { Exercise } from './engine/types';

function initialRoute(){if(location.hash)return location.hash.slice(1);const last=readProgress().last;try{if(localStorage.getItem('pyscope-progress-v1')&&exercises.some(e=>e.id===last))return `exercise/${last}`;}catch{/* no storage */}return 'parcours';}
export default function App(){
  const [route,setRoute]=useState(initialRoute);const [progress,setProgress]=useState(readProgress);const [sidebar,setSidebar]=useState(true);const [guide,setGuide]=useState(false);
  useEffect(()=>{const change=()=>{setRoute(location.hash.slice(1)||'parcours');window.scrollTo(0,0);};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  const [path,queryString]=route.split('?');const query=new URLSearchParams(queryString);const [page,id]=path.split('/');
  const exercise=page==='exercise'?exercises.find(e=>e.id===id):undefined;
  const chapter=page==='chapter'?chapters.find(c=>c.id===id):undefined;
  const parent=chapters.find(c=>c.id===query.get('chapter')&&c.exerciseIds.includes(exercise?.id||''));
  useEffect(()=>{if(exercise)setProgress(p=>{const next={...p,last:exercise.id};saveProgress(next);return next;});},[exercise]);
  function record(item:Exercise,key:string,index:number,done:boolean){setProgress(p=>{const next={...p,positions:{...p.positions,[key]:index},completed:done&&!p.completed.includes(item.id)?[...p.completed,item.id]:p.completed};saveProgress(next);return next;});}
  const completed=exercises.filter(e=>progress.completed.includes(e.id)).length;
  const nav=[{href:'parcours',label:'Parcours NSI',icon:BookOpen},{href:'exercices',label:'Tous les exercices',icon:List},{href:'libre',label:'Code libre',icon:Code2},{href:'generateur',label:'Générer un exercice',icon:Sparkles}];
  const known=!!exercise||!!chapter||['parcours','exercices','libre','generateur'].includes(page);
  return <div className={`app ${sidebar?'':'sidebar-closed'}`}><a className="skip-link" href="#atelier" onClick={e=>{e.preventDefault();document.getElementById('atelier')?.focus();}}>Aller à l’atelier</a>
    <aside className="sidebar curriculum-sidebar" aria-label="Navigation du parcours"><a className="brand" href="#parcours"><span className="brand-icon"><Code2 size={24}/></span><span>PyScope<span className="brand-dot">.</span></span></a><div className="sidebar-caption">APPRENDRE LA NSI, PAS À PAS</div><nav className="learning-nav">{nav.map(n=><a key={n.href} href={`#${n.href}`} aria-current={page===n.href?'page':undefined}><n.icon size={17}/>{n.label}</a>)}</nav>
      <div className="sidebar-chapters">{themes.map(theme=><details key={theme.id} open={chapters.some(c=>c.theme===theme.id&&(c.id===id||c.id===parent?.id))||undefined}><summary>{theme.title}</summary>{chapters.filter(c=>c.theme===theme.id).map(c=><a key={c.id} href={`#chapter/${c.id}`} aria-current={chapter?.id===c.id?'page':undefined}><span aria-label={statusLabels[c.status]}>{c.status==='available'?'●':c.status==='planned'?'◷':'◇'}</span>{c.title}</a>)}</details>)}</div>
      <div className="sidebar-bottom"><strong>{completed} / {exercises.length} exercices explorés</strong><p>Un exercice, une progression, même dans plusieurs chapitres.</p><div className="progress-track"><span style={{width:`${completed/exercises.length*100}%`}}/></div></div></aside>
    <div className="main-shell"><header className="topbar"><div><button className="icon-button" aria-label={sidebar?'Masquer le catalogue':'Afficher le catalogue'} aria-expanded={sidebar} onClick={()=>setSidebar(s=>!s)}><PanelLeftClose size={19}/></button><span className="breadcrumb">NSI <span>›</span><strong>{exercise?.title||chapter?.title||nav.find(n=>n.href===page)?.label||'Page introuvable'}</strong></span></div><span className="topbar-note"><span className="green-dot"/>Python dans votre navigateur</span><button className="help-button" onClick={()=>setGuide(true)}><HelpCircle size={16}/>Le guide</button></header>
      <main id="atelier" tabIndex={-1}>
        {page==='parcours'&&<Catalogue progress={progress}/>}{page==='exercices'&&<Catalogue key="all" all progress={progress}/>}{chapter&&<ChapterView chapter={chapter} progress={progress}/>}
        {exercise&&<><div className="exercise-paths">{parent&&<a href={`#chapter/${parent.id}`}>← {parent.title}</a>}<span>Retrouver cet exercice :</span>{chapters.filter(c=>c.exerciseIds.includes(exercise.id)).map(c=><a key={c.id} href={`#chapter/${c.id}`}>{c.title}</a>)}</div><Workspace key={exercise.id} exercise={exercise} savedPositions={progress.positions} onProgress={(key,index,done)=>record(exercise,key,index,done)}/></>}
        {page==='libre'&&<FreeCode/>}{page==='generateur'&&<Generator key={route} query={query} progress={progress} onProgress={record}/>}
        {!known&&<div className="catalogue-empty"><h1>Page introuvable</h1><p>Ce chapitre ou cet exercice n’existe pas dans cette version.</p><a href="#parcours">Revenir au parcours</a></div>}
        <footer className="main-footer"><span>Comprendre le code, une étape à la fois.</span><span>Programme NSI · structure en construction</span></footer>
      </main></div>{guide&&<Guide onClose={()=>setGuide(false)}/>}</div>;
}
