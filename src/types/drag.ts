import type { ConnectDropTarget, DropTargetMonitor } from 'react-dnd';
import type { MUIDataTableColumnState } from './columns';

export interface HeaderDragItem {
  type: 'HEADER';
  colIndex: number;
  headCellRefs: HeadCellRefs;
}

export type HeadCellRefs = Record<number, HTMLTableCellElement | null>;

export interface ColumnModelItem {
  left: number;
  width: number;
  columnIndex: number | null;
  ref: HTMLElement;
}

export interface ColumnDropTimers {
  columnShift?: ReturnType<typeof setTimeout>;
}

export interface HeadCellElement extends HTMLElement {
  offsetLeft: number;
  offsetWidth: number;
  offsetParent: HTMLElement | null;
}

export interface HoverOptions {
  item: HeaderDragItem;
  mon: DropTargetMonitor<HeaderDragItem, unknown>;
  index: number;
  headCellRefs: HeadCellRefs;
  updateColumnOrder: (columnOrder: number[], sourceColumnIndex: number, targetColumnIndex: number) => void;
  columnOrder: number[];
  transitionTime?: number;
  tableRef: HTMLElement | null;
  tableId: string;
  timers: ColumnDropTimers;
  columns: MUIDataTableColumnState[];
}

export interface UseColumnDropOptions {
  index: number;
  columnOrder: number[];
  columns: MUIDataTableColumnState[];
  headCellRefs: HeadCellRefs;
  tableRef: HTMLElement | null;
  tableId: string;
  timers: ColumnDropTimers;
  transitionTime?: number;
  drop?: (item: HeaderDragItem, monitor: DropTargetMonitor<HeaderDragItem, unknown>) => void;
  updateColumnOrder: (columnOrder: number[], sourceColumnIndex: number, targetColumnIndex: number) => void;
}

export type UseColumnDropResult = [ConnectDropTarget];
