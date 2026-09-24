/// <reference lib="webworker" />
import tracerSource from './tracer.py?raw';
import type { PyodideInterface } from 'pyodide';

let python: PyodideInterface | undefined;
self.onmessage = async (event: MessageEvent<{ code: string; initial: object; base: string }>) => {
  try {
    if (!python) {
      self.postMessage({ type: 'status', message: 'Chargement de Python dans votre navigateur…' });
      const runtime = new URL('pyodide/', event.data.base).href;
      const { loadPyodide } = await import(/* @vite-ignore */ `${runtime}pyodide.mjs`);
      python = (await loadPyodide({ indexURL: runtime })) as PyodideInterface;
      python.runPython(tracerSource);
    }
    self.postMessage({ type: 'running' });
    python.globals.set('exercise_source', event.data.code);
    python.globals.set('exercise_initial_json', JSON.stringify(event.data.initial));
    const result = python.runPython(
      'trace_program(exercise_source, json.loads(exercise_initial_json))',
    ) as string;
    self.postMessage({ type: 'result', trace: JSON.parse(result) });
  } catch (error) {
    self.postMessage({ type: 'failure', message: `Python n’a pas pu démarrer : ${String(error)}` });
  }
};
