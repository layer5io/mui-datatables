import React from 'react';
import type { ComponentProps } from 'react';
import {
  TableCell as MuiTableCell,
  TableRow as MuiTableRow,
  TableFooter as MuiTableFooter,
  TablePagination as MuiTablePagination,
} from '@mui/material';
import JumpToPage from './JumpToPage';
import { makeStyles } from 'tss-react/mui';
import { getPageValue } from '../utils';
import type { MUIDataTableOptions } from '../types/options';

const useStyles = makeStyles({ name: 'MUIDataTablePagination' })(() => ({
  root: {},
  tableCellContainer: {
    padding: '0px 24px 0px 24px',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  toolbar: {},
  selectRoot: {},
  '@media screen and (max-width: 400px)': {
    toolbar: {
      '& span:nth-of-type(2)': {
        display: 'none',
      },
    },
    selectRoot: {
      marginRight: '8px',
    },
  },
}));

interface TablePaginationProps {
  count: number;
  options: MUIDataTableOptions;
  page: number;
  rowsPerPage: number;
  changePage: (page: number) => void;
  changeRowsPerPage: (rowsPerPage: number) => void;
}

function TablePagination(props: TablePaginationProps) {
  const { classes } = useStyles();

  const handleRowChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    props.changeRowsPerPage(Number(event.target.value));
  };

  const handlePageChange = (_: unknown, page: number) => {
    props.changePage(page);
  };

  const { count, options, rowsPerPage, page } = props;
  const textLabels = options.textLabels?.pagination;
  const paginationSlotProps = {
    actions: {
      previousButton: {
        id: 'pagination-back',
        'data-testid': 'pagination-back',
        'aria-label': textLabels?.previous,
        title: textLabels?.previous || '',
      },
      nextButton: {
        id: 'pagination-next',
        'data-testid': 'pagination-next',
        'aria-label': textLabels?.next,
        title: textLabels?.next || '',
      },
    },
    select: {
      id: 'pagination-input',
      SelectDisplayProps: { id: 'pagination-rows', 'data-testid': 'pagination-rows' },
      MenuProps: {
        id: 'pagination-menu',
        'data-testid': 'pagination-menu',
        MenuListProps: { id: 'pagination-menu-list', 'data-testid': 'pagination-menu-list' },
      },
    },
  } as unknown as NonNullable<ComponentProps<typeof MuiTablePagination>['slotProps']>;

  return (
    <MuiTableFooter>
      <MuiTableRow>
        <MuiTableCell colSpan={1000} className={classes.tableCellContainer}>
          <div className={classes.navContainer}>
            {options.jumpToPage ? (
              <JumpToPage
                count={count}
                page={page}
                rowsPerPage={rowsPerPage}
                textLabels={options.textLabels as never}
                changePage={props.changePage}
              />
            ) : null}
            <MuiTablePagination
              component="div"
              className={classes.root}
              classes={{
                toolbar: classes.toolbar,
                selectRoot: classes.selectRoot,
              }}
              count={count}
              rowsPerPage={rowsPerPage}
              page={getPageValue(count, rowsPerPage, page)}
              labelRowsPerPage={textLabels?.rowsPerPage}
              labelDisplayedRows={({ from, to, count: c }) => `${from}-${to} ${textLabels?.displayRows} ${c}`}
              slotProps={paginationSlotProps}
              rowsPerPageOptions={options.rowsPerPageOptions}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowChange}
            />
          </div>
        </MuiTableCell>
      </MuiTableRow>
    </MuiTableFooter>
  );
}

export default TablePagination;
