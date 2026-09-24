import type { Exercise } from '../src/engine/types';
export default {
  id: 'dichotomie',
  recommendedLevel: 'premiere', notions: ['dichotomie', 'bornes', 'listes'], prerequisites: ['boucles', 'conditions', 'fonctions'], objective: 'Réduire une zone de recherche fermée sans perdre la cible.', difficulty: 2,
  title: 'La dichotomie',
  subtitle: 'Chercher en divisant par deux',
  level: 'Première',
  themes: ['Algorithmes'],
  visualization: 'search',
  instruction:
    'Retrouvez 18 dans une liste triée. À chaque comparaison, observez comment la zone de recherche se réduit de moitié.',
  initial: { cible: 18, nombres: [11, 11.4, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] },
  variants: [
    { id: 'present', title: '18 · présent', initial: { cible: 18 } },
    { id: 'absent', title: '18.5 · absent', initial: { cible: 18.5 } },
  ],
  search: {
    list: 'nombres',
    target: 'cible',
    left: 'gauche',
    right: 'droite',
    middle: 'milieu',
    result: 'indice',
  },
  code: `def dichotomie(nombres, cible):
    gauche = 0
    droite = len(nombres) - 1
    while gauche <= droite:
        milieu = (gauche + droite) // 2
        if nombres[milieu] == cible:
            return milieu
        if nombres[milieu] < cible:
            gauche = milieu + 1
        else:
            droite = milieu - 1
    return -1

indice = dichotomie(nombres, cible)
print(indice)`,
  explanations: [
    {
      event: 'line',
      line: 6,
      text: 'Comparez la case du milieu à la cible. Les bornes gauche et droite délimitent les indices encore possibles.',
    },
    {
      event: 'line',
      line: 12,
      text: 'Les bornes se sont croisées : il ne reste aucune case possible. La valeur recherchée est absente.',
    },
    {
      event: 'return',
      text: 'La recherche renvoie un indice (les indices commencent à 0), ou −1 si la cible est absente.',
    },
  ],
} satisfies Exercise;
