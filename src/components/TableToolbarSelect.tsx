import React from 'react';
import { Paper, IconButton, Typography, Tooltip as MuiTooltip } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { withStyles } from 'tss-react/mui';
import type { ComponentType } from 'react';
import type { MUIDataTableOptions, MUIDataTableSelectedRows, MUIDataTableDisplayRow } from '../types/options';
import type { Theme } from '@mui/material/styles';

const defaultToolbarSelectStyles = (theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    flex: '1 1 100%',
    display: 'flex',
    position: 'relative' as const,
    zIndex: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '@media print': {
      display: 'none',
    },
  },
  title: {
    paddingLeft: '26px',
  },
  iconButton: {
    marginRight: '24px',
  },
  deleteIcon: {},
});

interface TableToolbarSelectProps {
  options: MUIDataTableOptions;
  selectedRows: MUIDataTableSelectedRows;
  displayData: MUIDataTableDisplayRow[];
  onRowsDelete: () => void;
  selectRowUpdate: (type: string, rows: number[]) => void;
  classes: Record<keyof ReturnType<typeof defaultToolbarSelectStyles>, string>;
  components?: { Tooltip?: ComponentType<unknown> };
}

class TableToolbarSelect extends React.Component<TableToolbarSelectProps> {
  handleCustomSelectedRows = (selectedRows: number[]) => {
    if (!Array.isArray(selectedRows)) {
      throw new TypeError(`"selectedRows" must be an "array", but it's "${typeof selectedRows}"`);
    }

    if (selectedRows.some((row) => typeof row !== 'number')) {
      throw new TypeError(`Array "selectedRows" must contain only numbers`);
    }

    const { options } = this.props;
    if (selectedRows.length > 1 && options.selectableRows === 'single') {
      throw new Error('Can not select more than one row when "selectableRows" is "single"');
    }
    this.props.selectRowUpdate('custom', selectedRows);
  };

  render() {
    const { classes, onRowsDelete, selectedRows, options, displayData, components = {} } = this.props;
    const textLabels = options.textLabels?.selectedRows;
    const Tooltip = (components.Tooltip || MuiTooltip) as typeof MuiTooltip;

    return (
      <Paper className={classes.root}>
        <div>
          <Typography variant="subtitle1" className={classes.title}>
            {selectedRows.data.length} {textLabels?.text}
          </Typography>
        </div>
        {options.customToolbarSelect ? (
          options.customToolbarSelect(selectedRows, displayData, this.handleCustomSelectedRows)
        ) : (
          <Tooltip title={textLabels?.delete || ''}>
            <IconButton className={classes.iconButton} onClick={onRowsDelete} aria-label={textLabels?.deleteAria}>
              <DeleteIcon className={classes.deleteIcon} />
            </IconButton>
          </Tooltip>
        )}
      </Paper>
    );
  }
}

export default withStyles(TableToolbarSelect, defaultToolbarSelectStyles, { name: 'MUIDataTableToolbarSelect' });
