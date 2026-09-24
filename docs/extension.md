# Étendre les parcours et les modèles

Les données pédagogiques sont indépendantes du lecteur. Les trois panneaux n’ont aucune connaissance des identifiants des chapitres ni des modèles. Une trace est le même format dans les modes guidé, libre et généré.

## 1. Notions et métadonnées

Ajouter une notion dans `src/curriculum/notions.ts` : une clé stable en ASCII et un libellé français. `NotionId` est dérivé de ce registre ; une faute d’identifiant devient une erreur TypeScript.

Chaque `Exercise` possède :

| Champ | Rôle |
|---|---|
| `id` | Identité permanente pour la progression et les liens |
| `recommendedLevel` | `premiere`, `terminale` ou `approfondissement` |
| `notions` | Toutes les notions **réellement travaillées ensemble** |
| `prerequisites` | Identifiants des notions conseillées, jamais des verrous |
| `objective` | Ce que l’élève doit apprendre avec ce programme |
| `difficulty` | 1 découverte, 2 consolidation, 3 défi |
| `visualization` | `recursion`, `objects`, `combined` ou `search` |
| `code`, `initial` | Programme complet et entrées injectées avant exécution |
| `questions`, `questionSpecs`, `explanations` | Accompagnement facultatif |

`title`, `subtitle` et `instruction` restent requis. `themes` et `level` sont des champs de compatibilité avec les trois anciens fichiers : les filtres et libellés de la nouvelle interface utilisent `notions` et `recommendedLevel`.

Un exercice réutilisé dans plusieurs chapitres doit être **une seule donnée**, avec un seul `id`. Ne pas copier le programme ou préfixer son identité avec le chapitre. Une liste de références à des identifiants suffit.

## 2. Ajouter un chapitre

Dans `src/curriculum/catalogue.ts`, ajouter une entrée à `chapters`, par exemple :

```ts
{
  id: 'objets-recursifs',
  theme: 'structures',
  title: 'Des objets qui se parcourent',
  levels: ['terminale'],
  status: 'available',
  origin: 'pedagogical',
  description: 'Un parcours croisé pour lire une méthode récursive sur des objets liés.',
  notions: ['references', 'poo', 'recursion', 'arbres'],
  exerciseIds: ['poo-rec-chaine', 'poo-rec-arbre'],
}
```

L’ordre de `notions` et celui de `exerciseIds` donnent les ordres conseillés. Pour ajouter un thème, insérer simplement `{ id, title }` dans `themes`. Le menu et les pages sont dérivés de ces données ; aucun composant n’est à modifier.

Choisir `planned` avec `exerciseIds: []` pour un futur chapitre Python, ou `conceptual` pour un sujet nécessitant un autre support. `available` exige au moins un exercice existant. Le champ `origin` distingue un chapitre rattaché au programme d’un regroupement propre à PyScope ; documenter les ajouts dans `docs/programme-nsi.md`.

## 3. Ajouter un exercice guidé

Créer un fichier dans `exercises/`, avec un export par défaut d’un `Exercise` ou d’un `Exercise[]`. Le registre importe récursivement ces fichiers ; ne pas y placer un utilitaire sans export pédagogique. Un exemple complet figure dans le [README](../README.md#ajouter-un-exercice-en-5-minutes).

Ajouter l’identifiant au tableau `exerciseIds` de chaque chapitre concerné. Vérifier qu’il combine réellement les notions annoncées : afficher deux notions dans les métadonnées n’est pas suffisant. Pour POO × récursivité, une méthode doit réellement rappeler une méthode sur un objet, et les références doivent être observables.

Ne pas renommer les identifiants historiques `factorielle`, `dichotomie`, `personnages`. `pyscope-progress-v1` reste le format de stockage : positions `id:variante`, achèvements par `id`. Changer les libellés, déplacer les exercices et ajouter des rattachements ne modifie donc pas la progression. Si le code d’un exercice change fondamentalement, créer une nouvelle identité pour ne pas reprendre à une étape sans rapport.

## 4. Questions résolues sur la trace

Les questions statiques existantes restent supportées. Pour cibler un appel précis et vérifier sa réponse automatiquement, utiliser `questionSpecs` :

```ts
questionSpecs: [
  {
    id: 'parent-de-c',
    event: 'call',
    functionName: 'taille',
    selfName: 'C',
    occurrence: 1,
    read: 'caller',
    prompt: 'Quel appel attend le résultat de celui-ci ?',
    explanation: 'B attend directement C ; A attend B.',
  },
]
```

Le sélecteur filtre par événement, nom de fonction et, facultativement, attribut `nom` de l’objet référencé par `self`. `occurrence` commence à **1** parmi les événements filtrés. Il évite de supposer que chaque passage sur une même ligne a le même contexte.

`read` vaut :

- `self` : attribut `nom` de l’objet destinataire de l’appel actif ;
- `caller` : appel directement sous le sommet, avec son objet et ses paramètres ;
- `return` : `returnValue` de l’événement ;
- `depth` : nombre de cartes dans la pile ;
- `global` : valeur primitive de la globale indiquée par `variable`.

`resolveQuestions` ne travaille que sur une trace terminée sans erreur. Il choisit une réponse effective et des alternatives distinctes, puis stocke l’index exact de l’événement. Si une donnée est manquante, la question n’est pas présentée. Le compteur « questions vérifiées » signale les éventuelles questions omises. Les réponses sur des objets anonymes ou des valeurs non primitives ne sont pas inventées.

Le lecteur accepte une réponse correcte ou incorrecte et fournit l’explication. La question peut être passée ou masquée. Les réponses ne sont pas un score de maîtrise et ne verrouillent aucun chapitre.

## 5. Ajouter un modèle déterministe

Ajouter un `ExerciseTemplate` au tableau `templates` de `src/generation/templates.ts`. Le PRNG reçu dans `build` est déterministe ; ne pas utiliser `Math.random`, l’heure, le réseau ou l’état du navigateur. Exemple complet de **valeur à insérer dans ce tableau**, s’appuyant sur un exercice existant :

```ts
{
  id: 'somme-entiers-v1',
  title: 'Une somme qui remonte',
  notions: ['recursion', 'cas-base', 'retours'],
  difficulties: [1, 2],
  build(random, difficulty) {
    const nombre = 2 + difficulty + Math.floor(random() * 3);
    return {
      ...get('factorielle'),
      title: 'Une somme qui remonte',
      instruction: 'Suivez les appels, puis les additions pendant le dépilement.',
      objective: 'Comprendre la somme récursive des entiers de 0 à n.',
      initial: { nombre },
      questions: [],
      explanations: [],
      code: `def somme(n):
    if n == 0:
        return 0
    suite = somme(n - 1)
    return n + suite

resultat = somme(nombre)
print(resultat)`,
      questionSpecs: [
        {
          id: 'somme-retour',
          event: 'return',
          functionName: 'somme',
          occurrence: 3,
          read: 'return',
          prompt: 'Quelle valeur remonte à cet instant ?',
          explanation: 'La valeur est l’addition de n et de la somme déjà renvoyée.',
        },
      ],
    };
  },
}
```

`get` est le petit helper déjà présent dans le fichier. Le wrapper `generateExercise` attribue l’identité `gen:modèle:difficulté:seed`, les notions déclarées, la difficulté et le titre du modèle. Un modèle ne doit annoncer une notion que si **toutes ses variantes** la travaillent. `matchingTemplates` exige que **toutes** les notions sélectionnées soient incluses ; aucune solution de repli à une seule notion n’est autorisée.

La seed est sensible à la casse et limitée à 64 caractères. Le lien utilise `URLSearchParams` dans le fragment pour encoder les espaces et caractères accentués. Pour une modification du code généré, des plages de valeurs ou de l’ordre des tirages, créer `-v2` et conserver `-v1` pour les anciens liens. Les paramètres du formulaire modifiés masquent le résultat précédent jusqu’à une nouvelle génération.

N’ajouter **aucune réponse calculée à la main** aux variantes générées. Utiliser `questionSpecs` et tester chaque difficulté sur plusieurs seeds avec le vrai moteur. Pour une nouvelle sorte de question non couverte, étendre explicitement `QuestionSpec` et `readAnswer`, avec des tests indépendants, plutôt que de deviner à partir du texte Python.

## 6. Validation avant publication

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Adapter les assertions de cardinalité des tests navigateur si l’on ajoute du contenu. Les tests moteur vérifient les identifiants, les rattachements, l’existence des notions, la cohérence des états et l’exécution de tous les exercices. Étendre les résultats attendus et les oracles indépendants pour les nouveaux programmes. Conserver `base: '/PyScope/'` et le routage par fragment.
