import { useState } from 'react';
import type { Exercise } from '../engine/types';
import { Workspace } from './Workspace';

const sample=`class Noeud:
    def __init__(self, nom, suivant=None):
        self.nom = nom
        self.suivant = suivant

    def longueur(self):
        if self.suivant is None:
            return 1
        return 1 + self.suivant.longueur()

fin = Noeud("B")
debut = Noeud("A", fin)
print(debut.longueur())`;
export function FreeCode() {
  const [code,setCode]=useState(()=>{try{return localStorage.getItem('pyscope-free-draft')||sample;}catch{return sample;}});
  const [run,setRun]=useState<Exercise>();const [stopped,setStopped]=useState(false);const [version,setVersion]=useState(0);
  function launch(){const n=version+1;setVersion(n);setStopped(false);setRun({id:`free-${n}`,title:'Votre programme',subtitle:'Code libre',level:'Approfondissement',recommendedLevel:'approfondissement',themes:[],notions:[],prerequisites:[],objective:'Explorer votre code et ses effets.',difficulty:1,instruction:'Python réel, dans un Worker. Aucune question automatique sur le code libre.',initial:{},code,visualization:'combined',freeCode:true});try{localStorage.setItem('pyscope-free-draft',code);}catch{/* optional */}}
  return <><div className="lesson-heading"><div><div className="eyebrow">LABORATOIRE PERSONNEL</div><h1>Code libre<span className="title-dot">.</span></h1><p>Écrivez un petit programme, puis lancez sa trace. Le code saisi reste dans ce navigateur.</p></div></div>
    <details className="free-limits" open><summary>Constructions prises en charge et limites</summary><p>Variables, nombres, textes, listes/tuples/dictionnaires, conditions, boucles, fonctions synchrones, récursion et classes simples avec __init__. Méthodes définies dans le programme ; append, pop, copy, count, index, keys, values, items et get.</p><p>Imports, fichiers, réseau, input, eval/exec, compréhensions, générateurs, async, héritage, décorateurs et attributs internes sont refusés. Ce sous-ensemble est vérifié avant l’exécution ; une incompatibilité est expliquée.</p><p><strong>Limites :</strong> 12 000 caractères de code · 1 200 étapes · 8 s d’exécution · 2 Mio de données Python retenues · 4 Mio de traces JSON · séquences construites par +, * ou range limitées à 4 096 éléments. La mémoire de l’interpréteur WebAssembly est distincte et n’a pas de quota matériel strict ; la vérification des données intervient aux étapes. Le Worker n’est pas une sandbox de sécurité pour du code hostile.</p></details>
    <label className="editor-label" htmlFor="python-editor">Programme Python</label><textarea id="python-editor" className="python-editor" spellCheck={false} maxLength={12000} value={code} onChange={e=>setCode(e.target.value)}/>
    <div className="editor-actions"><button className="primary-button" disabled={!code.trim()} onClick={launch}>Exécuter et visualiser</button>{run&&<button onClick={()=>{setRun(undefined);setStopped(true);}}>Arrêter / fermer la trace</button>}<small>{code.length} / 12 000 caractères</small></div>{stopped&&<p role="status">Exécution arrêtée. Vous pouvez modifier le programme puis le relancer.</p>}
    {run&&<Workspace key={run.id} exercise={run} savedPositions={{}} onProgress={()=>{}}/>}
  </>;
}
