# Programme NSI et périmètre de PyScope

Vérification effectuée le **24 septembre 2026** sur la [page éduscol des programmes en vigueur](https://eduscol.education.gouv.fr/5823/programmes-et-ressources-en-numerique-et-sciences-informatiques-voie-g). Elle référence les programmes de 2019 pour les deux niveaux :

- [Première — BO spécial n° 1 du 22 janvier 2019](https://eduscol.education.gouv.fr/sites/default/files/document/spe633annexe1063268pdf-89499.pdf).
- [Terminale — BO spécial n° 8 du 25 juillet 2019](https://eduscol.education.gouv.fr/sites/default/files/document/spe247annexe1158933pdf-89502.pdf).

Les **sept thèmes et vingt-deux chapitres de PyScope sont un découpage pédagogique**, pas une reproduction du sommaire officiel. Le programme n’impose pas un plan de cours unique. Ce catalogue couvre les grandes rubriques, sans prétendre fournir tous les cours, exercices ou capacités attendues. Les ressources d’accompagnement et les sujets d’épreuve ne sont pas assimilés à des ajouts obligatoires au programme.

## Correspondance du squelette

| Chapitre PyScope | Niveau | Repère dans le programme officiel | État actuel |
|---|---|---|---|
| Types et représentation | Première | Données de base, p. 4 | Prévu |
| Séquences et collections | Première | Types construits, p. 4–5 | Prévu |
| Traitement de tables | Première | Tables, p. 5 | Prévu |
| Programmer, spécifier et tester | Les deux | Programmation, première p. 8 ; terminale p. 7–8 | Prévu |
| Modules et paradigmes | Les deux | Même rubrique | Prévu |
| Récursivité | Terminale | Programmation, p. 7 | Ateliers disponibles |
| Programmation objet | Terminale | Structures, p. 4 ; paradigmes, p. 8 | Ateliers disponibles |
| Calculabilité et décidabilité | Terminale | Programmation, p. 7 | Autre visualisation |
| Recherche et dichotomie | Première | Algorithmique, p. 9 | Ateliers disponibles |
| Parcours, tris et choix gloutons | Première | Algorithmique, p. 9 | Prévu |
| Stratégies algorithmiques | Terminale | Algorithmique, p. 9 | Prévu |
| Structures abstraites, piles et files | Terminale | Structures, p. 4 | Prévu |
| Arbres et objets liés | Terminale | Structures, p. 4 ; algorithmique, p. 8 | Deux ateliers disponibles |
| Graphes et parcours | Terminale | Mêmes rubriques | Prévu |
| Architecture matérielle | Les deux | Architectures, première p. 7 ; terminale p. 6 | Autre visualisation |
| Systèmes et processus | Les deux | Architectures/systèmes, première p. 7 ; terminale p. 6 | Autre visualisation |
| Interfaces et objets connectés | Première | Architectures et IHM, p. 7 | Autre visualisation |
| Réseaux et communications sécurisées | Les deux | Première p. 7 ; terminale p. 7 | Autre visualisation |
| Web et client-serveur | Première | Interactions Web, p. 6 | Autre visualisation |
| Bases de données et SQL | Terminale | Bases de données, p. 5–6 | Autre visualisation |
| Histoire de l’informatique | Les deux | Rubrique transversale, p. 3 | Autre visualisation |
| Projets, coopération et responsabilité | Les deux | Préambule et démarche de projet, p. 1–2 | Prévu |

Les numéros correspondent aux pages des deux PDF liés ci-dessus. Les notions précisées dans `src/curriculum/notions.ts` couvrent notamment les types construits, les méthodes de recherche, les stratégies algorithmiques, les structures, les systèmes et les communications. Pour les contenus prévus, leur présence dans le catalogue signifie uniquement que leur place a été identifiée.

## Trois états, sans faux achèvement

- `available` : au moins un exercice exécutable ; le compteur porte uniquement sur les exercices disponibles, **pas sur la maîtrise complète du chapitre**.
- `planned` : aucun exercice ; seul le descriptif et l’ordre des notions sont présentés, sans pourcentage ni bouton de lancement.
- `conceptual` : sujet qui demande un autre support (schéma matériel, simulation réseau, SQL, frise, raisonnement). Aucun support interactif n’est annoncé comme déjà réalisé.

Les tests empêchent qu’un chapitre vide soit considéré terminé. Le catalogue affiche « exploré » après la dernière étape d’une trace ; ce n’est pas une certification de compétence.

## Choix et ajouts pédagogiques

Les identifiants `references`, `self`, `pile`, `cas-base`, `mutation`, `retours` et `bornes` rendent explicites des mécanismes utiles pour comprendre le programme. Ce sont nos subdivisions pédagogiques, pas des intitulés officiels supplémentaires. La pile d’appels n’est pas confondue avec le type abstrait « pile ».

Les programmes Lara/Milo, le compteur, Fibonacci et les exercices A/B/C/D sont nos supports. Les tests aux extrémités, le cas vide, la première occurrence à bornes semi-ouvertes et les questions sur les alias approfondissent des pièges précis ; ils ne sont pas des algorithmes imposés sous cette forme. Le cas `rec-imbriques` est explicitement une composition de fonctions **sans récursion**, utilisée pour apprendre à lire les appels avant les exercices à branchement.

`poo-rec-chaine` prépare le parcours d’objets liés ; `poo-rec-arbre` combine réellement méthode récursive, attributs de références, arbre binaire et retour de taille. Ce croisement met en œuvre des notions du programme terminale, sans exiger héritage ni polymorphisme. La récursivité historique de PyScope est désormais conseillée en terminale ; son identifiant et sa progression sont conservés.

Le mode libre, le générateur à seed, la navigation croisée et les animations sont des outils pédagogiques propres à PyScope. `approfondissement` est un niveau de catalogue disponible pour les ajouts futurs, pas une troisième classe officielle.
