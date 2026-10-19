import { z } from 'zod';
import type { StateStorage } from 'zustand/middleware';
const memory = new Map<string, string>();
let warning = false;
export const storageFailed = () => warning;
export const markStorageFailure = () => {
  warning = true;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('fluivix:storage-error'));
};
const fail = markStorageFailure;
export const safeStorage: StateStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      fail();
      return memory.get(key) ?? null;
    }
  },
  setItem(key, value) {
    memory.set(key, value);
    try {
      localStorage.setItem(key, value);
    } catch {
      fail();
    }
  },
  removeItem(key) {
    memory.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      fail();
    }
  },
};
export function hydrateSafe<T>(raw: string | null, schema: z.ZodType<T>, fallback: T): T {
  try {
    if (!raw) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
    fail();
    return fallback;
  } catch {
    fail();
    return fallback;
  }
}
export function resetFluivixStorage() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('fluivix:'))
      .forEach((k) => localStorage.removeItem(k));
    memory.clear();
  } catch {
    fail();
  }
}
