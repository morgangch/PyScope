import type { Exercise } from '../src/engine/types';
export default {
  id: 'factorielle',
  title: 'La récursion',
  subtitle: 'Une fonction qui s’appelle elle-même',
  level: 'Première',
  themes: ['Récursion'],
  visualization: 'recursion',
  instruction:
    'Que se passe-t-il lorsqu’une fonction s’appelle elle-même ? Suivez factorielle(4), du premier appel au résultat final.',
  initial: { nombre: 4 },
  code: `def factorielle(n):
    if n <= 1:
        return 1
    resultat = n * factorielle(n - 1)
    return resultat

resultat = factorielle(nombre)
print(resultat)`,
  explanations: [
    {
      event: 'call',
      functionName: 'factorielle',
      text: 'Un nouvel appel, une nouvelle boîte de variables. Chaque appel possède sa propre valeur de n.',
    },
    {
      event: 'line',
      line: 3,
      text: 'Voici le cas de base : on renvoie 1 sans faire de nouvel appel. La pile va pouvoir se vider.',
    },
    {
      event: 'return',
      functionName: 'factorielle',
      text: 'Cette valeur est renvoyée à l’appel précédent, qui peut maintenant terminer sa multiplication.',
    },
  ],
  questions: [
    {
      line: 3,
      prompt: 'Au cas de base, que renvoie factorielle(1) ?',
      choices: ['0', '1', '4'],
      answer: 1,
      explanation: 'Le cas de base renvoie 1. Il arrête la récursion.',
    },
  ],
} satisfies Exercise;
