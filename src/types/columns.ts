import type { ComponentProps, ReactNode } from 'react';
import type { TableCell } from '@mui/material';
import type { MUIDataTableCellValue, MUIDataTableMeta } from './data';
import type { MUIDataTableFilterList, MUIDataTableSortOrder } from './options';

export type MUIDataTableColumnDisplay = 'true' | 'false' | 'excluded' | 'always' | true | false;

export type MUIDataTableFilterType = 'dropdown' | 'checkbox' | 'multiselect' | 'textField' | 'custom';

export type MUIDataTableSortDirection = 'asc' | 'desc' | 'none';

export interface MUIDataTableColumnState {
  name: string;
  label: string;
  display: MUIDataTableColumnDisplay;
  empty: boolean;
  filter: boolean;
  sort: boolean;
  print: boolean;
  searchable: boolean;
  download: boolean;
  viewColumns: boolean;
  sortDirection: MUIDataTableSortDirection;
  sortCompare: ((order: 'asc' | 'desc') => (a: { data: unknown }, b: { data: unknown }) => number) | null;
  sortThirdClickReset: boolean;
  sortDescFirst: boolean;
  customHeadRender?: (
    columnMeta: MUIDataTableColumnState & { index: number },
    updateDirection: (columnIndex: number) => void,
    sortOrder: MUIDataTableSortOrder,
  ) => ReactNode;
  customBodyRender?: (
    value: MUIDataTableCellValue,
    tableMeta: MUIDataTableMeta,
    updateValue: (value: MUIDataTableCellValue) => void,
  ) => ReactNode;
  customBodyRenderLite?: (dataIndex: number, rowIndex: number) => ReactNode;
  customHeadLabelRender?: (columnMeta: MUIDataTableColumnState & { index: number; colPos: number }) => ReactNode;
  customFilterListOptions?: MUIDataTableCustomFilterListOptions;
  customFilterListRender?: (value: string) => ReactNode;
  setCellProps?: (
    cellValue: MUIDataTableCellValue,
    rowIndex: number,
    columnIndex: number,
  ) => ComponentProps<typeof TableCell>;
  setCellHeaderProps?: (columnMeta: MUIDataTableColumnState & { index: number }) => ComponentProps<typeof TableCell>;
  filterList?: string[];
  filterOptions?: readonly string[] | MUIDataTableColumnFilterOptions;
  filterType?: MUIDataTableFilterType;
  hint?: string;
}

export interface MUIDataTableColumnDef {
  name: string;
  label?: string;
  options?: MUIDataTableColumnOptions;
}

export type MUIDataTableColumn = string | MUIDataTableColumnDef;

export interface MUIDataTableColumnOptions {
  display?: MUIDataTableColumnDisplay;
  empty?: boolean;
  filter?: boolean;
  sort?: boolean;
  print?: boolean;
  searchable?: boolean;
  download?: boolean;
  viewColumns?: boolean;
  filterList?: string[];
  filterOptions?: readonly string[] | MUIDataTableColumnFilterOptions;
  filterType?: MUIDataTableFilterType;
  customHeadRender?: (
    columnMeta: MUIDataTableColumnState & { index: number },
    updateDirection: (columnIndex: number) => void,
    sortOrder: MUIDataTableSortOrder,
  ) => ReactNode;
  customBodyRender?: (
    value: MUIDataTableCellValue,
    tableMeta: MUIDataTableMeta,
    updateValue: (value: MUIDataTableCellValue) => void,
  ) => ReactNode;
  customBodyRenderLite?: (dataIndex: number, rowIndex: number) => ReactNode;
  customHeadLabelRender?: (columnMeta: MUIDataTableColumnState & { index: number; colPos: number }) => ReactNode;
  customFilterListOptions?: MUIDataTableCustomFilterListOptions;
  customFilterListRender?: (value: string) => ReactNode;
  setCellProps?: (
    cellValue: MUIDataTableCellValue,
    rowIndex: number,
    columnIndex: number,
  ) => ComponentProps<typeof TableCell>;
  setCellHeaderProps?: (columnMeta: MUIDataTableColumnState & { index: number }) => ComponentProps<typeof TableCell>;
  sortThirdClickReset?: boolean;
  sortDescFirst?: boolean;
  sortCompare?: (order: 'asc' | 'desc') => (a: { data: unknown }, b: { data: unknown }) => number;
  sortDirection?: MUIDataTableSortDirection | null;
  hint?: string;
}

export interface MUIDataTableColumnFilterOptions {
  names?: readonly string[];
  logic?: (value: MUIDataTableCellValue, filters: string[], row?: MUIDataTableCellValue[]) => boolean;
  display?: (
    filterList: MUIDataTableFilterList,
    onChange: (value: string | string[], index: number, column: string) => void,
    index: number,
    column: MUIDataTableColumnState,
  ) => ReactNode;
}

export interface MUIDataTableCustomFilterListOptions {
  render?: (value: string) => ReactNode;
  update?: (filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList;
}
