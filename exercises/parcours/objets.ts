import type { Exercise } from '../../src/engine/types';
export default [
  { id: 'poo-creation', title: 'Naissance d’un objet', subtitle: 'Un constructeur et deux attributs', level: 'Terminale', recommendedLevel: 'terminale', difficulty: 1,
    themes: ['Objets'], notions: ['poo', 'self'], prerequisites: ['fonctions', 'variables'], visualization: 'objects', initial: {},
    objective: 'Relier self pendant le constructeur à la variable créée après son retour.', instruction: 'L’objet existe avant que la variable lara ne le référence. Regardez self pendant __init__.',
    code: `class Personnage:
    def __init__(self, nom):
        self.nom = nom
        self.nbPieces = 0

lara = Personnage("Lara")
print(lara.nom, lara.nbPieces)`,
    questions: [{ line: 4, prompt: 'lara référence-t-elle déjà l’objet pendant le constructeur ?', choices: ['Oui', 'Non'], answer: 1, explanation: 'L’affectation à lara attend la fin du constructeur. Pour le moment, self référence l’objet.' }] },
  { id: 'poo-alias', title: 'Deux noms, un seul objet', subtitle: 'Réaffecter un nom ne déplace pas les autres', level: 'Terminale', recommendedLevel: 'terminale', difficulty: 1,
    themes: ['Objets'], notions: ['poo', 'references', 'mutation'], prerequisites: ['poo', 'self'], visualization: 'objects', initial: {},
    objective: 'Distinguer mutation d’un objet et réaffectation d’un nom.', instruction: 'alliee garde le premier objet, même lorsque lara reçoit un autre objet. Suivez les flèches.',
    code: `class Personnage:
    def __init__(self, nom):
        self.nom = nom

lara = Personnage("Lara")
alliee = lara
alliee.nom = "Lara exploratrice"
lara = Personnage("Milo")
print(alliee.nom)
print(lara.nom)`,
    questions: [{ line: 9, prompt: 'alliee désigne-t-elle maintenant Milo ?', choices: ['Oui', 'Non'], answer: 1, explanation: 'Seule lara a été réaffectée. alliee garde sa référence au premier objet modifié.' }] },
  { id: 'poo-mutation', title: 'Modifier ou renvoyer ?', subtitle: 'Une méthode peut changer l’état et renvoyer None', level: 'Terminale', recommendedLevel: 'terminale', difficulty: 2,
    themes: ['Objets'], notions: ['poo', 'self', 'mutation', 'retours'], prerequisites: ['poo', 'retours'], visualization: 'objects', initial: {},
    objective: 'Ne pas confondre effet de bord et valeur de retour.', instruction: 'La méthode ajouter augmente le solde mais ne contient pas de return. Que reçoit resultat ?',
    code: `class Compteur:
    def __init__(self):
        self.valeur = 0

    def ajouter(self, quantite):
        self.valeur += quantite

compteur = Compteur()
resultat = compteur.ajouter(5)
print(compteur.valeur, resultat)`,
    questionSpecs: [{ id: 'mutation-retour', event: 'return', functionName: 'ajouter', read: 'return', prompt: 'Que renvoie ajouter après avoir modifié l’objet ?', explanation: 'Sans return explicite, une méthode renvoie None. Le changement de valeur reste dans l’objet.' }] },
  { id: 'poo-liste', title: 'Une équipe dans une liste', subtitle: 'Les éléments sont aussi des références', level: 'Terminale', recommendedLevel: 'terminale', difficulty: 2,
    themes: ['Objets', 'Collections'], notions: ['poo', 'listes', 'references', 'mutation'], prerequisites: ['poo', 'listes', 'boucles'], visualization: 'objects', initial: {},
    objective: 'Observer une liste contenant deux fois le même objet.', instruction: 'Lara apparaît deux fois dans equipe. Chaque passage de boucle modifie l’objet référencé, sans créer de copie.',
    code: `class Personnage:
    def __init__(self, nom):
        self.nom = nom
        self.nbPieces = 0

lara = Personnage("Lara")
milo = Personnage("Milo")
equipe = [lara, milo, lara]
for personnage in equipe:
    personnage.nbPieces += 1
print(lara.nbPieces, milo.nbPieces)`,
    questions: [{ line: 11, prompt: 'Pourquoi Lara a-t-elle deux pièces ?', choices: ['La liste contient deux Lara différentes', 'La même Lara est visitée deux fois'], answer: 1, explanation: 'Les éléments 0 et 2 référencent exactement le même objet.' }] },
] satisfies Exercise[];
