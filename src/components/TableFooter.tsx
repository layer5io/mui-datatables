import React from 'react';
import { Table as MuiTable } from '@mui/material';
import TablePagination from './TablePagination';
import { makeStyles } from 'tss-react/mui';
import type { MUIDataTableOptions } from '../types/options';

const useStyles = makeStyles({ name: 'MUIDataTableFooter' })(() => ({
  root: {
    '@media print': {
      display: 'none',
    },
  },
}));

interface TableFooterProps {
  options: MUIDataTableOptions;
  rowCount: number;
  page: number;
  rowsPerPage: number;
  changeRowsPerPage: (rowsPerPage: number) => void;
  changePage: (page: number) => void;
}

const TableFooter = ({ options, rowCount, page, rowsPerPage, changeRowsPerPage, changePage }: TableFooterProps) => {
  const { classes } = useStyles();
  const { customFooter, pagination = true } = options;

  if (customFooter && typeof customFooter === 'function') {
    return (
      <MuiTable className={classes.root}>
        {customFooter(
          rowCount,
          page,
          rowsPerPage,
          changeRowsPerPage,
          changePage,
          options.textLabels?.pagination as never,
        )}
      </MuiTable>
    );
  }

  if (pagination) {
    return (
      <MuiTable className={classes.root}>
        <TablePagination
          count={rowCount}
          page={page}
          rowsPerPage={rowsPerPage}
          changeRowsPerPage={changeRowsPerPage}
          changePage={changePage}
          options={options}
        />
      </MuiTable>
    );
  }

  return null;
};

export default TableFooter;
