import type { MUIDataTableState } from '../types/options';

export const save = (storageKey: string, state: MUIDataTableState): void => {
  const { selectedRows, data, displayData, ...savedState } = state;

  window.localStorage.setItem(storageKey, JSON.stringify(savedState));
};
