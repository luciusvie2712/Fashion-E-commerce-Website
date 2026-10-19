import { test, expect } from '@playwright/test';
test('storefront loads',async({page})=>{await page.goto('/');await expect(page.getByRole('heading',{name:'FLUIVIX',exact:true})).toBeVisible();});
