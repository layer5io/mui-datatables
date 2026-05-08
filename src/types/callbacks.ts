import type { ReactNode } from 'react';
import type { MUIDataTableOptions } from './options';

export type SearchTextHandler = (searchText: string) => void;

export type HideSearchHandler = () => void;

export type CustomSearchRender = (
  searchText: string,
  handleSearch: SearchTextHandler,
  hideSearch: HideSearchHandler,
  options: MUIDataTableOptions,
) => ReactNode;
