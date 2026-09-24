import { test, expect, type Page } from '@playwright/test';
async function ready(page:Page){await expect(page.getByRole('slider',{name:'Étape d’exécution'})).toBeEnabled({timeout:60000});}
async function end(page:Page){const slider=page.getByRole('slider');await slider.fill((await slider.getAttribute('max'))!);}

test('progression historique et exercice partagé entre trois chapitres',async({page})=>{
  await page.addInitScript(()=>{if(!localStorage.getItem('migrated-test')){localStorage.setItem('pyscope-progress-v1',JSON.stringify({last:'factorielle',positions:{'factorielle:default':10},completed:['dichotomie']}));localStorage.setItem('migrated-test','1');}});
  await page.goto('./');await ready(page);await expect(page.getByRole('slider')).toHaveValue('10');await expect(page.locator('.frame-card')).toHaveCount(3);
  await page.goto('./#chapter/objets');
  await page.getByRole('link',{name:/Compter un arbre d’objets/}).click();await ready(page);
  await expect(page.getByText('3 / 3 questions vérifiées',{exact:false})).toBeVisible();
  // Visit call B and C using their questions, checking simultaneous self cards.
  const slider=page.getByRole('slider');const max=Number(await slider.getAttribute('max'));
  let found=false;
  for(let i=0;i<=max;i++){
    await slider.fill(String(i));
    if(await page.getByText('Quel appel attend le résultat de celui-ci ?', {exact:true}).isVisible()) {found=true;break;}
  }
  expect(found).toBe(true);
  await expect(page.locator('.frame-card')).toHaveCount(3);
  for(const name of ['A','B','C']) await expect(page.locator('.self-hint').filter({hasText:`self → ${name}`})).toHaveCount(1);
  await page.getByRole('button',{name:'B.taille()',exact:true}).click();await expect(page.getByText(/Bien vu !/)).toBeVisible();
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'test-results/arbre-croise.png',fullPage:true,animations:'disabled'});
  await end(page);await expect(page.getByTestId('stdout')).toHaveText('4\n');
  for(const chapter of ['recursivite','arbres']){
    await page.goto(`./#chapter/${chapter}`);
    const card=page.getByRole('link',{name:/Compter un arbre d’objets/});await expect(card).toContainText('Exploré');await card.click();await ready(page);await expect(page.getByTestId('stdout')).toHaveText('4\n');
  }
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pyscope-progress-v1')!));
  expect(saved.completed.filter((id:string)=>id==='poo-rec-arbre')).toHaveLength(1);
  expect(Object.keys(saved.positions).filter(key=>key.includes('poo-rec-arbre'))).toEqual(['poo-rec-arbre:default']);
});
test('squelette explicite et navigation mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('./#parcours');
  await expect(page.getByText('18 exercices uniques',{exact:false})).toBeVisible();
  await page.locator('.chapter-card').filter({hasText:'Types et représentation'}).click();await expect(page.getByRole('heading',{name:'Ce chapitre est prévu'})).toBeVisible();await expect(page.locator('progress')).toHaveCount(0);
  await page.goto('./#chapter/bdd');await expect(page.getByRole('heading',{name:'Une autre visualisation est nécessaire'})).toBeVisible();await expect(page.getByText('Aucun exercice disponible · aucune progression calculée')).toBeVisible();
  await page.goto('./#exercices');await page.getByLabel('Filtrer par notion').selectOption('recursion');await page.getByLabel('Rechercher un exercice').fill('arbre');await expect(page.locator('.learning-exercise')).toHaveCount(1);await page.locator('.learning-exercise').click();await ready(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/parcours-mobile.png',fullPage:true,animations:'disabled'});
});
test('code libre : boucle infinie, erreur, allocation et nouvelle exécution',async({page})=>{
  await page.goto('./#libre');const editor=page.getByLabel('Programme Python');
  await editor.fill('while True:\n    pass');await page.getByRole('button',{name:'Exécuter et visualiser'}).click();await expect(page.getByRole('alert')).toContainText('Limite de 1200 étapes',{timeout:60000});
  await page.getByRole('button',{name:'Le guide',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  await editor.fill('print(1)\nimport os');await page.getByRole('button',{name:'Exécuter et visualiser'}).click();await expect(page.getByRole('alert')).toContainText('Import non pris en charge',{timeout:60000});
  await editor.fill('a = [0] * 100000000');await page.getByRole('button',{name:'Exécuter et visualiser'}).click();await expect(page.getByRole('alert')).toContainText('4 096',{timeout:60000});
  await editor.fill('print(42)');await page.getByRole('button',{name:'Exécuter et visualiser'}).click();await ready(page);await end(page);await expect(page.getByTestId('stdout')).toHaveText('42\n');
  await page.getByRole('button',{name:'Arrêter / fermer la trace'}).click();await expect(page.getByRole('slider')).toHaveCount(0);
});
test('génération multi-notions reproductible et lien statique partageable',async({page})=>{
  await page.goto('./#generateur');await page.getByLabel('Programmation objet',{exact:true}).check();
  await expect(page.getByLabel('Modèle compatible').locator('option')).toHaveCount(2);
  await page.getByLabel('Modèle compatible').selectOption('arbre-objets-v1');await page.getByLabel('Seed',{exact:true}).fill('classe-été');await page.getByRole('button',{name:'Générer l’exercice'}).click();await ready(page);
  await expect(page.getByText('3 / 3 questions vérifiées',{exact:false})).toBeVisible();const code=await page.locator('.code-lines code').allTextContents();
  await end(page);const output=await page.getByTestId('stdout').innerText();const url=page.url();await page.reload();await ready(page);await expect(page.getByTestId('stdout')).toHaveText(output);expect(await page.locator('.code-lines code').allTextContents()).toEqual(code);expect(page.url()).toBe(url);
  await page.getByLabel('Dichotomie',{exact:true}).check();await expect(page.getByText(/Aucun modèle disponible pour cette intersection/)).toBeVisible();await expect(page.getByRole('button',{name:'Générer l’exercice'})).toBeDisabled();
  await page.goto('./#generateur?model=arbre-objets-v1&seed=test&difficulty=2&notions=dichotomie,poo');await expect(page.getByRole('alert')).toContainText('Lien invalide');await expect(page.getByRole('slider')).toHaveCount(0);
});
