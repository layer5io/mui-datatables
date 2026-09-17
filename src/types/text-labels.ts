export interface MUIDataTableTextLabels {
  body: MUIDataTableBodyTextLabels;
  pagination: MUIDataTablePaginationTextLabels;
  toolbar: MUIDataTableToolbarTextLabels;
  filter: MUIDataTableFilterTextLabels;
  viewColumns: MUIDataTableViewColumnsTextLabels;
  selectedRows: MUIDataTableSelectedRowsTextLabels;
}

export interface MUIDataTableBodyTextLabels {
  noMatch: string | React.ReactNode;
  toolTip: string;
  columnHeaderTooltip: (column: { label: string }) => string;
}

export interface MUIDataTablePaginationTextLabels {
  next: string;
  previous: string;
  rowsPerPage: string;
  displayRows: string;
  jumpToPage: string;
}

export interface MUIDataTableToolbarTextLabels {
  search: string;
  downloadCsv: string;
  print: string;
  viewColumns: string;
  filterTable: string;
}

export interface MUIDataTableFilterTextLabels {
  all: string;
  title: string;
  reset: string;
}

export interface MUIDataTableViewColumnsTextLabels {
  title: string;
  titleAria: string;
}

export interface MUIDataTableSelectedRowsTextLabels {
  text: string;
  delete: string;
  deleteAria: string;
}
