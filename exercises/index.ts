import type { Exercise } from '../src/engine/types';
// Ajouter un fichier .ts avec un export default suffit à l’enregistrer.
const modules = import.meta.glob<{ default: Exercise }>('./*.ts', { eager: true });
const order = ['factorielle', 'dichotomie', 'personnages'];
export const exercises: Exercise[] = Object.entries(modules)
  .filter(([path]) => path !== './index.ts')
  .map(([, module]) => module.default)
  .sort(
    (a, b) =>
      (order.indexOf(a.id) < 0 ? 99 : order.indexOf(a.id)) -
      (order.indexOf(b.id) < 0 ? 99 : order.indexOf(b.id)),
  );
