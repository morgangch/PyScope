import type { Exercise } from '../../src/engine/types';
export const treeCode = `class Noeud:
    def __init__(self, nom, gauche=None, droite=None):
        self.nom = nom
        self.gauche = gauche
        self.droite = droite

    def taille(self):
        total = 1
        if self.gauche is not None:
            total += self.gauche.taille()
        if self.droite is not None:
            total += self.droite.taille()
        return total

feuille = Noeud("C")
branche = Noeud("B", feuille)
racine = Noeud("A", branche, Noeud("D"))
resultat = racine.taille()
print(resultat)`;
export default [
  { id: 'poo-rec-chaine', title: 'Une méthode, plusieurs objets', subtitle: 'Suivre une chaîne de références récursivement', level: 'Terminale', recommendedLevel: 'terminale', difficulty: 2,
    themes: ['Objets', 'Récursivité'], notions: ['poo', 'recursion', 'self', 'references', 'cas-base', 'pile'], prerequisites: ['poo', 'self', 'recursion', 'retours'], visualization: 'combined', initial: {},
    objective: 'Comprendre que chaque appel récursif possède son propre self.', instruction: 'Chaque maillon demande sa longueur au suivant. La même méthode est appelée sur trois objets différents.',
    code: `class Maillon:
    def __init__(self, nom, suivant=None):
        self.nom = nom
        self.suivant = suivant

    def longueur(self):
        if self.suivant is None:
            return 1
        suite = self.suivant.longueur()
        return 1 + suite

fin = Maillon("C")
milieu = Maillon("B", fin)
debut = Maillon("A", milieu)
resultat = debut.longueur()
print(resultat)`,
    questionSpecs: [
      { id: 'chaine-self', event: 'call', functionName: 'longueur', selfName: 'B', read: 'self', prompt: 'Quel objet est self dans cet appel ?', explanation: 'A a appelé sa référence suivant. Le nouvel appel reçoit donc B pour self ; A reste dans la pile.' },
      { id: 'chaine-parent', event: 'call', functionName: 'longueur', selfName: 'C', read: 'caller', prompt: 'Quel appel attend le résultat de celui-ci ?', explanation: 'B attend directement C. A attend B : il n’est pas l’appelant direct de C.' },
      { id: 'chaine-retour', event: 'return', functionName: 'longueur', selfName: 'B', read: 'return', prompt: 'Quelle valeur remonte au parent ?', explanation: 'B compte un maillon pour lui-même et un pour C : il renvoie 2 à A.' },
    ] },
  { id: 'poo-rec-arbre', title: 'Compter un arbre d’objets', subtitle: 'POO × récursivité × arbres', level: 'Terminale', recommendedLevel: 'terminale', difficulty: 3,
    themes: ['Objets', 'Récursivité', 'Arbres'], notions: ['poo', 'recursion', 'arbres', 'parcours', 'self', 'references', 'pile', 'retours'], prerequisites: ['poo', 'self', 'recursion', 'cas-base', 'references'], visualization: 'combined', initial: {},
    objective: 'Additionner les tailles des sous-arbres via des appels de méthode sur leurs racines.', instruction: 'A référence B et D ; B référence C. Suivez self dans chaque carte et la taille renvoyée au parent. Une feuille renvoie 1.',
    code: treeCode,
    questionSpecs: [
      { id: 'arbre-self', event: 'call', functionName: 'taille', selfName: 'B', read: 'self', prompt: 'Quel objet est self dans cet appel ?', explanation: 'A utilise self.gauche pour appeler taille sur B. Le self de l’appel A ne change pas.' },
      { id: 'arbre-attente', event: 'call', functionName: 'taille', selfName: 'C', read: 'caller', prompt: 'Quel appel attend le résultat de celui-ci ?', explanation: 'C renverra sa taille à B. A attend toujours le sous-arbre B avant de visiter D.' },
      { id: 'arbre-retour', event: 'return', functionName: 'taille', selfName: 'B', read: 'return', prompt: 'Quelle valeur remonte au parent ?', explanation: 'Le sous-arbre B contient B et C. La valeur 2 remonte à A ; D sera visité ensuite.' },
    ],
    explanations: [{ event: 'return', functionName: 'taille', text: 'Cet appel renvoie la taille de son sous-arbre. Observez son self, puis la carte de son parent qui attend.' }] },
] satisfies Exercise[];
