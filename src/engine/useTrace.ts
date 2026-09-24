import { useEffect, useState } from 'react';
import type { Trace } from './types';

export function useTrace(code: string, initial: object, attempt: number, free = false) {
  const [result, setResult] = useState<{ key: string; trace: Trace }>();
  const [status, setStatus] = useState('Préparation de Python…');
  const [failure, setFailure] = useState('');
  const initialJSON = JSON.stringify(initial);
  const key = JSON.stringify([code, initialJSON, attempt, free]);
  useEffect(() => {
    setResult(undefined);
    setFailure('');
    setStatus('Chargement de Python dans votre navigateur…');
    const worker = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' });
    let timer: ReturnType<typeof setTimeout>;
    const timeout = (duration: number, message: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        worker.terminate();
        setFailure(message);
      }, duration);
    };
    timeout(
      60000,
      'Le chargement de Python a dépassé une minute. Vérifiez votre connexion et réessayez.',
    );
    worker.onmessage = ({ data }) => {
      if (data.type === 'status') setStatus(data.message);
      if (data.type === 'running') {
        setStatus('Python calcule les instantanés…');
        timeout(
          8000,
          'Exécution arrêtée après 8 secondes. Le programme est peut-être trop long ou contient une boucle infinie.',
        );
      }
      if (data.type === 'result') {
        clearTimeout(timer);
        setResult({ key, trace: data.trace });
        worker.terminate();
      }
      if (data.type === 'failure') {
        clearTimeout(timer);
        setFailure(data.message);
        worker.terminate();
      }
    };
    worker.onerror = () => {
      clearTimeout(timer);
      setFailure('Impossible de charger le moteur Python. Réessayez après avoir rechargé la page.');
      worker.terminate();
    };
    worker.postMessage({
      code,
      initial: JSON.parse(initialJSON),
      base: new URL(import.meta.env.BASE_URL, location.origin).href,
      free,
    });
    return () => {
      clearTimeout(timer);
      worker.terminate();
    };
  }, [code, initialJSON, attempt, free]);
  return { trace: result?.key === key ? result.trace : undefined, status, failure };
}
