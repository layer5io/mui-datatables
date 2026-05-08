import type { StoredTableState } from '../types/options';

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const load = (storageKey: string | undefined): Partial<StoredTableState> | undefined => {
  if (isBrowser && storageKey) {
    const item = window.localStorage.getItem(storageKey);
    if (item === null) return undefined;
    return JSON.parse(item) as Partial<StoredTableState>;
  } else if (storageKey !== undefined && !isBrowser) {
    console.warn('storageKey support only on browser');
    return undefined;
  }
  return undefined;
};
