import React from 'react';
import { Chip } from '@mui/material';
import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

export interface TableFilterListItemProps {
  label: ReactNode;
  onDelete: () => void;
  className: string;
  filterProps?: Record<string, unknown>;
  itemKey?: number;
  index?: number;
  data?: string | string[];
  columnNames?: Array<{ name: string; filterType: string }>;
}

const TableFilterListItem = ({ label, onDelete, className, filterProps }: TableFilterListItemProps) => {
  const mergedProps = (filterProps || {}) as ComponentProps<typeof Chip>;
  let mergedClassName = className;
  if (typeof mergedProps.className === 'string') {
    mergedClassName = clsx(className, mergedProps.className);
  }
  return <Chip label={label} onDelete={onDelete} className={mergedClassName} {...mergedProps} />;
};

export default TableFilterListItem;
