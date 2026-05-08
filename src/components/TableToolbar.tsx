import React from 'react';
import { Typography, Toolbar, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import {
  Search as SearchIcon,
  CloudDownload as DownloadIcon,
  Print as PrintIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import Popover from './Popover';
import TableFilter from './TableFilter';
import TableViewCol from './TableViewCol';
import TableSearch from './TableSearch';
import { useReactToPrint } from 'react-to-print';
import find from 'lodash.find';
import { withStyles } from 'tss-react/mui';
import { createCSVDownload, downloadCSV } from '../utils';
import type { ComponentType, ReactNode } from 'react';
import type { MUIDataTableColumnState } from '../types/columns';
import type { MUIDataTableOptions, MUIDataTableDisplayRow, MUIDataTableFilterList } from '../types/options';
import type { Theme } from '@mui/material/styles';

export const defaultToolbarStyles = (theme: Theme) => ({
  root: {
    '@media print': { display: 'none' },
    [theme.breakpoints.down('sm')]: {
      display: 'block',
      '@media print': { display: 'none !important' },
    },
  },
  fullWidthRoot: {},
  leftContainer: {
    flex: '1 1 auto',
    [theme.breakpoints.down('md')]: {
      padding: '8px 0px',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '8px 0px 0px 0px',
    },
  },
  fullWidthLeftContainer: {
    flex: '1 1 auto',
  },
  actions: {
    flex: '1 1 auto',
    textAlign: 'right' as const,
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center' as const,
    },
  },
  fullWidthActions: {
    flex: '1 1 auto',
    textAlign: 'right' as const,
  },
  titleRoot: {},
  titleText: {
    [theme.breakpoints.down('md')]: {
      fontSize: '16px',
    },
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center' as const,
    },
  },
  fullWidthTitleText: {
    textAlign: 'left' as const,
  },
  spacer: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  icon: {
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  iconActive: {
    color: theme.palette.primary.main,
  },
  filterPaper: {
    maxWidth: '50%',
  },
  filterCloseIcon: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    zIndex: 100,
  },
  searchIcon: {
    display: 'inline-flex',
    marginTop: '10px',
    marginRight: '8px',
  },
});

const RESPONSIVE_FULL_WIDTH_NAME = 'scrollFullHeightFullWidth';

interface PrintButtonProps {
  getContent: () => HTMLElement | null;
  classes: Record<string, string>;
  IconComponent: ComponentType;
  options: MUIDataTableOptions;
  print: string;
  Tooltip: typeof MuiTooltip;
}

const PrintButton = ({ getContent, classes, IconComponent, options, print, Tooltip }: PrintButtonProps) => {
  const contentRef = React.useRef<HTMLElement | null>(null);
  const handlePrint = useReactToPrint({ contentRef });
  const onClick = () => {
    contentRef.current = getContent();
    handlePrint();
  };
  return (
    <Tooltip title={print}>
      <IconButton
        data-testid={print + '-iconButton'}
        aria-label={print}
        disabled={options.print === 'disabled'}
        onClick={onClick}
        classes={{ root: classes.icon }}>
        <IconComponent />
      </IconButton>
    </Tooltip>
  );
};

interface TableToolbarProps {
  columns: MUIDataTableColumnState[];
  columnOrder?: number[];
  data: MUIDataTableDisplayRow[];
  displayData: MUIDataTableDisplayRow[];
  filterData: string[][];
  filterList: MUIDataTableFilterList;
  filterUpdate: (
    index: number,
    value: string | string[],
    column: string | MUIDataTableColumnState,
    type: string,
  ) => void;
  options: MUIDataTableOptions;
  resetFilters: () => void;
  searchClose: () => void;
  searchText?: string | null;
  searchTextUpdate: (value: string) => void;
  setTableAction: (action: string) => void;
  tableRef: () => HTMLElement | null;
  title: ReactNode;
  toggleViewColumn: (index: number) => void;
  updateColumns: (columns: MUIDataTableColumnState[]) => void;
  updateFilterByType: (
    filterList: MUIDataTableFilterList,
    index: number,
    value: string | string[],
    type: string,
    customUpdate: unknown,
  ) => void;
  classes: Record<keyof ReturnType<typeof defaultToolbarStyles>, string>;
  components?: {
    Tooltip?: ComponentType<unknown>;
    TableViewCol?: ComponentType<unknown>;
    TableFilter?: ComponentType<unknown>;
    icons?: Record<string, ComponentType>;
  };
}

interface TableToolbarState {
  iconActive: string | null | undefined;
  showSearch: boolean;
  searchText: string | null;
  hideFilterPopover?: boolean;
  prevIconActive?: string | null;
}

class TableToolbar extends React.Component<TableToolbarProps, TableToolbarState> {
  searchButton: HTMLButtonElement | null = null;

  state: TableToolbarState = {
    iconActive: null,
    showSearch: Boolean(
      this.props.searchText ||
      this.props.options.searchText ||
      this.props.options.searchOpen ||
      this.props.options.searchAlwaysOpen,
    ),
    searchText: this.props.searchText || null,
  };

  componentDidUpdate(prevProps: TableToolbarProps) {
    if (this.props.searchText !== prevProps.searchText) {
      this.setState({ searchText: this.props.searchText || null });
    }
  }

  handleCSVDownload = () => {
    const { data, displayData, columns, options, columnOrder } = this.props;
    let dataToDownload: { index?: number; data: unknown[] }[] = [];
    let columnsToDownload: MUIDataTableColumnState[] = [];
    let columnOrderCopy = Array.isArray(columnOrder) ? columnOrder.slice(0) : [];

    if (columnOrderCopy.length === 0) {
      columnOrderCopy = columns.map((_item, idx) => idx);
    }

    data.forEach((row) => {
      const newRow: { index: number; data: unknown[] } = { index: row.index, data: [] };
      columnOrderCopy.forEach((idx) => {
        newRow.data.push(row.data[idx]);
      });
      dataToDownload.push(newRow);
    });

    columnOrderCopy.forEach((idx) => {
      columnsToDownload.push(columns[idx]);
    });

    if (options.downloadOptions && options.downloadOptions.filterOptions) {
      if (options.downloadOptions.filterOptions.useDisplayedRowsOnly) {
        const filteredDataToDownload = displayData.map((row, index) => {
          let i = -1;
          (row as unknown as Record<string, unknown>).index = index;
          return {
            data: row.data.map((column) => {
              i += 1;
              let val =
                typeof column === 'object' && column !== null && !Array.isArray(column)
                  ? find(data, (d) => d.index === row.dataIndex)?.data[i]
                  : column;
              val = typeof val === 'function' ? find(data, (d) => d.index === row.dataIndex)?.data[i] : val;
              return val;
            }),
          };
        });

        dataToDownload = [];
        filteredDataToDownload.forEach((row) => {
          const newRow: { index?: number; data: unknown[] } = { data: [] };
          columnOrderCopy.forEach((idx) => {
            newRow.data.push(row.data[idx]);
          });
          dataToDownload.push(newRow);
        });
      }

      if (options.downloadOptions.filterOptions.useDisplayedColumnsOnly) {
        columnsToDownload = columnsToDownload.filter((_) => _.display === 'true');
        dataToDownload = dataToDownload.map((row) => {
          row.data = row.data.filter((_, index) => columns[columnOrderCopy[index]].display === 'true');
          return row;
        });
      }
    }
    createCSVDownload(columnsToDownload, dataToDownload as unknown as MUIDataTableDisplayRow[], options, downloadCSV);
  };

  setActiveIcon = (iconName?: string) => {
    this.setState(
      (prevState) => ({
        showSearch: this.isSearchShown(iconName),
        iconActive: iconName,
        prevIconActive: prevState.iconActive,
      }),
      () => {
        const { iconActive, prevIconActive } = this.state;
        if (iconActive === 'filter') {
          this.props.setTableAction('onFilterDialogOpen');
          if (this.props.options.onFilterDialogOpen) {
            this.props.options.onFilterDialogOpen();
          }
        }
        if (iconActive === undefined && prevIconActive === 'filter') {
          this.props.setTableAction('onFilterDialogClose');
          if (this.props.options.onFilterDialogClose) {
            this.props.options.onFilterDialogClose();
          }
        }
      },
    );
  };

  isSearchShown = (iconName?: string): boolean => {
    if (this.props.options.searchAlwaysOpen) return true;
    let nextVal = false;
    if (this.state.showSearch) {
      if (this.state.searchText) {
        nextVal = true;
      } else {
        const { onSearchClose } = this.props.options;
        this.props.setTableAction('onSearchClose');
        if (onSearchClose) onSearchClose();
        nextVal = false;
      }
    } else if (iconName === 'search') {
      nextVal = this.showSearch();
    }
    return nextVal;
  };

  getActiveIcon = (styles: Record<string, string>, iconName: string): string => {
    let isActive = this.state.iconActive === iconName;
    if (iconName === 'search') {
      const { showSearch, searchText } = this.state;
      isActive = isActive || showSearch || !!searchText;
    }
    return isActive ? styles.iconActive : styles.icon;
  };

  showSearch = (): boolean => {
    this.props.setTableAction('onSearchOpen');
    this.props.options.onSearchOpen && this.props.options.onSearchOpen();
    return true;
  };

  hideSearch = () => {
    const { onSearchClose } = this.props.options;
    this.props.setTableAction('onSearchClose');
    if (onSearchClose) onSearchClose();
    this.props.searchClose();
    this.setState(() => ({ iconActive: null, showSearch: false, searchText: null }));
  };

  handleSearch = (value: string) => {
    this.setState({ searchText: value });
    this.props.searchTextUpdate(value);
  };

  handleSearchIconClick = () => {
    const { showSearch, searchText } = this.state;
    if (showSearch && !searchText) {
      this.hideSearch();
    } else {
      this.setActiveIcon('search');
    }
  };

  render() {
    const {
      data,
      options,
      classes,
      columns,
      filterData,
      filterList,
      filterUpdate,
      resetFilters,
      toggleViewColumn,
      updateColumns,
      title,
      components = {},
      updateFilterByType,
    } = this.props;
    const { icons = {} } = components;

    const Tooltip = (components.Tooltip || MuiTooltip) as typeof MuiTooltip;
    const TableViewColComponent = (components.TableViewCol || TableViewCol) as ComponentType<Record<string, unknown>>;
    const TableFilterComponent = (components.TableFilter || TableFilter) as ComponentType<Record<string, unknown>>;
    const SearchIconComponent = icons.SearchIcon || SearchIcon;
    const DownloadIconComponent = icons.DownloadIcon || DownloadIcon;
    const PrintIconComponent = icons.PrintIcon || PrintIcon;
    const ViewColumnIconComponent = icons.ViewColumnIcon || ViewColumnIcon;
    const FilterIconComponent = icons.FilterIcon || FilterIcon;
    const {
      search = '',
      downloadCsv = '',
      print = '',
      viewColumns = '',
      filterTable = '',
    } = options.textLabels?.toolbar ?? {};
    const { showSearch, searchText } = this.state;

    const filterPopoverExit = () => {
      this.setState({ hideFilterPopover: false });
      this.setActiveIcon();
    };

    const closeFilterPopover = () => {
      this.setState({ hideFilterPopover: true });
    };

    return (
      <Toolbar
        className={options.responsive !== RESPONSIVE_FULL_WIDTH_NAME ? classes.root : classes.fullWidthRoot}
        role={'toolbar'}
        aria-label={'Table Toolbar'}>
        <div
          className={
            options.responsive !== RESPONSIVE_FULL_WIDTH_NAME ? classes.leftContainer : classes.fullWidthLeftContainer
          }>
          {showSearch === true ? (
            options.customSearchRender && typeof options.customSearchRender === 'function' ? (
              (
                options.customSearchRender as (
                  st: string | null,
                  hs: (v: string) => void,
                  h: () => void,
                  o: MUIDataTableOptions,
                ) => ReactNode
              )(searchText, this.handleSearch, this.hideSearch, options)
            ) : (
              <TableSearch
                searchText={searchText}
                onSearch={this.handleSearch}
                onHide={this.hideSearch}
                options={options}
              />
            )
          ) : typeof title !== 'string' ? (
            title
          ) : (
            <div className={classes.titleRoot} aria-hidden={'true'}>
              <Typography
                variant="h6"
                className={
                  options.responsive !== RESPONSIVE_FULL_WIDTH_NAME ? classes.titleText : classes.fullWidthTitleText
                }>
                {title}
              </Typography>
            </div>
          )}
        </div>
        <div className={options.responsive !== RESPONSIVE_FULL_WIDTH_NAME ? classes.actions : classes.fullWidthActions}>
          {!(options.search === false || options.search === 'false' || options.searchAlwaysOpen === true) && (
            <Tooltip title={search} disableFocusListener>
              <IconButton
                aria-label={search}
                data-testid={search + '-iconButton'}
                ref={(el) => {
                  this.searchButton = el;
                }}
                classes={{ root: this.getActiveIcon(classes, 'search') }}
                disabled={options.search === 'disabled'}
                onClick={this.handleSearchIconClick}>
                <SearchIconComponent />
              </IconButton>
            </Tooltip>
          )}
          {!(options.download === false || options.download === 'false') && (
            <Tooltip title={downloadCsv}>
              <IconButton
                data-testid={downloadCsv.replace(/\s/g, '') + '-iconButton'}
                aria-label={downloadCsv}
                classes={{ root: classes.icon }}
                disabled={options.download === 'disabled'}
                onClick={this.handleCSVDownload}>
                <DownloadIconComponent />
              </IconButton>
            </Tooltip>
          )}
          {!(options.print === false || options.print === 'false') && (
            <span>
              <PrintButton
                getContent={() => this.props.tableRef()}
                classes={classes}
                IconComponent={PrintIconComponent}
                options={options}
                print={print}
                Tooltip={Tooltip}
              />
            </span>
          )}
          {!(options.viewColumns === false || options.viewColumns === 'false') && (
            <Popover
              refExit={() => this.setActiveIcon()}
              classes={{ closeIcon: classes.filterCloseIcon }}
              hide={options.viewColumns === 'disabled'}
              trigger={
                <Tooltip title={viewColumns} disableFocusListener>
                  <IconButton
                    data-testid={viewColumns + '-iconButton'}
                    aria-label={viewColumns}
                    classes={{ root: this.getActiveIcon(classes, 'viewcolumns') }}
                    disabled={options.viewColumns === 'disabled'}
                    onClick={() => this.setActiveIcon('viewcolumns')}>
                    <ViewColumnIconComponent />
                  </IconButton>
                </Tooltip>
              }
              content={
                <TableViewColComponent
                  data={data}
                  columns={columns}
                  options={options}
                  onColumnUpdate={toggleViewColumn}
                  updateColumns={updateColumns}
                  components={components}
                />
              }
            />
          )}
          {!(options.filter === false || options.filter === 'false') && (
            <Popover
              refExit={filterPopoverExit}
              hide={this.state.hideFilterPopover || options.filter === 'disabled'}
              classes={{ paper: classes.filterPaper, closeIcon: classes.filterCloseIcon }}
              trigger={
                <Tooltip title={filterTable} disableFocusListener>
                  <IconButton
                    data-testid={filterTable + '-iconButton'}
                    aria-label={filterTable}
                    classes={{ root: this.getActiveIcon(classes, 'filter') }}
                    disabled={options.filter === 'disabled'}
                    onClick={() => this.setActiveIcon('filter')}>
                    <FilterIconComponent />
                  </IconButton>
                </Tooltip>
              }
              content={
                <TableFilterComponent
                  customFooter={options.customFilterDialogFooter}
                  columns={columns}
                  options={options}
                  filterList={filterList}
                  filterData={filterData}
                  onFilterUpdate={filterUpdate}
                  onFilterReset={resetFilters}
                  handleClose={closeFilterPopover}
                  updateFilterByType={updateFilterByType}
                  components={components}
                />
              }
            />
          )}
          {options.customToolbar && options.customToolbar({ displayData: this.props.displayData })}
        </div>
      </Toolbar>
    );
  }
}

export default withStyles(TableToolbar, defaultToolbarStyles, { name: 'MUIDataTableToolbar' });
