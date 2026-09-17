import type { ComponentType, ReactNode } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { TooltipProps } from '@mui/material/Tooltip';
import type { CSSObject } from 'tss-react';
import type { TableBodyProps } from '../components/TableBody';
import type { TableFilterProps } from '../components/TableFilter';
import type { TableFilterListProps } from '../components/TableFilterList';
import type { TableFooterProps } from '../components/TableFooter';
import type { TableHeadProps } from '../components/TableHead';
import type { TableResizeProps } from '../components/TableResize';
import type { TableToolbarProps } from '../components/TableToolbar';
import type { TableToolbarSelectProps } from '../components/TableToolbarSelect';

export type WithStyles<TStyleFn extends (...args: never[]) => Record<string, CSSObject>> = {
  classes: Record<keyof ReturnType<TStyleFn>, string>;
};

export interface MUIDataTableComponents {
  TableBody: ComponentType<TableBodyProps>;
  TableFilter: ComponentType<TableFilterProps>;
  TableFilterList: ComponentType<TableFilterListProps>;
  TableFooter: ComponentType<TableFooterProps>;
  TableHead: ComponentType<TableHeadProps>;
  TableResize: ComponentType<TableResizeProps>;
  TableToolbar: ComponentType<TableToolbarProps>;
  TableToolbarSelect: ComponentType<TableToolbarSelectProps>;
  Tooltip: ComponentType<TooltipProps>;
  icons: Record<string, ComponentType<SvgIconProps>>;
}

export interface TableFilterListItemProps {
  label: ReactNode;
  onDelete: () => void;
  className: string;
  filterProps?: Record<string, unknown>;
  itemKey?: number;
  index?: number;
  data?: string | string[];
  columnNames?: Array<{ name: string; filterType: string }>;
}
