# PyScope — Python, à la loupe

Parcours interactif de **NSI première et terminale**, en français : **18 exercices distincts**, 4 chapitres avec ateliers, un squelette de 22 chapitres, un mode Code libre et 4 modèles de génération déterministe. Les programmes sont exécutés avec **CPython via Pyodide dans un Web Worker**, puis l’élève parcourt leurs instantanés dans les deux sens. Aucun serveur Python, aucun compte, aucune génération par IA.

Publication prévue : **https://morgangch.github.io/PyScope/**.

## Installation et lancement

Prérequis : **Node.js 22.12 ou supérieur** et npm. Aucune installation de Python nécessaire.

```sh
git clone git@github.com:morgangch/PyScope.git
cd PyScope
npm ci
npm run dev
```

Ouvrir **http://127.0.0.1:5173/PyScope/**. La commande copie automatiquement le moteur dans `public/pyodide/`. Son premier chargement (~14 Mo non compressés) peut prendre quelques secondes. Le moteur et les polices sont servis localement avec le site, sans CDN.

Pour le build de production :

```sh
npm run build
npm run preview
```

Ouvrir **http://127.0.0.1:4173/PyScope/**. Le site publiable se trouve dans `dist/`. Utiliser un serveur HTTP, pas une ouverture directe de `index.html` avec `file://`.

## Parcours et commandes

Le catalogue est organisé en thèmes → chapitres → notions → exercices. Les chapitres proposent un ordre, mais n’interdisent aucun exercice. L’accès « Tous les exercices » permet une recherche libre avec filtres de notion et de niveau.

- **Recherche et dichotomie** : première comparaison, liste vide, recherche complète, extrémités testées, absence et première occurrence avec bornes semi-ouvertes.
- **Récursivité** : cas de base, factorielle, somme de liste, appels composés (explicitement distingués de la récursion), Fibonacci, chaîne puis arbre d’objets.
- **Programmation objet** : construction, alias et réaffectation, modification d’état versus retour, liste d’objets, appels imbriqués, méthodes récursives.
- **Arbres et objets liés** : chaîne préparatoire et taille d’arbre. Le parcours complet sur les arbres (hauteur, ordres de parcours, ABR) reste à enrichir.

L’exercice `poo-rec-arbre` est le **même exercice**, avec le même identifiant, dans trois chapitres. Il appelle récursivement `taille()` sur A, B, C puis D et renvoie successivement `1, 2, 1, 4`. Les cartes montrent chaque `self`, les liens d’attributs pointent vers les objets et les questions ciblent le destinataire, l’appelant et le retour. Sa progression ne dépend jamais du chapitre d’accès.

Les trois exercices historiques restent disponibles avec leurs identifiants et traces :

- **Récursion** : `factorielle(4)`, quatre appels distincts, cas de base, retours `1 → 2 → 6 → 24`, puis sortie `24`.
- **Dichotomie** : recherche de `18` dans `[11, 11.4, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]` → indice `8`. Le sélecteur propose aussi `18.5`, absente → `-1`. Les bornes, le milieu, les cases exclues et la portion restante sont visualisés.
- **Objets** : Lara et Milo possèdent initialement 20 et 10 pièces. Lara donne 5 pièces à Milo, puis lui en vole 3 ; soldes finaux **18 et 12**. `lara` et `alliee` désignent la même instance. Dans l’appel imbriqué de vol, `self` désigne Milo dans `donnerPiecesA`, et Lara dans `volerPiecesA`.

Commandes : précédent, suivant, lecture automatique, pause, recommencer, vitesse et curseur de parcours. Raccourcis hors champs et boutons : **←**, **→**, **Espace**.

Les questions suspendent la lecture jusqu’à une réponse ou « Passer la question ». Elles sont facultatives : désactiver les coups de pouce les masque avec les explications spécifiques. Le curseur reste libre. Les réponses sont remises à zéro par « Recommencer ».

Le dernier exercice guidé, la position de chaque variante et les exercices explorés sont conservés dans `localStorage` (`pyscope-progress-v1`). **Compatibilité conservée** : les clés historiques `factorielle:default`, `dichotomie:present`, etc. ne changent pas, et les tableaux `completed` restent indexés par exercice. Un chapitre vide n’est jamais terminé ; atteindre la fin d’un exercice signifie « exploré », pas « acquis ». Au rechargement, la trace est recalculée et la position restaurée. Un stockage indisponible n’empêche pas l’utilisation. Pas de synchronisation entre appareils.

Les routes utilisent le fragment d’URL (`#chapter/recursivite`, `#exercise/poo-rec-arbre`, `#libre`, `#generateur?...`) : aucun routage serveur ni fichier 404 spécial n’est nécessaire sur GitHub Pages.

## Choix techniques

**React + TypeScript + Vite** permet de séparer les composants pédagogiques, de typer les données d’exercices et de produire un site statique pour GitHub Pages. Pyodide fournit un véritable Python WebAssembly, exécuté hors du thread de l’interface. Aucun service payant n’est nécessaire.

```text
exercises/                   Exercices TypeScript et registre automatique
src/engine/types.ts          Contrats Exercise, Trace et Step
src/engine/tracer.py         Instrumentation générique avec sys.settrace
src/engine/free_policy.py    Sous-ensemble Python vérifié pour le code libre
src/engine/questions.ts      Questions résolues depuis les traces réelles
src/engine/python.worker.ts  Chargement et exécution de Pyodide
src/engine/useTrace.ts       Worker, états de chargement et délais maximums
src/components/              Code, pile, mémoire et valeurs
src/components/Workspace.tsx Lecteur commun aux trois modes
src/curriculum/              Notions stables, thèmes, chapitres, rattachements
src/generation/templates.ts  Modèles versionnés, seeds et intersections
src/App.tsx                  Navigation par fragments et progression partagée
src/storage.ts               Progression locale
scripts/copy-runtime.mjs     Copie du moteur depuis le paquet npm
tests/engine.test.ts         Tests sur le véritable Python de Pyodide
tests/e2e/                   Tests Chromium du build de production
.github/workflows/pages.yml  Construction, vérifications et publication
```

Références : [Pyodide et les bundlers](https://pyodide.org/en/0.27.7/usage/working-with-bundlers.html), [sys.settrace](https://docs.python.org/3/library/sys.html#sys.settrace).

## Ajouter un exercice en 5 minutes

1. Créer `exercises/somme.ts`.
2. Copier l’exemple complet ci-dessous et adapter le programme et la consigne.
3. Choisir un identifiant unique, des identifiants de notions, des paramètres `initial` et un mode.
4. Facultativement, associer des explications ou questions aux lignes importantes.
5. Ajouter cet identifiant à `exerciseIds` d’un ou plusieurs chapitres dans `src/curriculum/catalogue.ts`. Ouvrir le catalogue avec `npm run dev`, puis lancer `npm test` et `npm run build`.

**Aucun composant ni capture d’état à modifier.** Le registre `exercises/index.ts` découvre récursivement les fichiers `.ts` avec un `export default` contenant un exercice ou un tableau d’exercices. Garder les utilitaires ailleurs. Les fichiers `exercises/parcours/` montrent les regroupements par sujet.

```ts
// exercises/somme.ts
import type { Exercise } from '../src/engine/types';

export default {
  id: 'somme-recursive',
  title: 'Additionner en récursif',
  subtitle: 'Chaque appel apporte un nombre',
  level: 'Terminale', // compatibilité des anciens fichiers
  recommendedLevel: 'terminale',
  themes: ['Récursion'],
  notions: ['recursion', 'cas-base', 'retours'],
  prerequisites: ['fonctions', 'conditions'],
  objective: 'Relier une somme au retour des appels récursifs.',
  difficulty: 2,
  instruction: 'Suivez somme(3). Quel appel arrête la récursion ?',
  visualization: 'recursion',
  initial: { nombre: 3 },
  code: `def somme(n):
    if n == 0:
        return 0
    resultat = n + somme(n - 1)
    return resultat

total = somme(nombre)
print(total)`,
  explanations: [
    {
      event: 'call',
      functionName: 'somme',
      text: 'Un nouvel appel possède sa propre valeur de n.',
    },
    {
      event: 'line',
      line: 3,
      text: 'Le cas de base renvoie 0 sans rappeler somme.',
    },
  ],
  questions: [
    {
      line: 3,
      prompt: 'Quelle valeur sera affichée à la fin ?',
      choices: ['3', '6', '9'],
      answer: 1,
      explanation: '3 + 2 + 1 + 0 = 6.',
    },
  ],
} satisfies Exercise;
```

`initial` injecte des variables globales **avant** l’exécution : nombres, textes, booléens ou tableaux de nombres. Les valeurs ne sont pas évaluées comme du code. Le programme doit être complet, à l’exception de ces entrées explicitement déclarées. Une variante définit `{ id, title, initial }` et surcharge les paramètres initiaux. La première variante est sélectionnée à l’ouverture.

Les modes `recursion`, `objects` et `combined` partagent les mêmes trois panneaux : pile et objets sont toujours visibles ensemble. `search` ajoute une vue de liste pilotée par une configuration :

```ts
search: {
  list: 'nombres', target: 'cible', left: 'gauche',
  right: 'droite', middle: 'milieu', result: 'indice',
  rightExclusive: false, // true pour [gauche, droite[
}
```

`list`, `target` et `result` sont des variables globales ; les bornes sont des variables locales du sommet de pile. `result` vaut l’indice trouvé ou `-1`. Ce mode est adapté à une recherche dans une liste triée.

Les lignes commencent à **1**, lignes vides comprises. Les critères d’une explication sont cumulatifs ; la première correspondance gagne. Les questions statiques `questions` ciblent des événements `line` ; `answer` commence à **0**. Pour les questions basées sur la trace (`questionSpecs`), voir [le guide d’extension](docs/extension.md). `themes` et `level` sont conservés pour compatibilité ; l’interface affiche tous les `notions` via leurs libellés stables et utilise `recommendedLevel`.

## Ajouter un chapitre ou un modèle

Voir [le guide d’extension détaillé](docs/extension.md), avec exemples complets de chapitre, rattachement croisé et modèle versionné. La correspondance des 22 chapitres avec les programmes officiels et les ajouts pédagogiques figure dans [Programme NSI et périmètre](docs/programme-nsi.md).

## Code libre

Dans `#libre`, écrire ou coller un petit programme, puis **Exécuter et visualiser**. Aucune exécution pendant la frappe. Le bouton **Arrêter / fermer la trace** détruit le Worker ; une nouvelle exécution repart dans un nouvel interpréteur. Le brouillon est conservé localement sous `pyscope-free-draft`. Aucune question n’est générée sur ce code.

Il s’agit de Python réel sur un **sous-ensemble explicite**, vérifié avec `ast` avant exécution : affectations, primitives, listes/tuples/dictionnaires, conditions, boucles simples, fonctions synchrones, classes simples, récursion, assertions. Pas d’imports, d’accès fichiers/réseau, de `input`, `eval`/`exec`, de compréhensions, générateurs, async, héritage, décorateurs ou noms internes. Méthodes autorisées : celles du programme, `append`, `pop`, `copy`, `count`, `index`, `keys`, `values`, `items`, `get`. Les autres constructions sont refusées ou produisent une erreur Python lisible.

Budgets : **12 000 caractères de code, 1 200 étapes, 8 secondes d’exécution, 2 Mio de données Python retenues, 4 Mio de trace JSON**. Le budget de données est mesuré avec `sys.getsizeof` aux captures, en parcourant les objets accessibles et ceux retenus pour l’identité. Il n’inclut pas tout l’interpréteur, ni toutes les allocations temporaires entre étapes : **ce n’est pas un quota matériel strict de mémoire WebAssembly**. `range`, répétitions et concaténations simples sont bornés à 4 096 éléments avant allocation ; les puissances et grands entiers sont également bornés. Ces gardes instrumentent l’AST en conservant les lignes d’origine.

## Génération locale vérifiée

Dans `#generateur`, sélectionner **une ou plusieurs notions**, une difficulté, un modèle compatible et une seed de 1 à 64 caractères. La correspondance est une **intersection** : le modèle doit travailler toutes les notions sélectionnées. « POO + récursivité » ne propose que l’arbre d’objets aux difficultés 2 et 3 ; un assemblage d’exercices indépendants n’est jamais proposé. Une intersection non couverte affiche un état vide.

Quatre modèles versionnés : dichotomie, factorielle, compteur partagé, arbre d’objets. Un PRNG entier déterministe produit les mêmes entrées pour une même seed. Le lien complet utilise le fragment d’URL, par exemple :

```text
https://morgangch.github.io/PyScope/#generateur?model=arbre-objets-v1&seed=classe-a&difficulty=2&notions=poo,recursion
```

Les réponses sont extraites des événements effectifs (`self`, appelant, retour, profondeur ou variable globale). Sans trace réussie ou si le sélecteur ne trouve pas son événement, **la question est masquée** et le compteur de vérification l’indique. Les questions ne sont pas créées avant validation. Les tests comparent les réponses à des résultats indépendants sur plusieurs seeds et difficultés. Le générateur ne prétend pas inventer librement des exercices ni interpréter pédagogiquement du code arbitraire.

L’identité générée contient modèle versionné, difficulté et seed. Une même génération garde sa progression ; les modèles doivent changer d’identifiant en cas de changement de leur algorithme. Ces exercices ne modifient pas les compteurs des chapitres guidés.

## Format des étapes

Le contrat complet se trouve dans `src/engine/types.ts`.

| Champ                                  | Signification                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| `line`                                 | Ligne du code à partir de 1                                                          |
| `event`                                | `line`, `call`, `return`, `output`, `error` ou `end`                                 |
| `stack`                                | Appels du plus ancien au plus récent : identité, nom, ligne, paramètres et variables |
| `globals`                              | Noms globaux et valeurs, hors classes, fonctions et modules                          |
| `objects`                              | Objets accessibles, indexés par identité stable `o1`, `o2`…                          |
| `references`                           | Liens `{ source, target }` depuis noms, attributs et éléments                        |
| `stdout`                               | Sortie cumulée jusqu’à cette étape                                                   |
| `returnValue`                          | Valeur renvoyée lors d’un `return`                                                   |
| `callLine`, `resumeLine`               | Origine d’un appel et ligne à laquelle il rend la main                               |
| `functionName`, `error`, `explanation` | Contexte facultatif                                                                  |

Une primitive est copiée ; une référence a la forme `{ ref: 'o1' }`. Un objet contient `id`, `type`, puis `attributes` ou `items`. Deux noms du même objet désignent le même identifiant ; les cycles sont gérés.

**Convention pédagogique :** un événement `line` montre l’état **avant** l’instruction. Son effet apparaît à l’événement suivant. `call` ajoute l’appel. `return` le conserve une dernière fois avec sa valeur ; l’étape suivante montre sa disparition. `resumeLine` marque la ligne qui a rendu la main, tandis que la ligne courante peut être la suivante. `print()` peut produire plusieurs événements (texte, séparateur, saut de ligne). `end` présente l’état final avec une pile vide.

Chaque capture est sérialisée et désérialisée côté Python : aucun dictionnaire ou attribut mutable n’est partagé entre instantanés. Naviguer change seulement l’index ; **revenir en arrière ne réexécute rien**. Une valeur modifiée est comparée à l’étape chronologiquement précédente, même en revenant en arrière.

## Limites explicites

- Visualisation adaptée aux fonctions **synchrones**, à la récursion, aux primitives, listes, tuples, dictionnaires à clés simples et instances avec `__dict__`. Classes et fonctions ne sont pas affichées comme objets. La définition d’une classe peut produire des événements de ligne.
- L’interpréteur est réel, mais la vue n’est pas un débogueur universel : générateurs, coroutines, threads, métaclasses, propriétés avec effets de bord, `__slots__` et détails internes des bibliothèques ne sont pas fidèlement développés. Les ensembles ne sont pas détaillés. Les types non développés sont signalés. Les clés de dictionnaire sont converties en texte ; utiliser des clés texte simples et distinctes.
- Une exception peut être interceptée après un événement `error`. Les `return` de propagation d’exception ne sont pas distingués des retours ordinaires ; privilégier les parcours sans exceptions pour enseigner les retours.
- La vue mémoire présente les objets **accessibles** depuis les variables et le retour, pas toute la mémoire de Python ni son ramasse-miettes.
- Limites : 1 200 étapes, 16 000 caractères de sortie, 80 entrées par collection ou objet, profondeur 8, environ 80 objets développés par capture. Les collections, attributs et textes tronqués sont signalés. Textes limités à 2 000 caractères ; grands entiers affichés comme chaînes « entier exact » pour éviter l’arrondi JavaScript.
- Le Worker est détruit après **8 secondes d’exécution** ou **60 secondes de chargement**. Une boucle infinie atteint normalement d’abord la limite d’étapes. Aucun quota matériel strict de mémoire WebAssembly.
- Le mode libre est limité au sous-ensemble décrit ci-dessus. Pas de `input()` interactif ni chargement automatique de bibliothèques tierces. Le Worker protège la réactivité ; il n’est pas une isolation de sécurité pour du code hostile.
- Aucun service worker : l’utilisation hors ligne après fermeture n’est pas garantie.

## Vérifier

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Les tests moteur utilisent Pyodide : les 18 exercices, récursion, alias, instantanés, cas limites, métadonnées, progression partagée, questions croisées, modèles sur plusieurs seeds, refus du code incompatible et budgets. Les parcours Chromium vérifient aussi les chapitres vides, la migration de progression, l’arbre croisé, les URL reproductibles, le mode libre après boucle infinie et la navigation mobile. Les captures sont écrites dans `test-results/`.

Formatage du code : `npx prettier --write src exercises tests scripts *.ts *.json index.html README.md .github`.

## Publication GitHub Pages

Le distant est `git@github.com:morgangch/PyScope.git`. Vite définit **`base: '/PyScope/'`**, y compris pour les ressources du moteur et les Workers. Le workflow `.github/workflows/pages.yml` construit et teste chaque pull request ; seuls les commits sur `main` sont publiés.

1. Dans GitHub, **Settings → Pages → Build and deployment → Source**, sélectionner **GitHub Actions** une seule fois.
2. Publier les fichiers :

```sh
git add .
git commit -m "Build PyScope interactive Python learning site"
git push origin main
```

3. Attendre la réussite du workflow **Build, test and deploy to GitHub Pages**, puis ouvrir **https://morgangch.github.io/PyScope/**.

Le workflow utilise Node 22, `npm ci`, les tests moteur, le build et Chromium. Il transmet `dist/` à GitHub Pages avec `pages: write` et `id-token: write`. Il peut aussi être relancé avec **Run workflow**. `public/pyodide/`, `dist/` et les captures de test sont générés et exclus de Git.

## Accessibilité

Disposition adaptative (trois, deux, puis une colonne), défilement du code au clavier, lien d’évitement, contrôles nommés, dialogue natif avec focus contenu et fermeture par Échap. Symboles et libellés complètent les couleurs pour les appels, reprises, références et changements. Les animations respectent `prefers-reduced-motion`.

Licence : voir `LICENSE`.
