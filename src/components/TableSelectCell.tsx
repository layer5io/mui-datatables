import React from 'react';
import clsx from 'clsx';
import { Checkbox, TableCell } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import ExpandButton from './ExpandButton';
import type { ReactNode, ComponentType } from 'react';
import type { MUIDataTableExpandedRows, MUIDataTableOptions } from '../types/options';

const useStyles = makeStyles({ name: 'MUIDataTableSelectCell' })((theme) => ({
  root: {
    '@media print': {
      display: 'none',
    },
  },
  fixedHeader: {
    position: 'sticky',
    top: '0px',
    zIndex: 100,
  },
  fixedLeft: {
    position: 'sticky',
    left: '0px',
    zIndex: 100,
  },
  icon: {
    cursor: 'pointer',
    transition: 'transform 0.25s',
  },
  expanded: {
    transform: 'rotate(90deg)',
  },
  hide: {
    visibility: 'hidden' as const,
  },
  headerCell: {
    zIndex: 110,
    backgroundColor: theme.palette.background.paper,
  },
  expandDisabled: {},
  checkboxRoot: {},
  checked: {},
  disabled: {},
}));

interface TableSelectCellProps {
  fixedHeader?: boolean;
  fixedSelectColumn?: boolean;
  isHeaderCell?: boolean;
  expandableOn?: boolean;
  selectableOn?: string;
  isRowExpanded?: boolean;
  onExpand?: () => void;
  isRowSelectable?: boolean;
  selectableRowsHeader?: boolean;
  hideExpandButton?: boolean;
  expandableRowsHeader?: boolean;
  expandedRows?: MUIDataTableExpandedRows;
  areAllRowsExpanded?: () => boolean;
  selectableRowsHideCheckboxes?: boolean;
  setHeadCellRef?: (index: number, pos: number, el: HTMLTableCellElement | null) => void;
  dataIndex?: number;
  components?: { Checkbox?: ComponentType<unknown>; ExpandButton?: ComponentType<unknown> };
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: unknown;
}

const TableSelectCell = ({
  fixedHeader,
  fixedSelectColumn,
  isHeaderCell = false,
  expandableOn = false,
  selectableOn = 'none',
  isRowExpanded = false,
  onExpand,
  isRowSelectable,
  selectableRowsHeader,
  hideExpandButton,
  expandableRowsHeader,
  expandedRows,
  areAllRowsExpanded = () => false,
  selectableRowsHideCheckboxes,
  setHeadCellRef,
  dataIndex,
  components = {},
  ...otherProps
}: TableSelectCellProps) => {
  const { classes } = useStyles();
  const CheckboxComponent = components.Checkbox || Checkbox;
  const ExpandButtonComponent = components.ExpandButton || ExpandButton;

  if (expandableOn === false && (selectableOn === 'none' || selectableRowsHideCheckboxes === true)) {
    return null;
  }

  const cellClass = clsx({
    [classes.root]: true,
    [classes.fixedHeader]: fixedHeader && isHeaderCell,
    [classes.fixedLeft]: fixedSelectColumn,
    [classes.headerCell]: isHeaderCell,
  });

  const buttonClass = clsx({
    [classes.expandDisabled]: hideExpandButton,
  });

  const iconClass = clsx({
    [classes.icon]: true,
    [classes.hide]: isHeaderCell && !expandableRowsHeader,
    [classes.expanded]: isRowExpanded || (isHeaderCell && areAllRowsExpanded()),
  });

  const iconIndeterminateClass = clsx({
    [classes.icon]: true,
    [classes.hide]: isHeaderCell && !expandableRowsHeader,
  });

  const refProp: Record<string, unknown> = {};
  if (setHeadCellRef) {
    refProp.ref = (el: HTMLTableCellElement | null) => {
      setHeadCellRef(0, 0, el);
    };
  }

  const renderCheckBox = () => {
    if (isHeaderCell && (selectableOn !== 'multiple' || selectableRowsHeader === false)) {
      return null;
    }
    return (
      <CheckboxComponent
        classes={{
          root: classes.checkboxRoot,
          checked: classes.checked,
          disabled: classes.disabled,
        }}
        data-description={isHeaderCell ? 'row-select-header' : 'row-select'}
        data-index={dataIndex || null}
        color="primary"
        disabled={!isRowSelectable}
        {...otherProps}
      />
    );
  };

  return (
    <TableCell className={cellClass} padding="checkbox" {...refProp}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {expandableOn && (
          <ExpandButtonComponent
            isHeaderCell={isHeaderCell}
            areAllRowsExpanded={areAllRowsExpanded}
            expandedRows={expandedRows ?? { data: [], lookup: {} }}
            onExpand={onExpand ?? (() => {})}
            expandableRowsHeader={expandableRowsHeader ?? false}
            buttonClass={buttonClass}
            iconIndeterminateClass={iconIndeterminateClass}
            iconClass={iconClass}
          />
        )}
        {selectableOn !== 'none' && selectableRowsHideCheckboxes !== true && renderCheckBox()}
      </div>
    </TableCell>
  );
};

export default TableSelectCell;
