import React from 'react';
import { makeStyles } from 'tss-react/mui';
import TableFilterListItem, { type TableFilterListItemProps } from './TableFilterListItem';
import type { ComponentType } from 'react';
import type { MUIDataTableOptions, MUIDataTableFilterList } from '../types/options';

const useStyles = makeStyles({ name: 'MUIDataTableFilterList' })(() => ({
  root: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap' as const,
    margin: '0px 16px 0px 16px',
  },
  chip: {
    margin: '8px 8px 0px 0px',
  },
}));

interface ColumnName {
  name: string;
  filterType: string;
}

interface TableFilterListProps {
  options: MUIDataTableOptions;
  filterList: MUIDataTableFilterList;
  filterUpdate: (
    index: number,
    value: string | string[],
    columnName: string,
    filterType: string,
    customUpdate:
      | ((filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList)
      | null,
    callback: (filterList: MUIDataTableFilterList) => void,
  ) => void;
  filterListRenderers: ((value: string | string[]) => string | string[])[];
  columnNames: ColumnName[];
  serverSideFilterList?: MUIDataTableFilterList | null;
  customFilterListUpdate: (
    | ((filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList)
    | null
  )[];
  ItemComponent?: ComponentType<TableFilterListItemProps>;
}

const TableFilterList = ({
  options,
  filterList,
  filterUpdate,
  filterListRenderers,
  columnNames,
  serverSideFilterList,
  customFilterListUpdate,
  ItemComponent = TableFilterListItem,
}: TableFilterListProps) => {
  const { classes } = useStyles();
  const { serverSide } = options;
  const removeFilter = (
    index: number,
    filterValue: string | string[],
    columnName: string,
    filterType: string,
    customUpdate:
      | ((filterList: MUIDataTableFilterList, filterPos: number, idx: number) => MUIDataTableFilterList)
      | null = null,
  ) => {
    let removedFilter: string | string[] = filterValue;
    if (Array.isArray(removedFilter) && removedFilter.length === 0) {
      removedFilter = filterList[index];
    }

    filterUpdate(index, filterValue, columnName, filterType, customUpdate, (fl) => {
      if (options.onFilterChipClose) {
        options.onFilterChipClose(index, removedFilter as string, fl);
      }
    });
  };

  const customFilterChip = (
    customFilterItem: string,
    index: number,
    customFilterItemIndex: number,
    item: string[],
    isArray: boolean,
  ) => {
    const type = isArray ? (customFilterListUpdate[index] ? 'custom' : 'chip') : columnNames[index].filterType;

    return (
      <ItemComponent
        label={customFilterItem}
        key={customFilterItemIndex}
        onDelete={() =>
          removeFilter(
            index,
            item[customFilterItemIndex] || [],
            columnNames[index].name,
            type,
            customFilterListUpdate[index],
          )
        }
        className={classes.chip}
        itemKey={customFilterItemIndex}
        index={index}
        data={item}
        columnNames={columnNames}
        filterProps={
          options.setFilterChipProps
            ? options.setFilterChipProps(index, columnNames[index].name, item[customFilterItemIndex] || '')
            : {}
        }
      />
    );
  };

  const filterChip = (index: number, data: string, colIndex: number) => (
    <ItemComponent
      label={filterListRenderers[index](data) as string}
      key={colIndex}
      onDelete={() => removeFilter(index, data, columnNames[index].name, 'chip')}
      className={classes.chip}
      itemKey={colIndex}
      index={index}
      data={data}
      columnNames={columnNames}
      filterProps={options.setFilterChipProps ? options.setFilterChipProps(index, columnNames[index].name, data) : {}}
    />
  );

  const getFilterList = (fl: MUIDataTableFilterList) => {
    return fl.map((item, index) => {
      if (columnNames[index].filterType === 'custom' && fl[index].length) {
        const filterListRenderersValue = filterListRenderers[index](item);

        if (Array.isArray(filterListRenderersValue)) {
          return filterListRenderersValue.map((customFilterItem, customFilterItemIndex) =>
            customFilterChip(customFilterItem, index, customFilterItemIndex, item, true),
          );
        } else {
          return customFilterChip(filterListRenderersValue, index, index, item, false);
        }
      }

      return item.map((data, colIndex) => filterChip(index, data, colIndex));
    });
  };

  return (
    <div className={classes.root}>
      {serverSide && serverSideFilterList ? getFilterList(serverSideFilterList) : getFilterList(filterList)}
    </div>
  );
};

export default TableFilterList;
