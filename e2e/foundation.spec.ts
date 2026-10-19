import { test, expect } from '@playwright/test';
test('storefront loads',async({page})=>{await page.goto('/');await expect(page.locator('h1')).toContainText('Chất riêng');});
