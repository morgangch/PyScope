export interface Progress {
  last: string;
  positions: Record<string, number>;
  completed: string[];
}
const fallback: Progress = { last: 'factorielle', positions: {}, completed: [] };
export function readProgress(): Progress {
  try {
    const value = JSON.parse(localStorage.getItem('pyscope-progress-v1') || 'null');
    if (
      !value ||
      typeof value.last !== 'string' ||
      !value.positions ||
      typeof value.positions !== 'object' ||
      !Array.isArray(value.completed)
    )
      return fallback;
    return {
      last: value.last,
      positions: Object.fromEntries(
        Object.entries(value.positions).filter(
          ([, v]) => typeof v === 'number' && Number.isInteger(v) && v >= 0,
        ),
      ) as Record<string, number>,
      completed: value.completed.filter((v: unknown) => typeof v === 'string'),
    };
  } catch {
    return fallback;
  }
}
export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem('pyscope-progress-v1', JSON.stringify(progress));
  } catch {
    /* Mode privé / stockage plein : l’atelier reste utilisable. */
  }
}
