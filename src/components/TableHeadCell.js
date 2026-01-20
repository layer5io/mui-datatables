import Button from '@mui/material/Button';
import clsx from 'clsx';
import HelpIcon from '@mui/icons-material/Help';
import MuiTooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import { makeStyles } from 'tss-react/mui';
import { useDraggable, useDroppable } from '@dnd-kit/core';

const useStyles = makeStyles({ name: 'MUIDataTableHeadCell' })(theme => ({
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
    textTransform: 'none',
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

const TableHeadCell = ({
  cellHeaderProps = {},
  children,
  colPosition,
  column,
  components = {},
  draggingHook,
  hint,
  index,
  options,
  print,
  setCellRef,
  sort,
  sortDirection,
  tableId,
  toggleSort,
}) => {
  const [sortTooltipOpen, setSortTooltipOpen] = useState(false);
  const [hintTooltipOpen, setHintTooltipOpen] = useState(false);

  const { classes } = useStyles();

  const handleKeyboardSortInput = e => {
    if (e.key === 'Enter') {
      toggleSort(index);
    }

    return false;
  };

  const handleSortClick = () => {
    toggleSort(index);
  };

  const [dragging] = draggingHook ? draggingHook : [];

  const { className, style: cellHeaderStyle, ...otherProps } = cellHeaderProps;
  const Tooltip = components.Tooltip || MuiTooltip;
  const sortActive = sortDirection !== 'none' && sortDirection !== undefined;
  const ariaSortDirection = sortDirection === 'none' ? false : sortDirection;

  const isDraggingEnabled = () => {
    if (!draggingHook) return false;
    return options.draggableColumns && options.draggableColumns.enabled && column.draggable !== false;
  };

  const sortLabelProps = {
    classes: { root: classes.sortLabelRoot },
    tabIndex: -1,
    active: sortActive,
    hideSortIcon: true,
    ...(ariaSortDirection ? { direction: sortDirection } : {}),
  };

  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, isDragging } = useDraggable({
    id: `column-${index}`,
    data: { index },
    disabled: !isDraggingEnabled(),
  });
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `column-${index}`,
    data: { index },
    disabled: !isDraggingEnabled(),
  });
  const dragStyle = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {};
  const cellStyle = {
    ...(cellHeaderStyle || {}),
    ...dragStyle,
    ...(isDragging ? { opacity: 0.4 } : {}),
  };

  const cellClass = clsx({
    [classes.root]: true,
    [classes.fixedHeader]: options.fixedHeader,
    'datatables-noprint': !print,
    [className]: className,
  });

  const showHintTooltip = () => {
    setSortTooltipOpen(false);
    setHintTooltipOpen(true);
  };

  const getTooltipTitle = () => {
    if (dragging) return '';
    if (!options.textLabels) return '';
    return options.textLabels.body.columnHeaderTooltip
      ? options.textLabels.body.columnHeaderTooltip(column)
      : options.textLabels.body.toolTip;
  };

  const closeTooltip = () => {
    setSortTooltipOpen(false);
  };

  return (
    <TableCell
      ref={ref => {
        setNodeRef(ref);
        setDroppableNodeRef(ref);
        setCellRef && setCellRef(index + 1, colPosition + 1, ref);
      }}
      className={cellClass}
      scope={'col'}
      sortDirection={ariaSortDirection}
      data-colindex={index}
      data-tableid={tableId}
      onMouseDown={closeTooltip}
      style={cellStyle}
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
              variant=""
              onKeyUp={handleKeyboardSortInput}
              onClick={handleSortClick}
              className={classes.toolButton}
              data-testid={`headcol-${index}`}
              ref={isDraggingEnabled() ? setActivatorNodeRef : null}
              {...(isDraggingEnabled() ? listeners : {})}
              {...(isDraggingEnabled() ? attributes : {})}>
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
        <div
          className={hint ? classes.sortAction : null}
          ref={isDraggingEnabled() ? setActivatorNodeRef : null}
          {...(isDraggingEnabled() ? listeners : {})}
          {...(isDraggingEnabled() ? attributes : {})}>
          {children}
          {hint && (
            <Tooltip
              title={hint}
              placement={'bottom-end'}
              open={hintTooltipOpen}
              onOpen={() => showHintTooltip()}
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

TableHeadCell.propTypes = {
  /** Options used to describe table */
  options: PropTypes.object.isRequired,
  /** Current sort direction */
  sortDirection: PropTypes.oneOf(['asc', 'desc', 'none']),
  /** Callback to trigger column sort */
  toggleSort: PropTypes.func.isRequired,
  /** Sort enabled / disabled for this column **/
  sort: PropTypes.bool.isRequired,
  /** Hint tooltip text */
  hint: PropTypes.string,
  /** Column displayed in print */
  print: PropTypes.bool.isRequired,
  /** Optional to be used with `textLabels.body.columnHeaderTooltip` */
  column: PropTypes.object,
  /** Injectable component structure **/
  components: PropTypes.object,
};

export default TableHeadCell;
