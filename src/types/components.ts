import type { ComponentType } from 'react';
import type { CSSObject } from 'tss-react';

export type WithStyles<TStyleFn extends (...args: never[]) => Record<string, CSSObject>> = {
  classes: Record<keyof ReturnType<TStyleFn>, string>;
};

export interface MUIDataTableComponents {
  TableBody: ComponentType<unknown>;
  TableFilter: ComponentType<unknown>;
  TableFilterList: ComponentType<unknown>;
  TableFooter: ComponentType<unknown>;
  TableHead: ComponentType<unknown>;
  TableResize: ComponentType<unknown>;
  TableToolbar: ComponentType<unknown>;
  TableToolbarSelect: ComponentType<unknown>;
  Tooltip: ComponentType<unknown>;
  icons: Record<string, ComponentType<unknown>>;
}
