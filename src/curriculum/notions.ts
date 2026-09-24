/** Stable identifiers; labels can change without changing exercise identity. */
export const notions = {
  variables: 'Variables et affectations', conditions: 'Conditions', boucles: 'Boucles',
  fonctions: 'Fonctions et paramètres', retours: 'Valeurs de retour', tests: 'Tests et assertions',
  listes: 'Listes et indices', tuples: 'Tuples', dictionnaires: 'Dictionnaires', tables: 'Données en tables',
  dichotomie: 'Dichotomie', bornes: 'Bornes et invariants', complexite: 'Coût des algorithmes',
  recursion: 'Récursivité', 'cas-base': 'Cas de base', pile: 'Pile des appels',
  poo: 'Programmation objet', self: 'Attributs et self', references: 'Références partagées',
  mutation: 'Modification d’état', arbres: 'Arbres', parcours: 'Parcours récursifs',
  binaire: 'Entiers et bases', flottants: 'Nombres flottants', booleens: 'Logique booléenne', encodage: 'Encodage du texte',
  tris: 'Tris', gloutons: 'Algorithmes gloutons', knn: 'k plus proches voisins',
  'diviser-regner': 'Diviser pour régner', dynamique: 'Programmation dynamique', 'recherche-texte': 'Recherche textuelle',
  abstractions: 'Interfaces et implémentations', 'piles-files': 'Piles et files', graphes: 'Graphes',
  modularite: 'Modularité et bibliothèques', paradigmes: 'Paradigmes', calculabilite: 'Calculabilité et décidabilité',
  architecture: 'Processeur, mémoire et circuits', soc: 'Systèmes sur puce', systemes: 'Systèmes et permissions', processus: 'Processus et interblocage', ihm: 'Capteurs, actionneurs et IHM',
  reseaux: 'Paquets et protocoles', routage: 'Routage', chiffrement: 'Communications sécurisées',
  web: 'Web, événements et HTTP', relationnel: 'Modèle relationnel', sql: 'SQL',
  histoire: 'Histoire de l’informatique', projets: 'Projets et coopération', responsabilite: 'Usages responsables',
} as const;
export type NotionId = keyof typeof notions;
export type Level = 'premiere' | 'terminale' | 'approfondissement';
export const levelLabels: Record<Level, string> = { premiere: 'Première', terminale: 'Terminale', approfondissement: 'Approfondissement' };
export const difficultyLabels = { 1: 'Découverte', 2: 'Consolidation', 3: 'Défi' } as const;
