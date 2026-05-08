import React from 'react';
import clsx from 'clsx';
import { TableRow } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import type { ReactNode } from 'react';
import type { MUIDataTableOptions } from '../types/options';
import type { Theme } from '@mui/material/styles';

const defaultBodyRowStyles = (theme: Theme) => ({
  root: {
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.selected,
    },
    '&.mui-row-selected': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  hoverCursor: { cursor: 'pointer' },
  responsiveStacked: {
    [theme.breakpoints.down('md')]: {
      borderTop: 'solid 2px rgba(0, 0, 0, 0.15)',
      borderBottom: 'solid 2px rgba(0, 0, 0, 0.15)',
      padding: 0,
      margin: 0,
    },
  },
  responsiveSimple: {
    [theme.breakpoints.down('sm')]: {
      borderTop: 'solid 2px rgba(0, 0, 0, 0.15)',
      borderBottom: 'solid 2px rgba(0, 0, 0, 0.15)',
      padding: 0,
      margin: 0,
    },
  },
});

interface TableBodyRowProps {
  options: MUIDataTableOptions;
  onClick?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  rowSelected?: boolean;
  classes?: Record<keyof ReturnType<typeof defaultBodyRowStyles>, string>;
  className?: string;
  isRowSelectable?: boolean;
  children?: ReactNode;
  [key: string]: unknown;
}

class TableBodyRow extends React.Component<TableBodyRowProps> {
  render() {
    const {
      classes = {} as Record<keyof ReturnType<typeof defaultBodyRowStyles>, string>,
      options,
      rowSelected,
      onClick,
      className,
      isRowSelectable,
      ...rest
    } = this.props;

    const methods: Record<string, unknown> = {};
    if (onClick) {
      methods.onClick = onClick;
    }

    return (
      <TableRow
        hover={options.rowHover ? true : false}
        {...methods}
        className={clsx(
          {
            [classes.root]: true,
            [classes.hoverCursor]: (options.selectableRowsOnClick && isRowSelectable) || options.expandableRowsOnClick,
            [classes.responsiveSimple]: options.responsive === 'simple',
            [classes.responsiveStacked]:
              options.responsive === 'vertical' ||
              options.responsive === 'stacked' ||
              options.responsive === 'stackedFullWidth',
            'mui-row-selected': rowSelected,
          },
          className,
        )}
        selected={rowSelected}
        {...rest}>
        {this.props.children}
      </TableRow>
    );
  }
}

export default withStyles(TableBodyRow, defaultBodyRowStyles, { name: 'MUIDataTableBodyRow' });
