import type { Exercise } from '../../src/engine/types';
const common = { level: 'Terminale', recommendedLevel: 'terminale' as const, themes: ['Récursivité'], visualization: 'recursion' as const, initial: {}, prerequisites: ['fonctions', 'conditions'] };
export default [
  { ...common, id: 'rec-compte', title: 'Le cas de base', subtitle: 'Descendre jusqu’à zéro', difficulty: 1,
    notions: ['recursion', 'cas-base', 'pile'], prerequisites: ['fonctions', 'conditions'],
    objective: 'Comprendre pourquoi la récursion doit s’arrêter.', instruction: 'Le compteur diminue à chaque appel. Observez le dernier appel : il ne rappelle personne.',
    code: `def compte(n):
    if n == 0:
        return 0
    return compte(n - 1)

resultat = compte(3)
print(resultat)`,
    questionSpecs: [{ id: 'profondeur', event: 'call', functionName: 'compte', occurrence: 4, read: 'depth', prompt: 'Combien d’appels sont maintenant dans la pile ?', explanation: 'Les appels pour 3, 2, 1 puis 0 coexistent. Le cas de base est lui aussi un appel.' }] },
  { ...common, id: 'rec-somme-liste', title: 'La somme d’une liste', subtitle: 'Avancer un indice sans copier la liste', difficulty: 2,
    notions: ['recursion', 'listes', 'references', 'retours'], prerequisites: ['fonctions', 'listes', 'cas-base'],
    objective: 'Partager une liste entre les appels en changeant seulement l’indice.', instruction: 'Chaque appel consulte la même liste, à un indice différent. La liste vide restante contribue 0.',
    code: `def somme(nombres, indice):
    if indice == len(nombres):
        return 0
    suite = somme(nombres, indice + 1)
    return nombres[indice] + suite

nombres = [4, 2, 7]
resultat = somme(nombres, 0)
print(resultat)`,
    questionSpecs: [{ id: 'somme-retour', event: 'return', functionName: 'somme', occurrence: 2, read: 'return', prompt: 'Quelle somme remonte de ce suffixe de liste ?', explanation: 'L’appel d’indice 2 ajoute 7 au résultat 0 du cas de base.' }] },
  { ...common, id: 'rec-imbriques', title: 'Deux appels dans une expression', subtitle: 'L’argument est calculé avant l’appel extérieur', difficulty: 2,
    notions: ['pile', 'fonctions', 'retours'], prerequisites: ['fonctions', 'retours'],
    objective: 'Distinguer composition d’appels et récursion.', instruction: 'Avant d’appeler doubler, Python doit obtenir la valeur de incrementer. Il ne s’agit pas de récursion : aucune fonction ne s’appelle elle-même.',
    code: `def incrementer(nombre):
    return nombre + 1

def doubler(nombre):
    return 2 * nombre

def calculer(nombre):
    return doubler(incrementer(nombre))

resultat = calculer(3)
print(resultat)`,
    questionSpecs: [{ id: 'attente', event: 'call', functionName: 'incrementer', read: 'caller', prompt: 'Quel appel attend le résultat de incrementer ?', explanation: 'calculer évalue l’expression. doubler n’est pas encore empilé : son argument n’est pas prêt.' }] },
  { ...common, id: 'rec-fibonacci', title: 'Une récursion qui se sépare', subtitle: 'Deux branches, plusieurs calculs identiques', difficulty: 3,
    notions: ['recursion', 'cas-base', 'pile', 'complexite'], prerequisites: ['recursion', 'retours'],
    objective: 'Observer des appels successifs plutôt que simultanés sur les deux branches.', instruction: 'Suivez fibonacci(4). La branche gauche revient avant le début de la branche droite. Repérez les calculs répétés.',
    code: `def fibonacci(n):
    if n <= 1:
        return n
    gauche = fibonacci(n - 1)
    droite = fibonacci(n - 2)
    return gauche + droite

resultat = fibonacci(4)
print(resultat)`,
    questionSpecs: [{ id: 'fibo-retour', event: 'return', functionName: 'fibonacci', occurrence: 3, read: 'return', prompt: 'Quelle valeur renvoie le premier appel fibonacci(2) ?', explanation: 'Ses deux sous-appels ont renvoyé 1 et 0. Leur somme remonte au parent.' }] },
] satisfies Exercise[];
