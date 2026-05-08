import React from 'react';
import { InputBase, MenuItem, Select, Toolbar, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { getPageValue } from '../utils';
import clsx from 'clsx';
import type { SelectChangeEvent } from '@mui/material';
import type { MUIDataTableTextLabels } from '../types/text-labels';

const useStyles = makeStyles({ name: 'MUIDataTableJumpToPage' })((theme) => ({
  root: {
    color: theme.palette.text.primary,
  },
  caption: {
    flexShrink: 0,
  },
  selectRoot: {
    marginRight: 32,
    marginLeft: 8,
  },
  select: {
    paddingTop: 6,
    paddingBottom: 7,
    paddingLeft: 8,
    paddingRight: 24,
    textAlign: 'right' as const,
    textAlignLast: 'right' as const,
    fontSize: theme.typography.pxToRem(14),
  },
  selectIcon: {},
  input: {
    color: 'inherit',
    fontSize: 'inherit',
    flexShrink: 0,
  },
  menuItem: {},
}));

interface JumpToPageProps {
  count: number;
  page: number;
  rowsPerPage: number;
  textLabels: MUIDataTableTextLabels;
  changePage: (page: number) => void;
}

function JumpToPage(props: JumpToPageProps) {
  const { classes } = useStyles();

  const handlePageChange = (event: SelectChangeEvent<number>) => {
    props.changePage(parseInt(event.target.value as unknown as string, 10));
  };

  const { count, textLabels, rowsPerPage, page } = props;

  const textLabel = textLabels.pagination.jumpToPage;

  const pages: number[] = [];
  const lastPage = Math.min(1000, getPageValue(count, rowsPerPage, 1000000));

  for (let ii = 0; ii <= lastPage; ii++) {
    pages.push(ii);
  }
  const MenuItemComponent = MenuItem;

  const myStyle = {
    display: 'flex',
    minHeight: '52px',
    alignItems: 'center',
  };

  return (
    <Toolbar style={myStyle} className={classes.root}>
      <Typography color="inherit" variant="body2" className={classes.caption}>
        {textLabel}
      </Typography>
      <Select
        classes={{ select: classes.select, icon: classes.selectIcon }}
        input={<InputBase className={clsx(classes.input, classes.selectRoot)} />}
        value={getPageValue(count, rowsPerPage, page)}
        onChange={handlePageChange}
        style={{ marginRight: 0 }}>
        {pages.map((pageVal) => (
          <MenuItemComponent className={classes.menuItem} key={pageVal} value={pageVal}>
            {pageVal + 1}
          </MenuItemComponent>
        ))}
      </Select>
    </Toolbar>
  );
}

export default JumpToPage;
