import { exercises } from '../../exercises';
import type { Exercise } from '../engine/types';
import type { NotionId } from '../curriculum/notions';
import { treeCode } from '../../exercises/parcours/croises';

export interface ExerciseTemplate {
  /** Version is part of identity: do not change an existing algorithm in place. */
  id: string; title: string; notions: NotionId[]; difficulties: (1|2|3)[];
  build: (random: () => number, difficulty: 1|2|3) => Exercise;
}
const get = (id: string) => exercises.find(e => e.id === id)!;
export function seededRandom(seed: string) {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => { state += 0x6d2b79f5; let n = state; n = Math.imul(n ^ n >>> 15, n | 1); n ^= n + Math.imul(n ^ n >>> 7, n | 61); return ((n ^ n >>> 14) >>> 0) / 4294967296; };
}
export const templates: ExerciseTemplate[] = [
  { id:'dichotomie-v1',title:'Une liste triée à explorer',notions:['dichotomie','bornes','listes'],difficulties:[1,2,3], build(random,difficulty) {
    const nombres:number[]=[];let n=1+Math.floor(random()*5);
    for(let i=0;i<difficulty*3+2;i++){n+=2+Math.floor(random()*4);nombres.push(n);}
    const cible = difficulty === 3 ? nombres.at(-1)! + 1 : nombres[Math.floor(random()*nombres.length)];
    return {...get('dichotomie'),instruction:`Cherchez ${cible} dans la liste fournie. Suivez les bornes et le retour de la fonction.`,variants:undefined,questions:[],initial:{nombres,cible},questionSpecs:[{id:'indice-verifie',event:'return',functionName:'dichotomie',read:'return',prompt:'Quel indice la recherche renvoie-t-elle ?',explanation:'La réponse est extraite du retour réel de dichotomie. -1 signifie que la cible est absente.'}]};
  } },
  { id:'factorielle-v1',title:'Une pile de multiplications',notions:['recursion','cas-base','pile','retours'],difficulties:[1,2],build(random,difficulty) {
    return {...get('factorielle'),instruction:'Calculez la factorielle du nombre fourni en entrée. Observez la pile puis les retours.',initial:{nombre:2+difficulty+Math.floor(random()*2)},questions:[],questionSpecs:[{id:'retour-verifie',event:'return',functionName:'factorielle',occurrence:2,read:'return',prompt:'Quelle valeur cet appel renvoie-t-il à son parent ?',explanation:'La valeur vient du retour enregistré par Python, après la multiplication de cet appel.'}]};
  } },
  { id:'compteur-v1',title:'Un compteur, deux noms',notions:['poo','self','references','mutation'],difficulties:[1,2],build(random,difficulty) {
    const quantite=2+Math.floor(random()*8);return {...get('poo-mutation'),objective:'Suivre un compteur partagé entre deux noms et le solde renvoyé.',instruction:'alias et compteur désignent le même objet. Suivez les ajouts et le nouveau solde renvoyé par ajouter.',initial:{quantite},questions:[],code:`class Compteur:
    def __init__(self):
        self.valeur = 0

    def ajouter(self, quantite):
        self.valeur += quantite
        return self.valeur

compteur = Compteur()
alias = compteur
resultat = alias.ajouter(quantite)
${difficulty === 2 ? 'resultat = compteur.ajouter(quantite)\n' : ''}print(resultat)`,questionSpecs:[{id:'solde-verifie',event:'return',functionName:'ajouter',occurrence:difficulty,read:'return',prompt:'Quel solde cette méthode renvoie-t-elle ?',explanation:'alias et compteur désignent le même objet. Le résultat est vérifié sur son retour réel.'}]};
  } },
  { id:'arbre-objets-v1',title:'La taille d’un arbre d’objets',notions:['poo','recursion','arbres','self','references','parcours','pile','retours'],difficulties:[2,3],build(random,difficulty) {
    const count=3+Math.floor(random()*(difficulty===2?2:5));
    const setup=Array.from({length:count},(_,i)=>`noeud${i} = Noeud("N${i}")`);
    for(let i=1;i<count;i++) setup.push(`noeud${Math.floor((i-1)/2)}.${i%2?'gauche':'droite'} = noeud${i}`);
    return {...get('poo-rec-arbre'),instruction:'Suivez taille() depuis N0. Chaque référence gauche ou droite mène à un autre objet ; chaque appel possède son self.',code:treeCode.slice(0,treeCode.indexOf('feuille ='))+setup.join('\n')+'\nresultat = noeud0.taille()\nprint(resultat)',questionSpecs:[
      {id:'self-verifie',event:'call',functionName:'taille',selfName:'N1',read:'self',prompt:'Quel objet est self dans cet appel ?',explanation:'Le destinataire de la méthode est identifié à partir de la référence self dans la pile réelle.'},
      {id:'parent-verifie',event:'call',functionName:'taille',selfName:'N1',read:'caller',prompt:'Quel appel attend directement ce résultat ?',explanation:'L’appelant est la carte située juste sous l’appel actif dans la pile.'},
      {id:'taille-verifie',event:'return',functionName:'taille',selfName:'N1',read:'return',prompt:'Quelle taille remonte au parent ?',explanation:'Chaque nœud compte pour 1. Cette réponse est lue dans le retour de N1.taille(), et non déduite du nombre total de nœuds.'},
    ]};
  } },
];
export function matchingTemplates(selected: NotionId[], difficulty: 1|2|3) {
  return selected.length ? templates.filter(t=>t.difficulties.includes(difficulty)&&selected.every(n=>t.notions.includes(n))) : [];
}
export function generateExercise(model: string, seed: string, difficulty: 1|2|3): Exercise {
  const template=templates.find(t=>t.id===model);
  if(!template || !template.difficulties.includes(difficulty) || !seed || seed.length>64) throw new Error('Modèle, difficulté ou seed invalide (1 à 64 caractères).');
  const result=template.build(seededRandom(seed),difficulty);
  return {...result,id:`gen:${model}:${difficulty}:${encodeURIComponent(seed)}`,title:template.title,subtitle:`Modèle local · seed ${seed}`,instruction:`${result.instruction} Variante reproductible : ${seed}.`,notions:template.notions,difficulty};
}
