import React from 'react';
import { Typography, TableBody as MuiTableBody } from '@mui/material';
import TableBodyCell from './TableBodyCell';
import TableBodyRow from './TableBodyRow';
import TableSelectCell from './TableSelectCell';
import { withStyles } from 'tss-react/mui';
import cloneDeep from 'lodash.clonedeep';
import { getPageValue } from '../utils';
import clsx from 'clsx';
import type { ComponentType } from 'react';
import type { MUIDataTableColumnState } from '../types/columns';
import type {
  MUIDataTableOptions,
  MUIDataTableSelectedRows,
  MUIDataTableExpandedRows,
  MUIDataTableDisplayRow,
  MUIDataTableSelectedRow,
  MUIDataTableCellValue,
} from '../types/options';
import type { Theme } from '@mui/material/styles';

const defaultBodyStyles = (theme: Theme) => ({
  root: {},
  emptyTitle: {
    textAlign: 'center' as const,
  },
  lastStackedCell: {
    [theme.breakpoints.down('md')]: {
      '& td:last-child': {
        borderBottom: 'none',
      },
    },
  },
  lastSimpleCell: {
    [theme.breakpoints.down('sm')]: {
      '& td:last-child': {
        borderBottom: 'none',
      },
    },
  },
});

interface TableBodyProps {
  data: MUIDataTableDisplayRow[];
  count: number;
  columns: MUIDataTableColumnState[];
  options: MUIDataTableOptions;
  filterList?: string[][];
  expandedRows: MUIDataTableExpandedRows;
  selectedRows: MUIDataTableSelectedRows;
  selectRowUpdate: (type: string, data: unknown, adjacentRows?: MUIDataTableSelectedRow[]) => void;
  previousSelectedRow: MUIDataTableSelectedRow | null;
  searchText?: string | null;
  toggleExpandRow: (row: { index: number; dataIndex: number }) => void;
  classes: Record<keyof ReturnType<typeof defaultBodyStyles>, string>;
  columnOrder?: number[];
  components?: { Checkbox?: ComponentType<unknown>; ExpandButton?: ComponentType<unknown> };
  tableId?: string;
  page: number;
  rowsPerPage: number;
}

class TableBody extends React.Component<TableBodyProps> {
  static defaultProps = {
    toggleExpandRow: () => {},
  };

  buildRows(): MUIDataTableDisplayRow[] | null {
    const { data, page, rowsPerPage, count } = this.props;

    if (this.props.options.serverSide) return data.length ? data : null;

    const rows: MUIDataTableDisplayRow[] = [];
    const highestPageInRange = getPageValue(count, rowsPerPage, page);
    const fromIndex = highestPageInRange === 0 ? 0 : highestPageInRange * rowsPerPage;
    const toIndex = Math.min(count, (highestPageInRange + 1) * rowsPerPage);

    if (page > highestPageInRange) {
      console.warn('Current page is out of range, using the highest page that is in range instead.');
    }

    for (let rowIndex = fromIndex; rowIndex < count && rowIndex < toIndex; rowIndex++) {
      if (data[rowIndex] !== undefined) rows.push(data[rowIndex]);
    }

    return rows.length ? rows : null;
  }

  getRowIndex(index: number): number {
    const { page, rowsPerPage, options } = this.props;
    if (options.serverSide) return index;
    const startIndex = page === 0 ? 0 : page * rowsPerPage;
    return startIndex + index;
  }

  isRowSelected(dataIndex: number): boolean {
    const { selectedRows } = this.props;
    return selectedRows.lookup && selectedRows.lookup[dataIndex] ? true : false;
  }

  isRowExpanded(dataIndex: number): boolean {
    const { expandedRows } = this.props;
    return expandedRows.lookup && expandedRows.lookup[dataIndex] ? true : false;
  }

  isRowSelectable(dataIndex: number, selectedRows?: MUIDataTableSelectedRows): boolean {
    const { options } = this.props;
    const rows = selectedRows || this.props.selectedRows;
    if (options.isRowSelectable) {
      return options.isRowSelectable(dataIndex, rows);
    }
    return true;
  }

  isRowExpandable(dataIndex: number): boolean {
    const { options, expandedRows } = this.props;
    if (options.isRowExpandable) {
      return options.isRowExpandable(dataIndex, expandedRows);
    }
    return true;
  }

  handleRowSelect = (data: { index: number; dataIndex: number }, event: React.MouseEvent) => {
    const shiftKey = event && event.nativeEvent ? (event.nativeEvent as MouseEvent).shiftKey : false;
    let shiftAdjacentRows: MUIDataTableSelectedRow[] = [];
    const previousSelectedRow = this.props.previousSelectedRow;

    if (shiftKey && previousSelectedRow && previousSelectedRow.index < this.props.data.length) {
      let curIndex = previousSelectedRow.index;
      const selectedRows = cloneDeep(this.props.selectedRows);
      const clickedDataIndex = this.props.data[data.index].dataIndex;

      if (selectedRows.data.filter((d) => d.dataIndex === clickedDataIndex).length === 0) {
        selectedRows.data.push({ index: data.index, dataIndex: clickedDataIndex });
        selectedRows.lookup[clickedDataIndex] = true;
      }

      while (curIndex !== data.index) {
        const dataIndex = this.props.data[curIndex].dataIndex;
        if (this.isRowSelectable(dataIndex, selectedRows)) {
          const lookup = { index: curIndex, dataIndex };
          if (selectedRows.data.filter((d) => d.dataIndex === dataIndex).length === 0) {
            selectedRows.data.push(lookup);
            selectedRows.lookup[dataIndex] = true;
          }
          shiftAdjacentRows.push(lookup);
        }
        curIndex = data.index > curIndex ? curIndex + 1 : curIndex - 1;
      }
    }
    this.props.selectRowUpdate('cell', data, shiftAdjacentRows);
  };

  handleRowClick = (
    row: MUIDataTableCellValue[],
    data: { rowIndex: number; dataIndex: number },
    event: React.MouseEvent<HTMLTableRowElement>,
  ) => {
    const target = event.target as HTMLElement;
    if (
      target.id === 'expandable-button' ||
      (target.nodeName === 'path' && (target.parentNode as HTMLElement)?.id === 'expandable-button')
    ) {
      return;
    }

    if (target.id && target.id.startsWith('MUIDataTableSelectCell')) return;

    if (
      this.props.options.selectableRowsOnClick &&
      this.props.options.selectableRows !== 'none' &&
      this.isRowSelectable(data.dataIndex, this.props.selectedRows)
    ) {
      const selectRow = { index: data.rowIndex, dataIndex: data.dataIndex };
      this.handleRowSelect(selectRow, event as unknown as React.MouseEvent);
    }

    if (
      this.props.options.expandableRowsOnClick &&
      this.props.options.expandableRows &&
      this.isRowExpandable(data.dataIndex)
    ) {
      const expandRow = { index: data.rowIndex, dataIndex: data.dataIndex };
      this.props.toggleExpandRow(expandRow);
    }

    if (this.props.options.selectableRowsOnClick) return;

    this.props.options.onRowClick && this.props.options.onRowClick(row, data);
  };

  processRow = (row: MUIDataTableCellValue[], columnOrder: number[]) => {
    const ret: { value: MUIDataTableCellValue; index: number }[] = [];
    for (let ii = 0; ii < row.length; ii++) {
      ret.push({ value: row[columnOrder[ii]], index: columnOrder[ii] });
    }
    return ret;
  };

  render() {
    const {
      classes,
      columns,
      toggleExpandRow,
      options,
      columnOrder = this.props.columns.map((_item, idx) => idx),
      components = {},
      tableId,
    } = this.props;
    const tableRows = this.buildRows();
    const visibleColCnt = columns.filter((c) => c.display === 'true').length;

    return (
      <MuiTableBody>
        {tableRows && tableRows.length > 0 ? (
          tableRows.map((data, rowIndex) => {
            const { data: row, dataIndex } = data;

            if (options.customRowRender) {
              return options.customRowRender(row, dataIndex, rowIndex);
            }

            const isRowSelected = options.selectableRows !== 'none' ? this.isRowSelected(dataIndex) : false;
            const isRowSelectable = this.isRowSelectable(dataIndex);
            const bodyClasses = (
              options.setRowProps ? options.setRowProps(row, dataIndex, rowIndex) || {} : {}
            ) as Record<string, unknown>;

            const processedRow = this.processRow(row, columnOrder);

            return (
              <React.Fragment key={rowIndex}>
                <TableBodyRow
                  {...bodyClasses}
                  options={options}
                  rowSelected={isRowSelected}
                  isRowSelectable={isRowSelectable}
                  onClick={(e: React.MouseEvent<HTMLTableRowElement>) =>
                    this.handleRowClick(row, { rowIndex, dataIndex }, e)
                  }
                  className={clsx({
                    [classes.lastStackedCell]:
                      options.responsive === 'vertical' ||
                      options.responsive === 'stacked' ||
                      options.responsive === 'stackedFullWidth',
                    [classes.lastSimpleCell]: options.responsive === 'simple',
                    [bodyClasses.className as string]: !!bodyClasses.className,
                  })}
                  data-testid={'MUIDataTableBodyRow-' + dataIndex}
                  id={`MUIDataTableBodyRow-${tableId}-${dataIndex}`}>
                  <TableSelectCell
                    onChange={(e: unknown) =>
                      this.handleRowSelect({ index: this.getRowIndex(rowIndex), dataIndex }, e as React.MouseEvent)
                    }
                    onExpand={() => toggleExpandRow({ index: this.getRowIndex(rowIndex), dataIndex })}
                    fixedHeader={options.fixedHeader}
                    fixedSelectColumn={options.fixedSelectColumn}
                    checked={isRowSelected}
                    expandableOn={options.expandableRows}
                    hideExpandButton={!this.isRowExpandable(dataIndex) && options.expandableRows}
                    selectableOn={options.selectableRows as string}
                    selectableRowsHideCheckboxes={options.selectableRowsHideCheckboxes}
                    isRowExpanded={this.isRowExpanded(dataIndex)}
                    isRowSelectable={isRowSelectable}
                    dataIndex={dataIndex}
                    id={`MUIDataTableSelectCell-${tableId}-${dataIndex}`}
                    components={components}
                  />
                  {processedRow.map((column) => {
                    if (columns[column.index].display !== 'true') return null;
                    const cellValue = column.value instanceof Date ? String(column.value) : column.value;

                    return (
                      <TableBodyCell
                        {...(columns[column.index].setCellProps
                          ? columns[column.index].setCellProps!(column.value, dataIndex, column.index) || {}
                          : {})}
                        data-testid={`MuiDataTableBodyCell-${column.index}-${rowIndex}`}
                        dataIndex={dataIndex}
                        rowIndex={rowIndex}
                        colIndex={column.index}
                        columnHeader={columns[column.index].label}
                        print={columns[column.index].print}
                        options={options}
                        tableId={tableId}
                        key={column.index}>
                        {cellValue}
                      </TableBodyCell>
                    );
                  })}
                </TableBodyRow>
                {this.isRowExpanded(dataIndex) &&
                  options.renderExpandableRow &&
                  options.renderExpandableRow(row, { rowIndex, dataIndex })}
              </React.Fragment>
            );
          })
        ) : (
          <TableBodyRow options={options}>
            <TableBodyCell
              colSpan={options.selectableRows !== 'none' || options.expandableRows ? visibleColCnt + 1 : visibleColCnt}
              options={options}
              colIndex={0}
              rowIndex={0}
              columnHeader={null}
              print={true}
              dataIndex={0}>
              <Typography variant="body1" className={classes.emptyTitle} component={'div'}>
                {options.textLabels?.body?.noMatch}
              </Typography>
            </TableBodyCell>
          </TableBodyRow>
        )}
      </MuiTableBody>
    );
  }
}

export default withStyles(TableBody, defaultBodyStyles, { name: 'MUIDataTableBody' });
