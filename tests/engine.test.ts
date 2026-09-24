import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Trace, Value } from '../src/engine/types';
import factorial from '../exercises/factorielle';
import characters from '../exercises/personnages';
import binary from '../exercises/dichotomie';
import { exercises } from '../exercises';
import { chapters, chapterProgress, themes } from '../src/curriculum/catalogue';
import { notions } from '../src/curriculum/notions';
import { resolveQuestions } from '../src/engine/questions';
import { generateExercise, matchingTemplates, templates } from '../src/generation/templates';

let python: PyodideInterface;
beforeAll(async () => {
  python = await loadPyodide({ indexURL: resolve('node_modules/pyodide') });
  python.runPython(readFileSync('src/engine/tracer.py', 'utf8'));
  python.runPython(readFileSync('src/engine/free_policy.py', 'utf8'));
}, 60000);
function trace(code: string, initial: object = {}, limit = 1200, free = false): Trace {
  python.globals.set('source_for_test', code);
  python.globals.set('initial_for_test', JSON.stringify(initial));
  return JSON.parse(
    python.runPython(
      `trace_program(source_for_test, json.loads(initial_for_test), ${limit}, ${free ? 'True' : 'False'})`,
    ) as string,
  );
}
function ref(value: Value) {
  if (value && typeof value === 'object') return value.ref;
  throw new Error('Référence attendue');
}

describe('traces Python réelles', () => {
  it('empile quatre appels récursifs et rend 1, 2, 6, 24', () => {
    const result = trace(factorial.code, factorial.initial);
    expect(result.error).toBeNull();
    const calls = result.steps.filter((s) => s.event === 'call');
    expect(calls.map((s) => s.stack.length)).toEqual([1, 2, 3, 4]);
    expect(calls.map((s) => s.stack.at(-1)?.locals.n)).toEqual([4, 3, 2, 1]);
    expect(new Set(calls.map((s) => s.stack.at(-1)?.id)).size).toBe(4);
    expect(result.steps.filter((s) => s.event === 'return').map((s) => s.returnValue)).toEqual([
      1, 2, 6, 24,
    ]);
    expect(result.steps.some((s) => s.resumeLine === 4)).toBe(true);
    expect(result.steps.at(-1)?.stack).toEqual([]);
    expect(result.steps.at(-1)?.globals.resultat).toBe(24);
    expect(result.steps.at(-1)?.stdout).toBe('24\n');
  });
  it('préserve les alias, self et les soldes de chaque instantané', () => {
    const result = trace(characters.code);
    expect(result.error).toBeNull();
    const before = result.steps.find((s) => s.event === 'line' && s.line === 16)!;
    const after = result.steps.at(-1)!;
    const lara = ref(after.globals.lara);
    const milo = ref(after.globals.milo);
    expect(ref(before.globals.alliee)).toBe(lara);
    expect(lara).not.toBe(milo);
    expect(before.objects[lara].attributes?.nbPieces).toBe(20);
    expect(after.objects[lara].attributes?.nbPieces).toBe(18);
    expect(after.objects[milo].attributes?.nbPieces).toBe(12);
    const nested = result.steps.find(
      (s) => s.event === 'call' && s.functionName === 'donnerPiecesA' && s.stack.length === 2,
    )!;
    expect(ref(nested.stack[0].locals.self)).toBe(lara);
    expect(ref(nested.stack[1].locals.self)).toBe(milo);
    // Modifier une capture tardive ne peut pas altérer une capture ancienne.
    after.objects[lara].attributes!.nbPieces = 999;
    expect(before.objects[lara].attributes?.nbPieces).toBe(20);
    expect(after.stdout).toBe('Lara 18\nMilo 12\n');
  });
  it('trouve 18 à l’indice 8 et renvoie −1 pour 18.5', () => {
    for (const [cible, expected] of [
      [18, 8],
      [18.5, -1],
    ]) {
      const result = trace(binary.code, { ...binary.initial, cible });
      expect(result.error).toBeNull();
      expect(result.steps.at(-1)?.globals.indice).toBe(expected);
      expect(
        result.steps
          .filter((s) => s.event === 'line' && s.line === 6)
          .every((s) => typeof s.stack[0].locals.milieu === 'number'),
      ).toBe(true);
    }
  });
  it('borne une boucle infinie et restitue les erreurs de syntaxe', () => {
    const loop = trace('while True:\n    x = 1', {}, 30);
    expect(loop.steps.length).toBeLessThanOrEqual(30);
    expect(loop.error).toContain('Limite');
    const invalid = trace('def invalide(');
    expect(invalid.error).toContain('SyntaxError');
    expect(invalid.steps.at(-1)?.event).toBe('error');
  });
  it('préserve les références cycliques et les mutations de liste', () => {
    const result = trace('a = [1]\nb = a\na.append(a)\na[0] = 9\nprint(a[0])');
    const after = result.steps.at(-1)!;
    const list = ref(after.globals.a);
    expect(ref(after.globals.b)).toBe(list);
    expect(after.objects[list].items?.[1]).toEqual({ ref: list });
    const before = result.steps.find((s) => s.event === 'line' && s.line === 4)!;
    expect(before.objects[list].items?.[0]).toBe(1);
    expect(after.objects[list].items?.[0]).toBe(9);
  });
});

describe('parcours, exercices croisés et modèles', () => {
  it('valide les identifiants et garde une seule progression pour trois chapitres', () => {
    expect(new Set(exercises.map(e=>e.id)).size).toBe(exercises.length);
    for(const exercise of exercises){
      expect(exercise.objective.length).toBeGreaterThan(10);
      expect([...exercise.notions,...exercise.prerequisites].every(n=>n in notions)).toBe(true);
      expect(chapters.some(c=>c.exerciseIds.includes(exercise.id))).toBe(true);
    }
    for(const chapter of chapters){
      expect(themes.some(t=>t.id===chapter.theme)).toBe(true);
      expect(chapter.notions.every(n=>n in notions)).toBe(true);
      expect(chapter.exerciseIds.every(id=>exercises.some(e=>e.id===id))).toBe(true);
      expect(chapter.status==='available').toBe(chapter.exerciseIds.length>0);
      if(!chapter.exerciseIds.length) expect(chapterProgress(chapter,[]).complete).toBe(false);
    }
    const memberships=chapters.filter(c=>c.exerciseIds.includes('poo-rec-arbre'));
    expect(memberships).toHaveLength(3);
    memberships.forEach(c=>expect(chapterProgress(c,['poo-rec-arbre']).done).toBe(1));
  });
  it('exécute les 18 exercices et atteint toutes leurs questions', () => {
    const outputs:Record<string,string>={'rec-compte':'0\n','rec-somme-liste':'13\n','rec-imbriques':'8\n','rec-fibonacci':'3\n','poo-creation':'Lara 0\n','poo-alias':'Lara exploratrice\nMilo\n','poo-mutation':'5 None\n','poo-liste':'2 1\n','poo-rec-chaine':'3\n','poo-rec-arbre':'4\n','recherche-milieu':'2\n','recherche-extremites':'0\n3\n','recherche-vide':'-1\n','recherche-absent':'Dernière valeur examinée 6\n-1\n','recherche-bornes':'1\n'};
    for(const exercise of exercises){
      const result=trace(exercise.code,exercise.initial);
      expect(result.error,exercise.id).toBeNull();
      if(outputs[exercise.id]) expect(result.steps.at(-1)?.stdout,exercise.id).toBe(outputs[exercise.id]);
      expect(resolveQuestions(exercise,result),exercise.id).toHaveLength(exercise.questionSpecs?.length||0);
      for(const question of exercise.questions||[]) expect(result.steps.some(s=>s.event==='line'&&s.line===question.line),exercise.id).toBe(true);
    }
  });
  it('observe A → B → C, les références, les self distincts et les retours vers les parents', () => {
    const exercise=exercises.find(e=>e.id==='poo-rec-arbre')!;const result=trace(exercise.code);
    const nested=result.steps.find(s=>s.event==='call'&&s.functionName==='taille'&&s.stack.length===3)!;
    const selves=nested.stack.map(f=>ref(f.locals.self));
    expect(selves.map(id=>nested.objects[id].attributes?.nom)).toEqual(['A','B','C']);
    expect(nested.objects[selves[0]].attributes?.gauche).toEqual({ref:selves[1]});
    expect(nested.objects[selves[1]].attributes?.gauche).toEqual({ref:selves[2]});
    expect(result.steps.filter(s=>s.event==='return'&&s.functionName==='taille').map(s=>s.returnValue)).toEqual([1,2,1,4]);
    const answers=resolveQuestions(exercise,result).map(q=>q.choices[q.answer]);
    expect(answers).toEqual(['B','B.taille()','2']);
  });
  it('ne propose que des modèles qui couvrent toute l’intersection', () => {
    expect(matchingTemplates(['poo','recursion'],2).map(t=>t.id)).toEqual(['arbre-objets-v1']);
    expect(matchingTemplates(['poo','recursion'],1)).toEqual([]);
    expect(matchingTemplates(['dichotomie','poo'],2)).toEqual([]);
    expect(matchingTemplates([],2)).toEqual([]);
  });
  it('reproduit les seeds et vérifie toutes les réponses générées sur de vraies traces', () => {
    for(const model of templates)for(const difficulty of model.difficulties)for(const seed of ['alpha','nsi-2026','été']){
      const exercise=generateExercise(model.id,seed,difficulty);
      expect(generateExercise(model.id,seed,difficulty)).toEqual(exercise);
      const result=trace(exercise.code,exercise.initial);
      expect(result.error,exercise.id).toBeNull();
      const questions=resolveQuestions(exercise,result);
      expect(questions,exercise.id).toHaveLength(exercise.questionSpecs!.length);
      expect(questions.every(q=>q.choices.length===new Set(q.choices).size&&q.answer>=0)).toBe(true);
      const answers=questions.map(q=>q.choices[q.answer]);
      if(model.id==='dichotomie-v1') expect(answers).toEqual([String((exercise.initial.nombres as number[]).indexOf(exercise.initial.cible as number))]);
      if(model.id==='factorielle-v1') expect(answers).toEqual(['2']);
      if(model.id==='compteur-v1') expect(answers).toEqual([String(Number(exercise.initial.quantite)*difficulty)]);
      if(model.id==='arbre-objets-v1') {
        expect(answers.slice(0,2)).toEqual(['N1','N0.taille()']);
        const nodeCount=(exercise.code.match(/= Noeud\(/g)||[]).length;
        expect(result.steps.at(-1)?.globals.resultat).toBe(nodeCount);
        const below=(i:number):number=>i>=nodeCount?0:1+below(i*2+1)+below(i*2+2);
        expect(answers[2]).toBe(String(below(1)));
      }
    }
    expect(resolveQuestions(generateExercise('factorielle-v1','a',1),{steps:[],error:'Erreur'})).toEqual([]);
    expect(()=>generateExercise('inconnu','a',1)).toThrow();
  });
});

describe('code libre : compatibilité et limites', () => {
  it('exécute des méthodes récursives synchrones avec des lignes conservées', () => {
    const code=exercises.find(e=>e.id==='poo-rec-arbre')!.code;
    const result=trace(code,{},1200,true);
    expect(result.error).toBeNull();expect(result.steps.at(-1)?.stdout).toBe('4\n');
    expect(result.steps.some(s=>s.event==='return'&&s.line===13&&s.returnValue===4)).toBe(true);
  });
  it('refuse le code incompatible avant toute sortie', () => {
    for(const code of ['print(1)\nimport os','async def f():\n    pass','x = [i for i in range(10)]','class C:\n    def __repr__(self):\n        return "x"']){
      const result=trace(code,{},1200,true);expect(result.error).toContain('UnsupportedCode');expect(result.steps.at(-1)?.stdout).toBe('');
    }
  });
  it('arrête les boucles et les allocations excessives', () => {
    expect(trace('while True:\n    pass',{},40,true).error).toContain('Limite');
    for(const code of ['a = [0] * 100000000','a = 2 ** 100000000','a = list(range(999999999))']) expect(trace(code,{},1200,true).error).toContain('ResourceLimit');
    const memory=trace('a = []\nfor i in range(700):\n    a.append("x" * 4000)',{},1200,true);
    expect(memory.error).toContain('Mémoire');
    expect(trace('print(42)',{},1200,true).steps.at(-1)?.stdout).toBe('42\n');
  });
});
