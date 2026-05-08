import React from 'react';
import { Checkbox, Typography, FormControl, FormGroup, FormControlLabel } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import type { ComponentType } from 'react';
import type { MUIDataTableColumnState } from '../types/columns';
import type { MUIDataTableOptions } from '../types/options';

const useStyles = makeStyles({ name: 'MUIDataTableViewCol' })((theme) => ({
  root: {
    padding: '16px 24px 16px 24px',
    fontFamily: 'Roboto',
  },
  title: {
    marginLeft: '-7px',
    marginRight: '24px',
    fontSize: '14px',
    color: theme.palette.text.secondary,
    textAlign: 'left' as const,
    fontWeight: 500,
  },
  formGroup: {
    marginTop: '8px',
  },
  formControl: {},
  checkbox: {
    padding: '0px',
    width: '32px',
    height: '32px',
  },
  checkboxRoot: {},
  checked: {},
  label: {
    fontSize: '15px',
    marginLeft: '8px',
    color: theme.palette.text.primary,
  },
}));

interface TableViewColProps {
  columns: MUIDataTableColumnState[];
  options: MUIDataTableOptions;
  components?: { Checkbox?: ComponentType<unknown> };
  onColumnUpdate: (index: number) => void;
  updateColumns?: (columns: MUIDataTableColumnState[]) => void;
}

const TableViewCol = ({ columns, options, components = {}, onColumnUpdate }: TableViewColProps) => {
  const { classes } = useStyles();
  const textLabels = options.textLabels?.viewColumns;
  const CheckboxComponent = components.Checkbox || Checkbox;

  const handleColChange = (index: number) => {
    onColumnUpdate(index);
  };

  return (
    <FormControl component={'fieldset'} className={classes.root} aria-label={textLabels?.titleAria}>
      <Typography variant="caption" className={classes.title}>
        {textLabels?.title}
      </Typography>
      <FormGroup className={classes.formGroup}>
        {columns.map((column, index) => {
          return (
            column.display !== 'excluded' &&
            column.viewColumns !== false && (
              <FormControlLabel
                key={index}
                classes={{
                  root: classes.formControl,
                  label: classes.label,
                }}
                control={
                  <CheckboxComponent
                    color="primary"
                    data-description="table-view-col"
                    className={classes.checkbox}
                    classes={{
                      root: classes.checkboxRoot,
                      checked: classes.checked,
                    }}
                    onChange={() => handleColChange(index)}
                    checked={column.display === 'true'}
                    value={column.name}
                  />
                }
                label={column.label}
              />
            )
          );
        })}
      </FormGroup>
    </FormControl>
  );
};

export default TableViewCol;
