import { useDrop } from 'react-dnd';
import type { DropTargetMonitor } from 'react-dnd';
import type { MUIDataTableColumnState } from '../types/columns';
import type { HeaderDragItem, HeadCellRefs, ColumnModelItem, ColumnDropTimers } from '../types/drag';

interface HeadCellElement extends HTMLElement {
  offsetLeft: number;
  offsetWidth: number;
  offsetParent: HTMLElement | null;
}

interface HoverOptions {
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

interface UseColumnDropOptions {
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

const getColModel = (
  headCellRefs: HeadCellRefs,
  columnOrder: number[],
  columns: MUIDataTableColumnState[],
): ColumnModelItem[] => {
  const colModel: ColumnModelItem[] = [];
  let leftMostCell: HeadCellElement | null = (headCellRefs[0] as HeadCellElement) || null;

  if (leftMostCell === null) {
    leftMostCell = { offsetLeft: Infinity } as HeadCellElement;
    const headCells = Object.entries(headCellRefs);
    headCells.forEach(([, item]) => {
      const el = item as HeadCellElement | null;
      if (el && el.offsetLeft < leftMostCell!.offsetLeft) {
        leftMostCell = el;
      }
    });

    if (leftMostCell!.offsetLeft === Infinity) {
      leftMostCell = { offsetParent: null, offsetWidth: 0, offsetLeft: 0 } as unknown as HeadCellElement;
    }
  }

  let ii = 0;
  let parentOffsetLeft = 0;
  let offsetParent = leftMostCell!.offsetParent as (HTMLElement & { scrollLeft?: number }) | null;
  while (offsetParent) {
    parentOffsetLeft = parentOffsetLeft + (offsetParent.offsetLeft || 0) - (offsetParent.scrollLeft || 0);
    offsetParent = offsetParent.offsetParent as (HTMLElement & { scrollLeft?: number }) | null;
    ii++;
    if (ii > 1000) break;
  }

  if (headCellRefs[0]) {
    colModel[0] = {
      left: parentOffsetLeft + leftMostCell!.offsetLeft,
      width: leftMostCell!.offsetWidth,
      columnIndex: null,
      ref: leftMostCell as unknown as HTMLElement,
    };
  }

  columnOrder.forEach((colIdx) => {
    const col = headCellRefs[colIdx + 1] as HeadCellElement;
    const cmIndx = colModel.length - 1;
    if (!(columns[colIdx] && columns[colIdx].display !== 'true')) {
      const prevLeft =
        cmIndx !== -1 ? colModel[cmIndx].left + colModel[cmIndx].width : parentOffsetLeft + leftMostCell!.offsetLeft;
      colModel.push({
        left: prevLeft,
        width: col.offsetWidth,
        columnIndex: colIdx,
        ref: col as unknown as HTMLElement,
      });
    }
  });

  return colModel;
};

const reorderColumns = (prevColumnOrder: number[], columnIndex: number, newPosition: number): number[] => {
  let columnOrder = prevColumnOrder.slice();
  const srcIndex = columnOrder.indexOf(columnIndex);
  const targetIndex = columnOrder.indexOf(newPosition);

  if (srcIndex !== -1 && targetIndex !== -1) {
    const newItem = columnOrder[srcIndex];
    columnOrder = [...columnOrder.slice(0, srcIndex), ...columnOrder.slice(srcIndex + 1)];
    columnOrder = [...columnOrder.slice(0, targetIndex), newItem, ...columnOrder.slice(targetIndex)];
  }
  return columnOrder;
};

const handleHover = (opts: HoverOptions): void => {
  const {
    mon,
    index,
    headCellRefs,
    updateColumnOrder,
    columnOrder,
    transitionTime = 300,
    tableRef,
    tableId,
    timers,
    columns,
  } = opts;

  const hoverIdx = mon.getItem().colIndex;

  if (headCellRefs !== mon.getItem().headCellRefs) return;

  if (hoverIdx !== index) {
    const reorderedCols = reorderColumns(columnOrder, mon.getItem().colIndex, index);
    const newColModel = getColModel(headCellRefs, reorderedCols, columns);

    const newX = mon.getClientOffset()!.x;
    let modelIdx = -1;
    for (let ii = 0; ii < newColModel.length; ii++) {
      if (newX > newColModel[ii].left && newX < newColModel[ii].left + newColModel[ii].width) {
        modelIdx = newColModel[ii].columnIndex as number;
        break;
      }
    }

    if (modelIdx === mon.getItem().colIndex) {
      clearTimeout(timers.columnShift);

      const curColModel = getColModel(headCellRefs, columnOrder, columns);

      const transitions: number[] = [];
      newColModel.forEach((item) => {
        transitions[item.columnIndex as number] = item.left;
      });
      curColModel.forEach((item) => {
        transitions[item.columnIndex as number] = transitions[item.columnIndex as number] - item.left;
      });

      for (let idx = 1; idx < columnOrder.length; idx++) {
        const colIndex = columnOrder[idx];
        if (columns[colIndex] && columns[colIndex].display !== 'true') {
          // skip hidden columns
        } else {
          const ref = headCellRefs[idx] as HTMLElement | null;
          if (ref) ref.style.transition = '280ms';
          if (ref) ref.style.transform = 'translateX(' + transitions[idx - 1] + 'px)';
        }
      }

      const allElms: HTMLElement[] = [];
      const dividers: HTMLElement[] = [];
      for (let ii = 0; ii < columnOrder.length; ii++) {
        const elms = tableRef
          ? tableRef.querySelectorAll<HTMLElement>('[data-colindex="' + ii + '"][data-tableid="' + tableId + '"]')
          : [];
        for (let jj = 0; jj < elms.length; jj++) {
          elms[jj].style.transition = transitionTime + 'ms';
          elms[jj].style.transform = 'translateX(' + transitions[ii] + 'px)';
          allElms.push(elms[jj]);
        }

        const divider = tableRef
          ? tableRef.querySelectorAll<HTMLElement>(
              '[data-divider-index="' + (ii + 1) + '"][data-tableid="' + tableId + '"]',
            )
          : [];
        for (let jj = 0; jj < divider.length; jj++) {
          divider[jj].style.transition = transitionTime + 'ms';
          divider[jj].style.transform = 'translateX(' + transitions[columnOrder[ii]] + 'px)';
          dividers.push(divider[jj]);
        }
      }

      const newColIndex = mon.getItem().colIndex;
      timers.columnShift = setTimeout(() => {
        allElms.forEach((item) => {
          item.style.transition = '0s';
          item.style.transform = 'translateX(0)';
        });
        dividers.forEach((item) => {
          item.style.transition = '0s';
          item.style.transform = 'translateX(0)';
        });
        updateColumnOrder(reorderedCols, newColIndex, index);
      }, transitionTime);
    }
  }
};

const useColumnDrop = (opts: UseColumnDropOptions) => {
  const [, drop] = useDrop({
    accept: 'HEADER',
    drop: opts.drop,
    hover: (item: HeaderDragItem, mon: DropTargetMonitor<HeaderDragItem, unknown>) =>
      handleHover({ ...opts, item, mon }),
    collect: (mon) => ({
      isOver: !!mon.isOver(),
      canDrop: !!mon.canDrop(),
    }),
  });

  return [drop] as const;
};

export { getColModel, reorderColumns, handleHover };
export default useColumnDrop;
