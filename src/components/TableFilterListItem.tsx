import React from 'react';
import { Chip } from '@mui/material';
import clsx from 'clsx';
import type { ComponentProps } from 'react';
import type { TableFilterListItemProps } from '../types/components';

const TableFilterListItem = ({ label, onDelete, className, filterProps }: TableFilterListItemProps) => {
  const mergedProps = (filterProps || {}) as ComponentProps<typeof Chip>;
  let mergedClassName = className;
  if (typeof mergedProps.className === 'string') {
    mergedClassName = clsx(className, mergedProps.className);
  }
  return <Chip label={label} onDelete={onDelete} className={mergedClassName} {...mergedProps} />;
};

export default TableFilterListItem;
