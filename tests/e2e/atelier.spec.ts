import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page) {
  await expect(page.getByRole('button', { name: 'Étape suivante' })).toBeEnabled({
    timeout: 60000,
  });
}
async function seek(page: Page, value: 'end' | number) {
  const slider = page.getByRole('slider', { name: 'Étape d’exécution' });
  await slider.fill(value === 'end' ? (await slider.getAttribute('max'))! : String(value));
}
test('les trois ateliers, les alias, le retour arrière et la progression', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await ready(page);
  await expect(page.getByRole('heading', { name: 'La récursion.' })).toBeVisible();
  await seek(page, 10);
  await expect(page.locator('.frame-card')).toHaveCount(3);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/recursion-desktop.png', fullPage: true });
  await seek(page, 'end');
  await expect(page.getByTestId('stdout')).toHaveText('24\n');
  await expect(page.locator('.frame-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Étape précédente' }).click();
  await expect(page.getByRole('button', { name: 'Étape suivante' })).toBeEnabled();
  await page.getByRole('button', { name: /La dichotomie Chercher/ }).click();
  await ready(page);
  await seek(page, 'end');
  await expect(page.getByTestId('stdout')).toHaveText('8\n');
  await page.getByLabel('Cas de recherche').selectOption('absent');
  await ready(page);
  await seek(page, 15);
  await expect(page.locator('.search-cells .examined')).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/dichotomie-desktop.png', fullPage: true });
  await seek(page, 'end');
  await expect(page.getByTestId('stdout')).toHaveText('-1\n');
  await page.getByRole('button', { name: /Les objets Deux personnages/ }).click();
  await ready(page);
  await seek(page, 'end');
  await expect(page.getByTestId('stdout')).toHaveText('Lara 18\nMilo 12\n');
  await expect(page.locator('.heap-object')).toHaveCount(2);
  const laraRef = await page
    .locator('.globals > div')
    .filter({ has: page.locator('dt', { hasText: /^lara$/ }) })
    .locator('a')
    .getAttribute('href');
  const aliasRef = await page
    .locator('.globals > div')
    .filter({ has: page.locator('dt', { hasText: /^alliee$/ }) })
    .locator('a')
    .getAttribute('href');
  expect(aliasRef).toBe(laraRef);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/objets-desktop.png', fullPage: true });
  await page.reload();
  await expect(page.getByTestId('stdout')).toHaveText('Lara 18\nMilo 12\n', { timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Les objets.' })).toBeVisible();
  await expect(page.getByText('3 sur 3 ateliers explorés')).toBeVisible();
  expect(errors).toEqual([]);
});
test('lecture, pause, clavier, questions, filtres et mobile', async ({ page }) => {
  await page.goto('./');
  await ready(page);
  await page.getByRole('button', { name: 'Lecture automatique' }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await page.locator('h1').click();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('slider')).toHaveValue('1');
  await seek(page, 13);
  await expect(page.getByText('Au cas de base, que renvoie factorielle(1) ?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Étape suivante' })).toBeDisabled();
  await page.getByRole('button', { name: '1', exact: true }).click();
  await expect(page.getByText(/Bien vu !/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Étape suivante' })).toBeEnabled();
  await page.getByRole('button', { name: 'Objets', exact: true }).click();
  await expect(page.locator('.exercise-card')).toHaveCount(1);
  await page.getByRole('textbox', { name: 'Rechercher un atelier' }).fill('inexistant');
  await expect(page.getByText(/Aucun atelier trouvé/)).toBeVisible();
  await page.getByRole('button', { name: 'Le guide', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Étape suivante' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});
