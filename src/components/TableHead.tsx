import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import clsx from 'clsx';
import { TableHead as MuiTableHead } from '@mui/material';
import TableHeadCell from './TableHeadCell';
import TableHeadRow from './TableHeadRow';
import TableSelectCell from './TableSelectCell';
import type { ComponentType } from 'react';
import type { MUIDataTableColumnState } from '../types/columns';
import type {
  MUIDataTableOptions,
  MUIDataTableSelectedRows,
  MUIDataTableExpandedRows,
  MUIDataTableDisplayRow,
  MUIDataTableSortOrder,
} from '../types/options';
import type { HeadCellRefs, ColumnDropTimers } from '../types/drag';

const useStyles = makeStyles({ name: 'MUIDataTableHead' })((theme) => ({
  main: {},
  responsiveStacked: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  responsiveStackedAlways: {
    display: 'none',
  },
  responsiveSimple: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

interface TableHeadProps {
  columnOrder?: number[] | null;
  columns: MUIDataTableColumnState[];
  components?: { Tooltip?: ComponentType<unknown>; Checkbox?: ComponentType<unknown> };
  count: number;
  data: MUIDataTableDisplayRow[];
  draggableHeadCellRefs?: HeadCellRefs;
  expandedRows?: MUIDataTableExpandedRows;
  options: MUIDataTableOptions;
  selectedRows: MUIDataTableSelectedRows;
  selectRowUpdate: (type: string, val: null) => void;
  setCellRef?: (index: number, pos: number, el: HTMLTableCellElement | null) => void;
  sortOrder?: Partial<MUIDataTableSortOrder>;
  tableRef?: () => HTMLElement | null;
  tableId?: string;
  timers?: ColumnDropTimers;
  toggleAllExpandableRows?: () => void;
  toggleSort: (index: number) => void;
  updateColumnOrder?: (columnOrder: number[], src: number, target: number) => void;
}

const TableHead = ({
  columnOrder = null,
  columns,
  components = {},
  count,
  data,
  draggableHeadCellRefs,
  expandedRows,
  options,
  selectedRows,
  selectRowUpdate,
  setCellRef,
  sortOrder = {},
  tableRef,
  tableId,
  timers,
  toggleAllExpandableRows,
  toggleSort,
  updateColumnOrder,
}: TableHeadProps) => {
  const { classes } = useStyles();

  let resolvedColumnOrder = columnOrder;
  if (resolvedColumnOrder === null) {
    resolvedColumnOrder = columns ? columns.map((_item, idx) => idx) : [];
  }

  const [dragging, setDragging] = useState(false);

  const handleToggleColumn = (index: number) => {
    toggleSort(index);
  };

  const handleRowSelect = () => {
    selectRowUpdate('head', null);
  };

  const numSelected = (selectedRows && selectedRows.data.length) || 0;
  let isIndeterminate = numSelected > 0 && numSelected < count;
  let isChecked = numSelected > 0 && numSelected >= count;

  if (
    options.disableToolbarSelect === true ||
    options.selectToolbarPlacement === 'none' ||
    options.selectToolbarPlacement === 'above'
  ) {
    if (isChecked) {
      for (let ii = 0; ii < data.length; ii++) {
        if (!selectedRows.lookup[data[ii].dataIndex]) {
          isChecked = false;
          isIndeterminate = true;
          break;
        }
      }
    } else {
      if (numSelected > count) {
        isIndeterminate = true;
      }
    }
  }

  const orderedColumns = resolvedColumnOrder.map((colIndex, idx) => ({
    column: columns[colIndex],
    index: colIndex,
    colPos: idx,
  }));

  return (
    <MuiTableHead
      className={clsx({
        [classes.responsiveStacked]:
          options.responsive === 'vertical' ||
          options.responsive === 'stacked' ||
          options.responsive === 'stackedFullWidth',
        [classes.responsiveStackedAlways]: options.responsive === 'verticalAlways',
        [classes.responsiveSimple]: options.responsive === 'simple',
        [classes.main]: true,
      })}>
      <TableHeadRow>
        <TableSelectCell
          setHeadCellRef={setCellRef}
          onChange={handleRowSelect}
          indeterminate={isIndeterminate}
          checked={isChecked}
          isHeaderCell={true}
          expandedRows={expandedRows}
          expandableRowsHeader={options.expandableRowsHeader}
          expandableOn={options.expandableRows}
          selectableOn={options.selectableRows as string}
          fixedHeader={options.fixedHeader}
          fixedSelectColumn={options.fixedSelectColumn}
          selectableRowsHeader={options.selectableRowsHeader}
          selectableRowsHideCheckboxes={options.selectableRowsHideCheckboxes}
          onExpand={toggleAllExpandableRows}
          isRowSelectable={true}
          components={components}
        />
        {orderedColumns.map(
          ({ column, index, colPos }) =>
            column.display === 'true' &&
            (column.customHeadRender ? (
              column.customHeadRender({ index, ...column }, handleToggleColumn, sortOrder as MUIDataTableSortOrder)
            ) : (
              <TableHeadCell
                cellHeaderProps={
                  columns[index].setCellHeaderProps
                    ? columns[index].setCellHeaderProps!({ index, ...column }) || {}
                    : {}
                }
                key={index}
                index={index}
                colPosition={colPos}
                setCellRef={setCellRef}
                sort={column.sort}
                sortDirection={column.name === sortOrder.name ? sortOrder.direction : 'none'}
                toggleSort={handleToggleColumn}
                hint={column.hint}
                print={column.print}
                options={options}
                column={column}
                columns={columns}
                updateColumnOrder={updateColumnOrder}
                columnOrder={resolvedColumnOrder!}
                timers={timers}
                draggingHook={[dragging, setDragging]}
                draggableHeadCellRefs={draggableHeadCellRefs}
                tableRef={tableRef}
                tableId={tableId}
                components={components}>
                {column.customHeadLabelRender
                  ? column.customHeadLabelRender({ index, colPos, ...column })
                  : column.label}
              </TableHeadCell>
            )),
        )}
      </TableHeadRow>
    </MuiTableHead>
  );
};

export default TableHead;
