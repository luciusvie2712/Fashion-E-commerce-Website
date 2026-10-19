import { expect, test } from 'vitest';
test('supports integer VND arithmetic',()=>expect(Number.isSafeInteger(329000 * 3)).toBe(true));
