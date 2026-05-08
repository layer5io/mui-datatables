import React from 'react';
import { Grow, TextField, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { withStyles } from 'tss-react/mui';
import type { MUIDataTableOptions } from '../types/options';

function debounce<T extends (...args: never[]) => void>(func: T, wait: number, immediate?: boolean) {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function (this: unknown, ...args: Parameters<T>) {
    const context = this;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const defaultStyles = (theme: { palette: { text: { secondary: string }; error: { main: string } } }) => ({
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
});

interface DebounceSearchProps {
  classes: Record<keyof ReturnType<typeof defaultStyles>, string>;
  options: MUIDataTableOptions;
  onSearch: (value: string) => void;
  onHide: () => void;
  searchText: string | null;
  debounceWait: number;
}

class _DebounceTableSearch extends React.Component<DebounceSearchProps> {
  searchField: HTMLInputElement | null = null;

  handleTextChangeWrapper = (debouncedSearch: (value: string) => void) => {
    return function (event: React.ChangeEvent<HTMLInputElement>) {
      debouncedSearch(event.target.value);
    };
  };

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, false);
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode === 27) {
      this.props.onHide();
    }
  };

  render() {
    const { classes, options, onHide, searchText, debounceWait } = this.props;

    const debouncedSearch = debounce((value: string) => {
      this.props.onSearch(value);
    }, debounceWait);

    const clearIconVisibility = options.searchAlwaysOpen ? 'hidden' : 'visible';

    return (
      <Grow appear in={true} timeout={300}>
        <div className={classes.main}>
          <SearchIcon className={classes.searchIcon} />
          <TextField
            variant={'standard'}
            className={classes.searchText}
            autoFocus={true}
            slotProps={{
              htmlInput: {
                'data-testid': options.textLabels?.toolbar?.search,
                'aria-label': options.textLabels?.toolbar?.search,
              },
            }}
            defaultValue={searchText}
            onChange={this.handleTextChangeWrapper(debouncedSearch)}
            fullWidth={true}
            inputRef={(el: HTMLInputElement | null) => {
              this.searchField = el;
            }}
            placeholder={options.searchPlaceholder}
            {...(options.searchProps ? options.searchProps : {})}
          />
          <IconButton className={classes.clearIcon} style={{ visibility: clearIconVisibility }} onClick={onHide}>
            <ClearIcon />
          </IconButton>
        </div>
      </Grow>
    );
  }
}

const DebounceTableSearch = withStyles(_DebounceTableSearch, defaultStyles, {
  name: 'MUIDataTableSearch',
}) as unknown as React.ComponentType<Omit<DebounceSearchProps, 'classes'>>;
export { DebounceTableSearch };

export function debounceSearchRender(debounceWait = 200) {
  return (
    searchText: string,
    handleSearch: (text: string) => void,
    hideSearch: () => void,
    options: MUIDataTableOptions,
  ) => {
    return (
      <DebounceTableSearch
        searchText={searchText}
        onSearch={handleSearch}
        onHide={hideSearch}
        options={options}
        debounceWait={debounceWait}
      />
    );
  };
}
