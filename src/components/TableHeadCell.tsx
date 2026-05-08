import React, { useState } from 'react';
import { Button, TableCell, TableSortLabel, Tooltip as MuiTooltip } from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';
import clsx from 'clsx';
import useColumnDrop from '../hooks/useColumnDrop';
import { makeStyles } from 'tss-react/mui';
import { useDrag } from 'react-dnd';
import type { ComponentProps, ReactNode, ComponentType, RefCallback } from 'react';
import type { MUIDataTableColumnState, MUIDataTableSortDirection } from '../types/columns';
import type { MUIDataTableOptions } from '../types/options';
import type { HeadCellRefs, ColumnDropTimers, HeaderDragItem } from '../types/drag';

const useStyles = makeStyles({ name: 'MUIDataTableHeadCell' })((theme) => ({
  root: {},
  fixedHeader: {
    position: 'sticky',
    top: '0px',
    zIndex: 100,
    backgroundColor: theme.palette.background.paper,
  },
  tooltip: {
    cursor: 'pointer',
  },
  mypopper: {
    '&[data-x-out-of-boundaries]': {
      display: 'none',
    },
  },
  data: {
    display: 'inline-block',
  },
  sortAction: {
    display: 'flex',
    cursor: 'pointer',
  },
  dragCursor: {
    cursor: 'grab',
  },
  sortLabelRoot: {
    height: '20px',
  },
  sortActive: {
    color: theme.palette.text.primary,
  },
  toolButton: {
    textTransform: 'none' as const,
    marginLeft: '-8px',
    minWidth: 0,
    marginRight: '8px',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  hintIconAlone: {
    marginTop: '-3px',
    marginLeft: '3px',
  },
  hintIconWithSortIcon: {
    marginTop: '-3px',
  },
}));

interface TableHeadCellProps {
  cellHeaderProps?: ComponentProps<typeof TableCell>;
  children?: ReactNode;
  colPosition?: number;
  column?: MUIDataTableColumnState;
  columns?: MUIDataTableColumnState[];
  columnOrder?: number[];
  components?: { Tooltip?: ComponentType<unknown> };
  draggableHeadCellRefs?: HeadCellRefs;
  draggingHook?: [boolean, (val: boolean) => void];
  hint?: string;
  index: number;
  options: MUIDataTableOptions;
  print: boolean;
  setCellRef?: (index: number, pos: number, el: HTMLTableCellElement | null) => void;
  sort: boolean;
  sortDirection?: MUIDataTableSortDirection;
  tableRef?: () => HTMLElement | null;
  tableId?: string;
  timers?: ColumnDropTimers;
  toggleSort: (index: number) => void;
  updateColumnOrder?: (columnOrder: number[], src: number, target: number) => void;
}

const TableHeadCell = ({
  cellHeaderProps = {},
  children,
  colPosition,
  column,
  columns,
  columnOrder = [],
  components = {},
  draggableHeadCellRefs,
  draggingHook,
  hint,
  index,
  options,
  print,
  setCellRef,
  sort,
  sortDirection,
  tableRef,
  tableId,
  timers,
  toggleSort,
  updateColumnOrder,
}: TableHeadCellProps) => {
  const [sortTooltipOpen, setSortTooltipOpen] = useState(false);
  const [hintTooltipOpen, setHintTooltipOpen] = useState(false);

  const { classes } = useStyles();

  const handleKeyboardSortInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      toggleSort(index);
    }

    return false;
  };

  const handleSortClick = () => {
    toggleSort(index);
  };

  const [dragging, setDragging] = draggingHook ? draggingHook : ([] as unknown as [boolean, (val: boolean) => void]);

  const { className, ...otherProps } = cellHeaderProps as { className?: string; [key: string]: unknown };
  const Tooltip = (components.Tooltip || MuiTooltip) as typeof MuiTooltip;
  const sortActive = sortDirection !== 'none' && sortDirection !== undefined;
  const ariaSortDirection = sortDirection === 'none' ? false : sortDirection;

  const isDraggingEnabled = () => {
    if (!draggingHook) return false;
    return (
      options.draggableColumns &&
      options.draggableColumns.enabled &&
      (column as unknown as Record<string, unknown>)?.draggable !== false
    );
  };

  const setDragRefButton: RefCallback<HTMLButtonElement> = (node) => {
    if (isDraggingEnabled()) {
      dragRef(node);
    }
  };

  const setDragRefDiv: RefCallback<HTMLDivElement> = (node) => {
    if (isDraggingEnabled()) {
      dragRef(node);
    }
  };

  const sortLabelProps = {
    classes: { root: classes.sortLabelRoot },
    tabIndex: -1,
    active: sortActive,
    hideSortIcon: true,
    ...(ariaSortDirection ? { direction: sortDirection as 'asc' | 'desc' } : {}),
  };

  const [{ opacity }, dragRef] = useDrag({
    type: 'HEADER',
    item: () => {
      setTimeout(() => {
        setHintTooltipOpen(false);
        setSortTooltipOpen(false);
        if (setDragging) setDragging(true);
      }, 0);
      return {
        colIndex: index,
        headCellRefs: draggableHeadCellRefs,
      };
    },
    end: () => {
      if (setDragging) setDragging(false);
    },
    collect: (monitor) => {
      return {
        opacity: monitor.isDragging() ? 1 : 0,
      };
    },
  });

  const [drop] = useColumnDrop({
    drop: () => {
      setSortTooltipOpen(false);
      setHintTooltipOpen(false);
      if (setDragging) setDragging(false);
    },
    index,
    headCellRefs: draggableHeadCellRefs || {},
    updateColumnOrder: updateColumnOrder || (() => {}),
    columnOrder,
    columns: columns || [],
    transitionTime: options.draggableColumns ? options.draggableColumns.transitionTime : 300,
    tableRef: tableRef ? tableRef() : null,
    tableId: tableId || 'none',
    timers: timers || {},
  });

  const cellClass = clsx({
    [classes.root]: true,
    [classes.fixedHeader]: options.fixedHeader,
    'datatables-noprint': !print,
    [className as string]: !!className,
  });

  const getTooltipTitle = () => {
    if (dragging) return '';
    if (!options.textLabels) return '';
    if (column && options.textLabels.body?.columnHeaderTooltip) {
      return (options.textLabels.body as { columnHeaderTooltip: (col: unknown) => string }).columnHeaderTooltip(column);
    }
    return options.textLabels.body?.toolTip || '';
  };

  const closeTooltip = () => {
    setSortTooltipOpen(false);
  };

  return (
    <TableCell
      ref={(ref: HTMLTableCellElement | null) => {
        drop && drop(ref);
        setCellRef && setCellRef(index + 1, (colPosition || 0) + 1, ref);
      }}
      className={cellClass}
      scope={'col'}
      sortDirection={ariaSortDirection || undefined}
      data-colindex={index}
      data-tableid={tableId}
      onMouseDown={closeTooltip}
      {...otherProps}>
      {options.sort && sort ? (
        <span className={classes.contentWrapper}>
          <Tooltip
            title={getTooltipTitle()}
            placement="bottom"
            open={sortTooltipOpen}
            onOpen={() => (dragging ? setSortTooltipOpen(false) : setSortTooltipOpen(true))}
            onClose={() => setSortTooltipOpen(false)}
            classes={{
              tooltip: classes.tooltip,
              popper: classes.mypopper,
            }}>
            <Button
              variant={'text'}
              onKeyUp={handleKeyboardSortInput}
              onClick={handleSortClick}
              className={classes.toolButton}
              data-testid={`headcol-${index}`}
              ref={setDragRefButton}>
              <div className={classes.sortAction}>
                <div
                  className={clsx({
                    [classes.data]: true,
                    [classes.sortActive]: sortActive,
                    [classes.dragCursor]: isDraggingEnabled(),
                  })}>
                  {children}
                </div>
                <div className={classes.sortAction}>
                  <TableSortLabel {...sortLabelProps} />
                </div>
              </div>
            </Button>
          </Tooltip>
          {hint && (
            <Tooltip title={hint}>
              <HelpIcon
                className={!sortActive ? classes.hintIconAlone : classes.hintIconWithSortIcon}
                fontSize="small"
              />
            </Tooltip>
          )}
        </span>
      ) : (
        <div className={hint ? classes.sortAction : undefined} ref={setDragRefDiv}>
          {children}
          {hint && (
            <Tooltip
              title={hint}
              placement={'bottom-end'}
              open={hintTooltipOpen}
              onOpen={() => setHintTooltipOpen(true)}
              onClose={() => setHintTooltipOpen(false)}
              classes={{
                tooltip: classes.tooltip,
                popper: classes.mypopper,
              }}
              enterDelay={300}>
              <HelpIcon className={classes.hintIconAlone} fontSize="small" />
            </Tooltip>
          )}
        </div>
      )}
    </TableCell>
  );
};

export default TableHeadCell;
