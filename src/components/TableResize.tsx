import React from 'react';
import { withStyles } from 'tss-react/mui';
import type { MUIDataTableOptions } from '../types/options';

const defaultResizeStyles = {
  root: {
    position: 'absolute' as const,
  },
  resizer: {
    position: 'absolute' as const,
    width: '1px',
    height: '100%',
    left: '100px',
    cursor: 'ew-resize',
    border: '0.1px solid rgba(224, 224, 224, 1)',
  },
};

function getParentOffsetLeft(tableEl: HTMLElement): number {
  let ii = 0;
  let parentOffsetLeft = 0;
  let offsetParent = tableEl.offsetParent as (HTMLElement & { scrollLeft?: number }) | null;
  while (offsetParent) {
    parentOffsetLeft = parentOffsetLeft + (offsetParent.offsetLeft || 0) - (offsetParent.scrollLeft || 0);
    offsetParent = offsetParent.offsetParent as (HTMLElement & { scrollLeft?: number }) | null;
    ii++;
    if (ii > 1000) break;
  }
  return parentOffsetLeft;
}

interface ResizeCoord {
  left: number;
}

interface TableResizeState {
  resizeCoords: Record<string, ResizeCoord>;
  priorPosition: Record<string, unknown>;
  tableWidth: number | string;
  tableHeight: number | string;
  isResize?: boolean;
  id?: string | null;
  lastColumn?: number;
  updateCoords?: boolean;
}

interface TableResizeProps {
  classes: Record<keyof typeof defaultResizeStyles, string>;
  options: MUIDataTableOptions;
  tableId?: string;
  resizableColumns?: boolean | { roundWidthPercentages?: boolean; enabled?: boolean };
  setResizeable: (fn: (cellsRef: Record<string, HTMLElement>, tableRef: HTMLElement) => void) => void;
  updateDividers: (fn: () => void) => void;
}

class TableResize extends React.Component<TableResizeProps, TableResizeState> {
  cellsRef: Record<string, HTMLElement> = {};
  tableRef: HTMLElement | null = null;
  minWidths: Record<string, number> = {};
  windowWidth: number | null = null;

  state: TableResizeState = {
    resizeCoords: {},
    priorPosition: {},
    tableWidth: '100%',
    tableHeight: '100%',
  };

  handleResize = () => {
    if (window.innerWidth !== this.windowWidth) {
      this.windowWidth = window.innerWidth;
      this.setDividers();
    }
  };

  componentDidMount() {
    this.minWidths = {};
    this.windowWidth = null;
    this.props.setResizeable(this.setCellRefs);
    this.props.updateDividers(() => this.setState({ updateCoords: true }, () => this.updateWidths));
    window.addEventListener('resize', this.handleResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
  }

  setCellRefs = (cellsRef: Record<string, HTMLElement>, tableRef: HTMLElement) => {
    this.cellsRef = cellsRef;
    this.tableRef = tableRef;
    this.setDividers();
  };

  setDividers = () => {
    const tableEl = this.tableRef!;
    const { width: tableWidth, height: tableHeight } = tableEl.getBoundingClientRect();
    const { resizeCoords } = this.state;

    for (const prop in resizeCoords) {
      delete resizeCoords[prop];
    }

    const parentOffsetLeft = getParentOffsetLeft(tableEl);
    const finalCells = Object.entries(this.cellsRef);
    const cellMinusOne = finalCells.filter((_item, ix) => ix + 1 < finalCells.length);

    cellMinusOne.forEach(([key, item]) => {
      if (!item) return;
      const left = (item.getBoundingClientRect().left || 0) - parentOffsetLeft;
      resizeCoords[key] = { left: left + item.offsetWidth };
    });
    this.setState({ tableWidth, tableHeight, resizeCoords }, this.updateWidths);
  };

  updateWidths = () => {
    let lastPosition = 0;
    const { resizeCoords, tableWidth } = this.state;

    Object.entries(resizeCoords).forEach(([key, item]) => {
      let newWidth: number | string = Number(((item.left - lastPosition) / (tableWidth as number)) * 100);

      if (typeof this.props.resizableColumns === 'object' && this.props.resizableColumns.roundWidthPercentages) {
        newWidth = newWidth.toFixed(2);
      }

      lastPosition = item.left;

      const thCell = this.cellsRef[key];
      if (thCell) thCell.style.width = newWidth + '%';
    });
  };

  onResizeStart = (id: string, e: React.MouseEvent) => {
    const tableEl = this.tableRef!;
    const originalWidth = tableEl.style.width;
    let lastColumn = 0;
    tableEl.style.width = '1px';

    const finalCells = Object.entries(this.cellsRef);
    finalCells.forEach(([key, item]) => {
      const elRect = item ? item.getBoundingClientRect() : { width: 0, left: 0 };
      this.minWidths[key] = elRect.width;
      lastColumn = Math.max(Number(key), lastColumn);
    });
    tableEl.style.width = originalWidth;

    this.setState({ isResize: true, id, lastColumn });
  };

  onResizeMove = (id: string, e: React.MouseEvent) => {
    const { isResize, resizeCoords, lastColumn } = this.state;

    const prevCol = (colId: number) => {
      let nextId = colId - 1;
      while (typeof resizeCoords[nextId] === 'undefined' && nextId >= 0) {
        nextId--;
      }
      return nextId;
    };
    const nextCol = (colId: number) => {
      let nextId = colId + 1;
      let tries = 0;
      while (typeof resizeCoords[nextId] === 'undefined' && tries < 20) {
        nextId++;
        tries++;
      }
      return nextId;
    };

    const fixedMinWidth1 = this.minWidths[id];
    const fixedMinWidth2 = this.minWidths[nextCol(parseInt(id, 10))] || this.minWidths[id];
    const idNumber = parseInt(id, 10);
    const finalCells = Object.entries(this.cellsRef);
    const tableEl = this.tableRef!;
    const { width: tableWidth, height: tableHeight } = tableEl.getBoundingClientRect();
    const { selectableRows } = this.props.options;

    const parentOffsetLeft = getParentOffsetLeft(tableEl);

    const nextCoord = (colId: number) => {
      let nextId = colId + 1;
      let tries = 0;
      while (typeof resizeCoords[nextId] === 'undefined' && tries < 20) {
        nextId++;
        tries++;
      }
      return resizeCoords[nextId];
    };
    const prevCoord = (colId: number) => {
      let nextId = colId - 1;
      while (typeof resizeCoords[nextId] === 'undefined' && nextId >= 0) {
        nextId--;
      }
      return resizeCoords[nextId];
    };

    if (isResize) {
      let leftPos = e.clientX - parentOffsetLeft;

      const handleMoveRightmostBoundary = (lp: number, tw: number, fw: number) => {
        if (lp > tw - fw) return tw - fw;
        return lp;
      };

      const handleMoveLeftmostBoundary = (lp: number, fw: number) => {
        if (lp < fw) return fw;
        return lp;
      };

      const handleMoveRight = (lp: number, _rc: typeof resizeCoords, colId: number, fw: number) => {
        if (typeof nextCoord(colId) === 'undefined') return lp;
        if (lp > nextCoord(colId).left - fw) return nextCoord(colId).left - fw;
        return lp;
      };

      const handleMoveLeft = (lp: number, _rc: typeof resizeCoords, colId: number, fw: number) => {
        if (typeof prevCoord(colId) === 'undefined') return lp;
        if (lp < prevCoord(colId).left + fw) return prevCoord(colId).left + fw;
        return lp;
      };

      const isFirstColumn = (sr: unknown, colId: number) => {
        let firstColumn = 1;
        while (!resizeCoords[firstColumn] && firstColumn < 20) {
          firstColumn++;
        }
        return (sr !== 'none' && colId === 0) || (sr === 'none' && colId === firstColumn);
      };

      const isLastColumn = (colId: number) => {
        return colId === prevCol(lastColumn!);
      };

      if (isFirstColumn(selectableRows, idNumber) && isLastColumn(idNumber)) {
        leftPos = handleMoveLeftmostBoundary(leftPos, fixedMinWidth1);
        leftPos = handleMoveRightmostBoundary(leftPos, tableWidth, fixedMinWidth2);
      } else if (!isFirstColumn(selectableRows, idNumber) && isLastColumn(idNumber)) {
        leftPos = handleMoveRightmostBoundary(leftPos, tableWidth, fixedMinWidth2);
        leftPos = handleMoveLeft(leftPos, resizeCoords, idNumber, fixedMinWidth1);
      } else if (isFirstColumn(selectableRows, idNumber) && !isLastColumn(idNumber)) {
        leftPos = handleMoveLeftmostBoundary(leftPos, fixedMinWidth1);
        leftPos = handleMoveRight(leftPos, resizeCoords, idNumber, fixedMinWidth2);
      } else if (!isFirstColumn(selectableRows, idNumber) && !isLastColumn(idNumber)) {
        leftPos = handleMoveLeft(leftPos, resizeCoords, idNumber, fixedMinWidth1);
        leftPos = handleMoveRight(leftPos, resizeCoords, idNumber, fixedMinWidth2);
      }

      const curCoord = { ...resizeCoords[id], left: leftPos };
      const newResizeCoords = { ...resizeCoords, [id]: curCoord };
      this.setState({ resizeCoords: newResizeCoords, tableHeight }, this.updateWidths);
    }
  };

  onResizeEnd = () => {
    this.setState({ isResize: false, id: null });
  };

  render() {
    const { classes, tableId } = this.props;
    const { id, isResize, resizeCoords, tableWidth, tableHeight } = this.state;

    return (
      <div className={classes.root} style={{ width: tableWidth }}>
        {Object.entries(resizeCoords).map(([key, val]) => {
          return (
            <div
              data-divider-index={key}
              data-tableid={tableId}
              aria-hidden="true"
              key={key}
              onMouseMove={(e) => this.onResizeMove(key, e)}
              onMouseUp={() => this.onResizeEnd()}
              style={{
                width: isResize && id == key ? tableWidth : 'auto',
                position: 'absolute',
                height: (tableHeight as number) - 2,
                cursor: 'ew-resize',
                zIndex: 1000,
              }}>
              <div
                aria-hidden="true"
                onMouseDown={(e) => this.onResizeStart(key, e)}
                className={classes.resizer}
                style={{ left: val.left }}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

export default withStyles(TableResize, defaultResizeStyles, { name: 'MUIDataTableResize' });
