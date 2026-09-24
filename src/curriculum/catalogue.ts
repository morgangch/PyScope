import { exercises } from '../../exercises';
import type { Level, NotionId } from './notions';

export interface Chapter {
  id: string; theme: string; title: string; levels: Level[];
  status: 'available' | 'planned' | 'conceptual';
  description: string; notions: NotionId[]; exerciseIds: string[];
  origin: 'programme' | 'pedagogical';
}
export const themes = [
  { id: 'donnees', title: 'Données et représentations' },
  { id: 'programmation', title: 'Langages et programmation' },
  { id: 'algorithmes', title: 'Algorithmique' },
  { id: 'structures', title: 'Structures de données' },
  { id: 'machines', title: 'Architectures et systèmes' },
  { id: 'communications', title: 'Réseaux, Web et bases de données' },
  { id: 'transversal', title: 'Culture informatique et projets' },
];
export const chapters: Chapter[] = [
  { id:'recherche',theme:'algorithmes',title:'Recherche et dichotomie',levels:['premiere'],status:'available',origin:'programme',description:'Du premier milieu aux cas limites, puis aux conventions de bornes.',notions:['listes','dichotomie','bornes','tests'],exerciseIds:['recherche-milieu','recherche-vide','dichotomie','recherche-extremites','recherche-absent','recherche-bornes'] },
  { id:'recursivite',theme:'programmation',title:'Récursivité',levels:['terminale'],status:'available',origin:'programme',description:'Cas de base, retours et branchements ; jusqu’aux méthodes récursives sur des objets liés.',notions:['fonctions','cas-base','pile','recursion','retours','parcours'],exerciseIds:['rec-compte','factorielle','rec-somme-liste','rec-imbriques','rec-fibonacci','poo-rec-chaine','poo-rec-arbre'] },
  { id:'objets',theme:'programmation',title:'Programmation objet',levels:['terminale'],status:'available',origin:'programme',description:'Identités, références et méthodes, puis récursion entre plusieurs objets.',notions:['poo','self','references','mutation','listes','recursion'],exerciseIds:['poo-creation','poo-alias','poo-mutation','poo-liste','personnages','poo-rec-chaine','poo-rec-arbre'] },
  { id:'arbres',theme:'structures',title:'Arbres et objets liés',levels:['terminale'],status:'available',origin:'programme',description:'Deux premiers ateliers disponibles : chaîne puis taille d’un arbre. Hauteur, parcours et ABR restent à développer.',notions:['references','arbres','poo','recursion','parcours'],exerciseIds:['poo-rec-chaine','poo-rec-arbre'] },
  { id:'types',theme:'donnees',title:'Types et représentation des données',levels:['premiere'],status:'planned',origin:'programme',description:'Bases numériques, relatifs, flottants, logique et encodages.',notions:['binaire','flottants','booleens','encodage'],exerciseIds:[] },
  { id:'collections',theme:'donnees',title:'Séquences et collections',levels:['premiere'],status:'planned',origin:'programme',description:'Tableaux, compréhensions, tuples, matrices et dictionnaires.',notions:['listes','tuples','dictionnaires'],exerciseIds:[] },
  { id:'tables',theme:'donnees',title:'Traitement de données en tables',levels:['premiere'],status:'planned',origin:'programme',description:'Importer, filtrer, trier, vérifier et fusionner des tables.',notions:['tables','tests','tris'],exerciseIds:[] },
  { id:'bases-python',theme:'programmation',title:'Programmer, spécifier et tester',levels:['premiere','terminale'],status:'planned',origin:'programme',description:'Variables, conditions, boucles, fonctions, assertions et débogage.',notions:['variables','conditions','boucles','fonctions','tests'],exerciseIds:[] },
  { id:'modularite',theme:'programmation',title:'Modules et paradigmes',levels:['premiere','terminale'],status:'planned',origin:'programme',description:'Documentation, bibliothèques, API, modules et styles de programmation.',notions:['modularite','paradigmes'],exerciseIds:[] },
  { id:'calculabilite',theme:'programmation',title:'Calculabilité et décidabilité',levels:['terminale'],status:'conceptual',origin:'programme',description:'Programmes comme données et problème de l’arrêt : une activité de raisonnement à concevoir.',notions:['calculabilite'],exerciseIds:[] },
  { id:'algos-premiere',theme:'algorithmes',title:'Parcours, tris et choix gloutons',levels:['premiere'],status:'planned',origin:'programme',description:'Parcours séquentiels, tris insertion/sélection, gloutons et k plus proches voisins.',notions:['listes','tris','gloutons','knn','complexite'],exerciseIds:[] },
  { id:'algos-terminale',theme:'algorithmes',title:'Stratégies algorithmiques',levels:['terminale'],status:'planned',origin:'programme',description:'Diviser pour régner, programmation dynamique et recherche textuelle.',notions:['diviser-regner','dynamique','recherche-texte','complexite'],exerciseIds:[] },
  { id:'lineaires',theme:'structures',title:'Structures abstraites, piles et files',levels:['terminale'],status:'planned',origin:'programme',description:'Interfaces, implémentations et structures linéaires ; dictionnaires et clés.',notions:['abstractions','piles-files','dictionnaires'],exerciseIds:[] },
  { id:'graphes',theme:'structures',title:'Graphes et parcours',levels:['terminale'],status:'planned',origin:'programme',description:'Représentations, parcours en profondeur et largeur, chemins et cycles.',notions:['graphes','parcours'],exerciseIds:[] },
  { id:'architecture',theme:'machines',title:'Architecture matérielle',levels:['premiere','terminale'],status:'conceptual',origin:'programme',description:'Circuits, von Neumann, instructions machine et systèmes sur puce : schémas matériels nécessaires.',notions:['architecture','soc'],exerciseIds:[] },
  { id:'systemes',theme:'machines',title:'Systèmes et processus',levels:['premiere','terminale'],status:'conceptual',origin:'programme',description:'Commandes, permissions, ordonnancement et interblocage : visualisation dédiée à concevoir.',notions:['systemes','processus'],exerciseIds:[] },
  { id:'ihm',theme:'machines',title:'Interfaces et objets connectés',levels:['premiere'],status:'conceptual',origin:'programme',description:'Capteurs, actionneurs et interactions avec le monde physique.',notions:['ihm'],exerciseIds:[] },
  { id:'reseaux',theme:'communications',title:'Réseaux et communications sécurisées',levels:['premiere','terminale'],status:'conceptual',origin:'programme',description:'Paquets, protocoles, routage et chiffrement : simulateur de réseau requis.',notions:['reseaux','routage','chiffrement'],exerciseIds:[] },
  { id:'web',theme:'communications',title:'Web et interaction client-serveur',levels:['premiere'],status:'conceptual',origin:'programme',description:'HTML, événements, formulaires et HTTP : vue navigateur/serveur à concevoir.',notions:['web'],exerciseIds:[] },
  { id:'bdd',theme:'communications',title:'Bases de données et SQL',levels:['terminale'],status:'conceptual',origin:'programme',description:'Modèle relationnel, clés, intégrité, SGBD et requêtes : tables et moteur SQL nécessaires.',notions:['relationnel','sql'],exerciseIds:[] },
  { id:'histoire',theme:'transversal',title:'Histoire de l’informatique',levels:['premiere','terminale'],status:'conceptual',origin:'programme',description:'Repères historiques à relier aux notions ; frise et documents à concevoir.',notions:['histoire'],exerciseIds:[] },
  { id:'projets',theme:'transversal',title:'Projets, coopération et responsabilité',levels:['premiere','terminale'],status:'planned',origin:'programme',description:'Conception, argumentation, travail en équipe et regard critique sur les usages.',notions:['projets','responsabilite','tests'],exerciseIds:[] },
];
export const statusLabels = { available: 'Exercices disponibles', planned: 'Prévu · sans exercice', conceptual: 'Autre visualisation à concevoir' };
export function chapterExercises(chapter: Chapter) {
  return chapter.exerciseIds.map(id => exercises.find(e => e.id === id)!).filter(Boolean);
}
export function chapterProgress(chapter: Chapter, completed: string[]) {
  const ids = [...new Set(chapter.exerciseIds)];
  return { done: ids.filter(id => completed.includes(id)).length, total: ids.length,
    complete: chapter.status === 'available' && ids.length > 0 && ids.every(id => completed.includes(id)) };
}
