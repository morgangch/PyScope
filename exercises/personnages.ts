import type { Exercise } from '../src/engine/types';
export default {
  id: 'personnages',
  recommendedLevel: 'terminale', notions: ['poo', 'self', 'references', 'mutation', 'pile'], prerequisites: ['fonctions', 'listes'], objective: 'Distinguer self dans deux méthodes imbriquées et suivre leurs effets.', difficulty: 3,
  title: 'Les objets',
  subtitle: 'Deux personnages, des références',
  level: 'Terminale',
  themes: ['Objets'],
  visualization: 'objects',
  instruction:
    'Lara et Milo échangent des pièces. Suivez leurs soldes et découvrez pourquoi deux noms peuvent désigner le même objet.',
  initial: {},
  code: `class Personnage:
    def __init__(self, nom, nbPieces):
        self.nom = nom
        self.nbPieces = nbPieces

    def donnerPiecesA(self, destinataire, nombre_de_pieces):
        self.nbPieces -= nombre_de_pieces
        destinataire.nbPieces += nombre_de_pieces

    def volerPiecesA(self, victime, nombre_de_pieces):
        victime.donnerPiecesA(self, nombre_de_pieces)

lara = Personnage("Lara", 20)
milo = Personnage("Milo", 10)
alliee = lara
lara.donnerPiecesA(milo, 5)
lara.volerPiecesA(milo, 3)
print(lara.nom, lara.nbPieces)
print(milo.nom, milo.nbPieces)`,
  explanations: [
    {
      event: 'line',
      line: 16,
      text: 'lara et alliee référencent le même objet. L’affectation ne crée pas de copie de Lara.',
    },
    {
      event: 'call',
      functionName: 'volerPiecesA',
      text: 'self désigne Lara et victime désigne Milo. Lara demande à Milo de lui donner des pièces.',
    },
    {
      event: 'line',
      line: 8,
      text: 'Le débit est déjà visible. La ligne surlignée va maintenant créditer le destinataire.',
    },
  ],
} satisfies Exercise;
