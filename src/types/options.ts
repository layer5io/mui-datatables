import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { Table, TableRow } from '@mui/material';
import type { MUIDataTableCellValue, MUIDataTableDisplayRow } from './data';
export type { MUIDataTableCellValue, MUIDataTableDisplayRow } from './data';
import type { MUIDataTableColumnFilterOptions, MUIDataTableColumnState, MUIDataTableFilterType } from './columns';
import type { MUIDataTableTextLabels } from './text-labels';

export type MUIDataTableFilterList = string[][];

export type MUIDataTableResponsive =
  | 'standard'
  | 'vertical'
  | 'verticalAlways'
  | 'simple'
  | 'stacked'
  | 'stackedFullWidth'
  | 'scrollMaxHeight'
  | 'scrollFullHeight'
  | 'scrollFullHeightFullWidth';

export type MUIDataTableFeatureFlag = boolean | 'true' | 'false' | 'disabled';

export type MUIDataTableSelectableRows = boolean | 'none' | 'single' | 'multiple';

export type MUIDataTableSelectToolbarPlacement = 'replace' | 'above' | 'none' | 'always';

export type MUIDataTableTableAction =
  | 'changePage'
  | 'changeRowsPerPage'
  | 'sort'
  | 'filterChange'
  | 'search'
  | 'searchClose'
  | 'searchOpen'
  | 'viewColumnsChange'
  | 'rowSelectionChange'
  | 'rowExpansionChange'
  | 'columnOrderChange'
  | 'propsUpdate'
  | 'tableInitialized'
  | 'onFilterDialogOpen'
  | 'onFilterDialogClose'
  | 'onSearchClose'
  | 'onSearchOpen';

export interface MUIDataTableOptions {
  caseSensitive?: boolean;
  columnOrder?: number[];
  count?: number;
  confirmFilters?: boolean;
  consoleWarnings?: boolean;
  customFilterDialogFooter?: (currentFilterList: MUIDataTableFilterList, applyFilters: () => void) => ReactNode;
  customFooter?:
    | ReactElement
    | ((
        count: number,
        page: number,
        rowsPerPage: number,
        changeRowsPerPage: (rowsPerPage: number) => void,
        changePage: (page: number) => void,
        textLabels: MUIDataTableTextLabels['pagination'],
      ) => ReactNode);
  customRowRender?: (data: MUIDataTableCellValue[], dataIndex: number, rowIndex: number) => ReactNode;
  customSearch?: (
    searchQuery: string,
    currentRow: MUIDataTableCellValue[],
    columns: MUIDataTableColumnState[],
  ) => boolean;
  customSearchRender?:
    | ReactElement
    | ((
        searchText: string,
        handleSearch: (text: string) => void,
        hideSearch: () => void,
        options: MUIDataTableOptions,
      ) => ReactNode);
  customSort?: (data: MUIDataTableDisplayRow[], colIndex: number, order: 'asc' | 'desc') => MUIDataTableDisplayRow[];
  customToolbar?: (data: { displayData: MUIDataTableDisplayRow[] }) => ReactNode;
  customToolbarSelect?: (
    selectedRows: MUIDataTableSelectedRows,
    displayData: MUIDataTableDisplayRow[],
    setSelectedRows: (rows: number[]) => void,
  ) => ReactNode;
  draggableColumns?: MUIDataTableDraggableColumns;
  enableNestedDataAccess?: string;
  expandableRows?: boolean;
  expandableRowsHeader?: boolean;
  expandableRowsOnClick?: boolean;
  disableToolbarSelect?: boolean;
  download?: MUIDataTableFeatureFlag;
  downloadOptions?: MUIDataTableDownloadOptions;
  elevation?: number;
  filter?: MUIDataTableFeatureFlag;
  filterOptions?: MUIDataTableColumnFilterOptions;
  filterArrayFullMatch?: boolean;
  filterType?: MUIDataTableFilterType;
  fixedHeader?: boolean;
  fixedSelectColumn?: boolean;
  fixedHeaderOptions?: { xAxis?: boolean; yAxis?: boolean };
  getTextLabels?: () => MUIDataTableTextLabels;
  isRowExpandable?: (dataIndex: number, expandedRows: MUIDataTableExpandedRows) => boolean;
  isRowSelectable?: (dataIndex: number, selectedRows: MUIDataTableSelectedRows) => boolean;
  jumpToPage?: boolean;
  onCellClick?: (cellData: MUIDataTableCellValue | ReactNode, cellMeta: MUIDataTableCellMeta) => void;
  onDownload?: (
    buildHead: (columns: MUIDataTableColumnState[]) => string,
    buildBody: (data: MUIDataTableDisplayRow[]) => string,
    columns: MUIDataTableColumnState[],
    data: MUIDataTableDisplayRow[],
  ) => string | false;
  onFilterChange?: (
    changedColumn: string | null,
    filterList: MUIDataTableFilterList,
    type: string,
    changedColumnIndex?: number,
    displayData?: MUIDataTableDisplayRow[],
  ) => void;
  onFilterChipClose?: (index: number, removedFilter: string, filterList: MUIDataTableFilterList) => void;
  onFilterConfirm?: (filterList: MUIDataTableFilterList) => void;
  onFilterDialogOpen?: () => void;
  onFilterDialogClose?: () => void;
  onRowClick?: (rowData: MUIDataTableCellValue[], rowMeta: MUIDataTableRowMeta) => void;
  onRowsExpand?: (currentRowsExpanded: MUIDataTableExpandedRows, allRowsExpanded: MUIDataTableExpandedRows) => void;
  onRowExpansionChange?: (
    currentRowsExpanded: MUIDataTableExpandedRows,
    allRowsExpanded: MUIDataTableExpandedRows,
    rowsExpanded: number[],
  ) => void;
  onRowsSelect?: (currentRowsSelected: MUIDataTableSelectedRows, allRowsSelected: MUIDataTableSelectedRows) => void;
  onRowSelectionChange?: (
    currentRowsSelected: MUIDataTableSelectedRows,
    allRowsSelected: MUIDataTableSelectedRows,
    rowsSelected: number[],
  ) => void;
  onTableChange?: (action: MUIDataTableTableAction, tableState: MUIDataTableState) => void;
  onTableInit?: (action: string, tableState: MUIDataTableState) => void;
  onSearchClose?: () => void;
  onSearchOpen?: () => void;
  page?: number;
  pagination?: boolean;
  print?: MUIDataTableFeatureFlag;
  searchProps?: Record<string, unknown>;
  selectableRows?: MUIDataTableSelectableRows;
  selectableRowsHeader?: boolean;
  selectableRowsHideCheckboxes?: boolean;
  selectableRowsOnClick?: boolean;
  selectToolbarPlacement?: MUIDataTableSelectToolbarPlacement;
  serverSide?: boolean;
  serverSideFilterList?: string[][] | null;
  tableId?: string;
  tableBodyHeight?: string;
  tableBodyMaxHeight?: string | null;
  renderExpandableRow?: (rowData: MUIDataTableCellValue[], rowMeta: MUIDataTableRowMeta) => ReactNode;
  resizableColumns?: boolean | MUIDataTableResizableColumns;
  responsive?: MUIDataTableResponsive;
  rowHover?: boolean;
  rowsExpanded?: number[];
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  rowsSelected?: number[];
  search?: MUIDataTableFeatureFlag;
  searchOpen?: boolean;
  searchAlwaysOpen?: boolean;
  searchPlaceholder?: string;
  searchText?: string;
  setFilterChipProps?: (columnIndex: number, columnName: string, filterValue: string) => Record<string, unknown>;
  setRowProps?: (row: MUIDataTableCellValue[], dataIndex: number, rowIndex: number) => ComponentProps<typeof TableRow>;
  setTableProps?: () => ComponentProps<typeof Table>;
  sort?: boolean;
  sortOrder?: MUIDataTableSortOrder;
  sortFilterList?: boolean;
  storageKey?: string;
  textLabels?: Partial<MUIDataTableTextLabels>;
  viewColumns?: MUIDataTableFeatureFlag;
}

export interface MUIDataTableDownloadOptions {
  filename?: string;
  separator?: string;
  filterOptions?: {
    useDisplayedColumnsOnly?: boolean;
    useDisplayedRowsOnly?: boolean;
  };
}

export interface MUIDataTableDraggableColumns {
  enabled?: boolean;
  transitionTime?: number;
}

export interface MUIDataTableResizableColumns {
  enabled?: boolean;
}

export interface MUIDataTableRowMeta {
  dataIndex: number;
  rowIndex: number;
}

export interface MUIDataTableCellMeta extends MUIDataTableRowMeta {
  colIndex: number;
  event: React.MouseEvent<HTMLElement>;
}

export interface MUIDataTableSelectedRow {
  index: number;
  dataIndex: number;
}

export interface MUIDataTableSelectedRows {
  data: MUIDataTableSelectedRow[];
  lookup: Record<number, boolean>;
}

export type MUIDataTableExpandedRows = MUIDataTableSelectedRows;

export interface MUIDataTableSortOrder {
  name: string;
  direction: 'asc' | 'desc';
}

export interface MUIDataTableState {
  activeColumn: number | null;
  announceText: string | null;
  count: number;
  columns: MUIDataTableColumnState[];
  columnOrder: number[];
  data: MUIDataTableDisplayRow[];
  displayData: MUIDataTableDisplayRow[];
  expandedRows: MUIDataTableExpandedRows;
  filterData: string[][];
  filterList: MUIDataTableFilterList;
  page: number;
  previousSelectedRow: MUIDataTableSelectedRow | null;
  rowsPerPage: number;
  searchProps: Record<string, unknown>;
  searchText: string | null;
  selectedRows: MUIDataTableSelectedRows;
  showResponsive: boolean;
  sortOrder: Partial<MUIDataTableSortOrder>;
}

export type StoredTableState = Pick<
  MUIDataTableState,
  'columns' | 'columnOrder' | 'filterList' | 'rowsPerPage' | 'sortOrder' | 'page' | 'selectedRows' | 'expandedRows'
>;
