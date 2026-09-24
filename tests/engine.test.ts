import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Trace, Value } from '../src/engine/types';
import factorial from '../exercises/factorielle';
import characters from '../exercises/personnages';
import binary from '../exercises/dichotomie';

let python: PyodideInterface;
beforeAll(async () => {
  python = await loadPyodide({ indexURL: resolve('node_modules/pyodide') });
  python.runPython(readFileSync('src/engine/tracer.py', 'utf8'));
}, 60000);
function trace(code: string, initial: object = {}, limit = 1200): Trace {
  python.globals.set('source_for_test', code);
  python.globals.set('initial_for_test', JSON.stringify(initial));
  return JSON.parse(
    python.runPython(
      `trace_program(source_for_test, json.loads(initial_for_test), ${limit})`,
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
