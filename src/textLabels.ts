import type { MUIDataTableTextLabels } from './types/text-labels';

const getTextLabels = (): MUIDataTableTextLabels => ({
  body: {
    noMatch: 'Sorry, no matching records found',
    toolTip: 'Sort',
    columnHeaderTooltip: (column: { label: string }) => `Sort for ${column.label}`,
  },
  pagination: {
    next: 'Next Page',
    previous: 'Previous Page',
    rowsPerPage: 'Rows per page:',
    displayRows: 'of',
    jumpToPage: 'Jump to Page:',
  },
  toolbar: {
    search: 'Search',
    downloadCsv: 'Download CSV',
    print: 'Print',
    viewColumns: 'View Columns',
    filterTable: 'Filter Table',
  },
  filter: {
    all: 'All',
    title: 'FILTERS',
    reset: 'RESET',
  },
  viewColumns: {
    title: 'Show Columns',
    titleAria: 'Show/Hide Table Columns',
  },
  selectedRows: {
    text: 'row(s) selected',
    delete: 'Delete',
    deleteAria: 'Delete Selected Rows',
  },
});

export default getTextLabels;
