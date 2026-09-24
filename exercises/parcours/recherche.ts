import type { Exercise } from '../../src/engine/types';
const common = { level: 'Première', recommendedLevel: 'premiere' as const, themes: ['Algorithmique'], visualization: 'search' as const, initial: {}, search: {list:'nombres',target:'cible',left:'gauche',right:'droite',middle:'milieu',result:'indice'} };
export default [
  { ...common, id:'recherche-milieu',title:'La première comparaison',subtitle:'Le meilleur cas : la cible au milieu', difficulty:1,
    notions:['dichotomie','listes','retours'], prerequisites:['listes','conditions'], objective:'Calculer un indice central et distinguer indice et valeur.', instruction:'Cette fonction ne teste que la case centrale, pas toute la liste. La cible est justement au milieu : aucun partage supplémentaire n’est nécessaire.',
    code:`def tester_milieu(nombres, cible):
    gauche = 0
    droite = len(nombres) - 1
    milieu = (gauche + droite) // 2
    if nombres[milieu] == cible:
        return milieu
    return -1

nombres = [2, 5, 8, 11, 14]
cible = 8
indice = tester_milieu(nombres, cible)
print(indice)`,
    questionSpecs:[{id:'indice-valeur',event:'return',functionName:'tester_milieu',read:'return',prompt:'Renvoie-t-on la cible ou son indice ?',explanation:'La valeur 8 est à l’indice 2. Une recherche renvoie ici la position, pas la valeur.'}] },
  { ...common, id:'recherche-extremites',title:'Ne pas oublier les extrémités',subtitle:'Une dernière case reste à tester',difficulty:2,
    notions:['dichotomie','bornes','tests'],prerequisites:['dichotomie','boucles'],objective:'Comprendre la condition gauche <= droite et tester les deux bords.',instruction:'Le programme cherche successivement le premier et le dernier élément. Quand les bornes sont égales, il reste une case à examiner.',
    code:`def chercher(nombres, cible):
    gauche = 0
    droite = len(nombres) - 1
    while gauche <= droite:
        milieu = (gauche + droite) // 2
        if nombres[milieu] == cible:
            return milieu
        if nombres[milieu] < cible:
            gauche = milieu + 1
        else:
            droite = milieu - 1
    return -1

nombres = [3, 6, 9, 12]
cible = nombres[0]
indice = chercher(nombres, cible)
assert indice == 0
print(indice)
cible = nombres[-1]
indice = chercher(nombres, cible)
assert indice == len(nombres) - 1
print(indice)`,
    questions:[{line:4,prompt:'Si gauche == droite, doit-on entrer dans la boucle ?',choices:['Oui, il reste une case','Non, il ne reste rien'],answer:0,explanation:'Les bornes sont inclusives. Une case peut encore contenir la cible.'}] },
  { ...common, id:'recherche-vide',title:'Une liste vide',subtitle:'Tester avant d’accéder à une case',difficulty:1,
    notions:['dichotomie','bornes','tests','listes'],prerequisites:['listes','conditions'],objective:'Éviter un accès invalide grâce au cas vide.',instruction:'Aucun indice n’est valide dans une liste vide. La fonction traite ce cas avant de calculer ou lire le milieu.',
    code:`def chercher(nombres, cible):
    if len(nombres) == 0:
        return -1
    gauche = 0
    droite = len(nombres) - 1
    while gauche <= droite:
        milieu = (gauche + droite) // 2
        if nombres[milieu] == cible:
            return milieu
        if nombres[milieu] < cible:
            gauche = milieu + 1
        else:
            droite = milieu - 1
    return -1

nombres = []
cible = 18
indice = chercher(nombres, cible)
assert indice == -1
print(indice)`,
    questions:[{line:3,prompt:'Pourquoi ne lit-on pas nombres[0] ?',choices:['La cible est trop grande','Il n’existe aucune case'],answer:1,explanation:'Même la case 0 n’existe pas. La garde évite une IndexError.'}] },
  { ...common, id:'recherche-absent',title:'Prouver l’absence',subtitle:'Les bornes se croisent',difficulty:2,
    notions:['dichotomie','bornes','retours'],prerequisites:['dichotomie','boucles'],objective:'Distinguer la dernière case examinée et un indice trouvé.',instruction:'Le programme mémorise la dernière valeur examinée. Cette information n’est pas une preuve de présence : seule une égalité permet de renvoyer un indice.',
    code:`def chercher(nombres, cible):
    gauche = 0
    droite = len(nombres) - 1
    dernier = None
    while gauche <= droite:
        milieu = (gauche + droite) // 2
        dernier = nombres[milieu]
        if dernier == cible:
            return milieu
        if dernier < cible:
            gauche = milieu + 1
        else:
            droite = milieu - 1
    print("Dernière valeur examinée", dernier)
    return -1

nombres = [2, 4, 6, 8]
cible = 5
indice = chercher(nombres, cible)
print(indice)`,
    questionSpecs:[{id:'absence',event:'return',functionName:'chercher',read:'return',prompt:'Quel résultat indique l’absence de la cible ?',explanation:'La zone est vide. La dernière valeur examinée n’était pas égale à la cible : le résultat est -1.'}] },
  { ...common, id:'recherche-bornes',title:'La première occurrence',subtitle:'Un intervalle semi-ouvert et des doublons',difficulty:3,
    notions:['dichotomie','bornes','tests'],prerequisites:['dichotomie','bornes'],objective:'Maintenir un intervalle [gauche, droite[ et trouver le premier doublon.',instruction:'droite est exclue et peut valoir len(nombres). On continue à gauche même après une égalité, pour obtenir la première occurrence.',
    search:{...common.search,rightExclusive:true},
    code:`def premiere_occurrence(nombres, cible):
    gauche = 0
    droite = len(nombres)
    while gauche < droite:
        milieu = (gauche + droite) // 2
        if nombres[milieu] < cible:
            gauche = milieu + 1
        else:
            droite = milieu
    if gauche < len(nombres) and nombres[gauche] == cible:
        return gauche
    return -1

nombres = [2, 4, 4, 4, 9]
cible = 4
indice = premiere_occurrence(nombres, cible)
print(indice)`,
    questions:[{line:9,prompt:'Pourquoi garder milieu comme borne droite ?',choices:['Pour conserver une première occurrence possible','Pour exclure toute la moitié gauche'],answer:0,explanation:'milieu peut être la première occurrence. La borne droite est exclue de la prochaine comparaison, mais reste une position candidate de convergence.'}] },
] satisfies Exercise[];
