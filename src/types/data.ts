export type MUIDataTablePrimitive = string | number | boolean | null | undefined;

export type MUIDataTableCellValue = MUIDataTablePrimitive | React.ReactNode | Date | readonly MUIDataTablePrimitive[];

export type MUIDataTableArrayRow = readonly MUIDataTableCellValue[];

export type MUIDataTableObjectRow = Record<string, MUIDataTableCellValue>;

export type MUIDataTableData = readonly MUIDataTableArrayRow[] | readonly MUIDataTableObjectRow[];

export interface MUIDataTableDisplayRow {
  data: MUIDataTableCellValue[];
  dataIndex: number;
  index: number;
}

export interface MUIDataTableMeta<TValue = MUIDataTableCellValue> {
  rowIndex: number;
  columnIndex: number;
  columnData: unknown;
  rowData: MUIDataTableCellValue[];
  tableData: MUIDataTableDisplayRow[];
  tableState: MUIDataTableState;
  currentTableData: MUIDataTableDisplayRow[];
}

import type { MUIDataTableState } from './options';
