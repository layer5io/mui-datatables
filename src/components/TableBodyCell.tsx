import React, { useCallback } from 'react';
import clsx from 'clsx';
import { TableCell } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import type { ReactNode } from 'react';
import type { MUIDataTableOptions } from '../types/options';

const useStyles = makeStyles({ name: 'MUIDataTableBodyCell' })((theme) => ({
  root: {},
  cellHide: {
    display: 'none',
  },
  simpleHeader: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline-block',
      fontWeight: 'bold',
      width: '100%',
      boxSizing: 'border-box',
    },
  },
  simpleCell: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline-block',
      width: '100%',
      boxSizing: 'border-box',
    },
  },
  stackedHeader: {
    verticalAlign: 'top',
  },
  stackedCommon: {
    [theme.breakpoints.down('md')]: {
      display: 'inline-block',
      fontSize: '16px',
      height: 'auto',
      width: 'calc(50%)',
      boxSizing: 'border-box',
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:nth-last-of-type(2)': {
        borderBottom: 'none',
      },
    },
  },
  stackedCommonAlways: {
    display: 'inline-block',
    fontSize: '16px',
    height: 'auto',
    width: 'calc(50%)',
    boxSizing: 'border-box',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:nth-last-of-type(2)': {
      borderBottom: 'none',
    },
  },
  stackedParent: {
    [theme.breakpoints.down('md')]: {
      display: 'inline-block',
      fontSize: '16px',
      height: 'auto',
      width: 'calc(100%)',
      boxSizing: 'border-box',
    },
  },
  stackedParentAlways: {
    display: 'inline-block',
    fontSize: '16px',
    height: 'auto',
    width: 'calc(100%)',
    boxSizing: 'border-box',
  },
  cellStackedSmall: {
    [theme.breakpoints.down('md')]: {
      width: '50%',
      boxSizing: 'border-box',
    },
  },
  responsiveStackedSmall: {
    [theme.breakpoints.down('md')]: {
      width: '50%',
      boxSizing: 'border-box',
    },
  },
  responsiveStackedSmallParent: {
    [theme.breakpoints.down('md')]: {
      width: '100%',
      boxSizing: 'border-box',
    },
  },
}));

interface TableBodyCellProps {
  children: ReactNode | ((dataIndex: number, rowIndex: number) => ReactNode);
  colIndex: number;
  columnHeader: ReactNode;
  options: MUIDataTableOptions;
  dataIndex: number;
  rowIndex: number;
  className?: string;
  print: boolean;
  tableId?: string;
  [key: string]: unknown;
}

function TableBodyCell(props: TableBodyCellProps) {
  const { classes } = useStyles();
  const { children, colIndex, columnHeader, options, dataIndex, rowIndex, className, print, tableId, ...otherProps } =
    props;
  const onCellClick = options.onCellClick;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (onCellClick) onCellClick(children as unknown as string, { colIndex, rowIndex, dataIndex, event });
    },
    [onCellClick, children, colIndex, rowIndex, dataIndex],
  );

  const methods: Record<string, unknown> = {};
  if (onCellClick) {
    methods.onClick = handleClick;
  }

  const tableProps = options.setTableProps ? options.setTableProps() : {};

  const cells = [
    <div
      key={1}
      className={clsx(
        {
          lastColumn: colIndex === 2,
          [classes.root]: true,
          [classes.cellHide]: true,
          [classes.stackedHeader]: true,
          [classes.stackedCommon]:
            options.responsive === 'vertical' ||
            options.responsive === 'stacked' ||
            options.responsive === 'stackedFullWidth',
          [classes.stackedCommonAlways]: options.responsive === 'verticalAlways',
          [classes.cellStackedSmall]:
            options.responsive === 'stacked' ||
            (options.responsive === 'stackedFullWidth' &&
              (tableProps.padding === 'none' || tableProps.size === 'small')),
          [classes.simpleHeader]: options.responsive === 'simple',
          'datatables-noprint': !print,
        },
        className,
      )}>
      {columnHeader}
    </div>,
    <div
      key={2}
      className={clsx(
        {
          [classes.root]: true,
          [classes.stackedCommon]:
            options.responsive === 'vertical' ||
            options.responsive === 'stacked' ||
            options.responsive === 'stackedFullWidth',
          [classes.stackedCommonAlways]: options.responsive === 'verticalAlways',
          [classes.responsiveStackedSmall]:
            options.responsive === 'stacked' ||
            (options.responsive === 'stackedFullWidth' &&
              (tableProps.padding === 'none' || tableProps.size === 'small')),
          [classes.simpleCell]: options.responsive === 'simple',
          'datatables-noprint': !print,
        },
        className,
      )}>
      {typeof children === 'function' ? children(dataIndex, rowIndex) : children}
    </div>,
  ];

  let innerCells;
  if (
    ['standard', 'scrollMaxHeight', 'scrollFullHeight', 'scrollFullHeightFullWidth'].indexOf(
      options.responsive as string,
    ) !== -1
  ) {
    innerCells = cells.slice(1, 2);
  } else {
    innerCells = cells;
  }

  return (
    <TableCell
      {...methods}
      data-colindex={colIndex}
      data-tableid={tableId}
      className={clsx(
        {
          [classes.root]: true,
          [classes.stackedParent]:
            options.responsive === 'vertical' ||
            options.responsive === 'stacked' ||
            options.responsive === 'stackedFullWidth',
          [classes.stackedParentAlways]: options.responsive === 'verticalAlways',
          [classes.responsiveStackedSmallParent]:
            options.responsive === 'vertical' ||
            options.responsive === 'stacked' ||
            (options.responsive === 'stackedFullWidth' &&
              (tableProps.padding === 'none' || tableProps.size === 'small')),
          [classes.simpleCell]: options.responsive === 'simple',
          'datatables-noprint': !print,
        },
        className,
      )}
      {...otherProps}>
      {innerCells}
    </TableCell>
  );
}

export default TableBodyCell;
