import React from 'react';
import { IconButton } from '@mui/material';
import { KeyboardArrowRight as KeyboardArrowRightIcon, Remove as RemoveIcon } from '@mui/icons-material';
import type { MUIDataTableExpandedRows } from '../types/options';

interface ExpandButtonProps {
  areAllRowsExpanded: () => boolean;
  buttonClass: string;
  expandableRowsHeader: boolean;
  expandedRows: MUIDataTableExpandedRows;
  iconClass: string;
  iconIndeterminateClass: string;
  isHeaderCell: boolean;
  onExpand: () => void;
}

const ExpandButton = ({
  areAllRowsExpanded,
  buttonClass,
  expandableRowsHeader,
  expandedRows,
  iconClass,
  iconIndeterminateClass,
  isHeaderCell,
  onExpand,
}: ExpandButtonProps) => {
  return (
    <>
      {isHeaderCell && !areAllRowsExpanded() && expandedRows.data.length > 0 ? (
        <IconButton
          onClick={onExpand}
          style={{ padding: 0 }}
          disabled={expandableRowsHeader === false}
          className={buttonClass}>
          <RemoveIcon id="expandable-button" className={iconIndeterminateClass} />
        </IconButton>
      ) : (
        <IconButton
          onClick={onExpand}
          style={{ padding: 0 }}
          disabled={expandableRowsHeader === false}
          className={buttonClass}>
          <KeyboardArrowRightIcon id="expandable-button" className={iconClass} />
        </IconButton>
      )}
    </>
  );
};

export default ExpandButton;
