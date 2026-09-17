import React from 'react';
import { Grow, TextField, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import type { MUIDataTableOptions } from '../types/options';

const useStyles = makeStyles({ name: 'MUIDataTableSearch' })((theme) => ({
  main: {
    display: 'flex',
    flex: '1 0 auto',
    alignItems: 'center',
  },
  searchIcon: {
    color: theme.palette.text.secondary,
    marginRight: '8px',
  },
  searchText: {
    flex: '0.8 0',
  },
  clearIcon: {
    '&:hover': {
      color: theme.palette.error.main,
    },
  },
}));

interface TableSearchProps {
  options: MUIDataTableOptions;
  searchText: string | null;
  onSearch: (value: string) => void;
  onHide: () => void;
}

const TableSearch = ({ options, searchText, onSearch, onHide }: TableSearchProps) => {
  const { classes } = useStyles();

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onHide();
    }
  };

  const clearIconVisibility = options.searchAlwaysOpen ? 'hidden' : 'visible';

  return (
    <Grow appear in={true} timeout={300}>
      <div className={classes.main}>
        <SearchIcon className={classes.searchIcon} />
        <TextField
          className={classes.searchText}
          autoFocus={true}
          variant={'standard'}
          slotProps={{
            htmlInput: {
              'aria-label': options.textLabels?.toolbar?.search,
              'data-testid': options.textLabels?.toolbar?.search,
            },
          }}
          value={searchText || ''}
          onKeyDown={onKeyDown}
          onChange={handleTextChange}
          fullWidth={true}
          placeholder={options.searchPlaceholder}
          {...(options.searchProps ? options.searchProps : {})}
        />
        <IconButton className={classes.clearIcon} style={{ visibility: clearIconVisibility }} onClick={onHide}>
          <ClearIcon />
        </IconButton>
      </div>
    </Grow>
  );
};

export default TableSearch;
