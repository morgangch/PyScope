import { useState } from 'react';
import { generateExercise, matchingTemplates, templates } from '../generation/templates';
import { notions, difficultyLabels, type NotionId } from '../curriculum/notions';
import { Workspace } from './Workspace';
import type { Exercise } from '../engine/types';
import type { Progress } from '../storage';

export function Generator({query,progress,onProgress}:{query:URLSearchParams;progress:Progress;onProgress:(exercise:Exercise,key:string,index:number,done:boolean)=>void}) {
  const requested=query.get('notions')?.split(',').filter((n):n is NotionId=>n in notions);
  const [selected,setSelected]=useState<NotionId[]>(requested?.length?requested:['recursion']);
  const [difficulty,setDifficulty]=useState<1|2|3>([1,2,3].includes(Number(query.get('difficulty')))?Number(query.get('difficulty')) as 1|2|3:2);
  const [seed,setSeed]=useState(query.get('seed')||'nsi-2026');
  const matches=matchingTemplates(selected,difficulty);
  const [model,setModel]=useState(query.get('model')||matches[0]?.id||'');
  const [message,setMessage]=useState('');
  const valid=matches.some(t=>t.id===model);
  let exercise:Exercise|undefined;let invalid='';
  if(query.has('model')) {
    try{
      const d=Number(query.get('difficulty')) as 1|2|3;
      const m=query.get('model')!;
      if(!requested?.length || !matchingTemplates(requested,d).some(t=>t.id===m)) throw new Error('Aucun modèle ne correspond exactement aux notions et à la difficulté de ce lien.');
      exercise=generateExercise(m,query.get('seed')||'',d);
    }catch(error){invalid=String(error);}
  }
  const changed = exercise && (model !== query.get('model') || seed !== query.get('seed') || String(difficulty) !== query.get('difficulty') || [...selected].sort().join(',') !== [...(requested||[])].sort().join(','));
  if(changed) exercise=undefined;
  function create(){setMessage('');const params=new URLSearchParams({model,seed,difficulty:String(difficulty),notions:selected.join(',')});window.location.hash=`generateur?${params}`;}
  const options=Object.keys(notions).filter(n=>templates.some(t=>t.notions.includes(n as NotionId))) as NotionId[];
  return <><div className="lesson-heading"><div><div className="eyebrow">MODÈLES LOCAUX · AUCUNE IA</div><h1>Fabrique d’exercices<span className="title-dot">.</span></h1><p>Même modèle, même difficulté et même seed : le même exercice. Les questions sont calculées et vérifiées sur la trace réelle.</p></div></div>
    <fieldset className="notion-picker"><legend>Une ou plusieurs notions · intersection réelle</legend>{options.map(id=><label key={id}><input type="checkbox" checked={selected.includes(id)} onChange={e=>setSelected(s=>e.target.checked?[...s,id]:s.filter(n=>n!==id))}/>{notions[id]}</label>)}</fieldset>
    <div className="catalogue-controls"><label>Difficulté<select aria-label="Difficulté du générateur" value={difficulty} onChange={e=>setDifficulty(Number(e.target.value) as 1|2|3)}>{Object.entries(difficultyLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Seed reproductible<input aria-label="Seed" maxLength={64} value={seed} onChange={e=>setSeed(e.target.value)}/></label><label>Modèle compatible<select aria-label="Modèle compatible" value={valid?model:''} onChange={e=>setModel(e.target.value)}><option value="">Choisir un modèle</option>{matches.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label></div>
    {!matches.length&&<p className="catalogue-empty">Aucun modèle disponible pour cette intersection et cette difficulté. Aucun exercice d’une seule notion ne sera substitué.</p>}
    <div className="editor-actions"><button className="primary-button" disabled={!valid||!seed.trim()} onClick={create}>Générer l’exercice</button>{exercise&&<button onClick={async()=>{try{await navigator.clipboard.writeText(location.href);setMessage('Lien copié.');}catch{setMessage('Copiez l’adresse affichée ci-dessous.');}}}>Copier le lien</button>}</div>{message&&<p role="status">{message}</p>}{exercise&&<label className="share-link">Lien partageable<input readOnly value={location.href} aria-label="Lien partageable" onFocus={e=>e.target.select()}/></label>}
    {invalid&&<p role="alert" className="catalogue-empty">Lien invalide : {invalid}</p>}
    {exercise&&<Workspace key={exercise.id} exercise={exercise} savedPositions={progress.positions} onProgress={(key,index,done)=>onProgress(exercise!,key,index,done)}/>}
  </>;
}
