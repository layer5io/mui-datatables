import type { MUIDataTableColumnState } from './types/columns';
import type { MUIDataTableDisplayRow } from './types/data';
import type { MUIDataTableOptions, MUIDataTableSelectedRow } from './types/options';

interface LegacyNavigator extends Navigator {
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
}

function buildMap(rows?: readonly MUIDataTableSelectedRow[] | null): Record<number, boolean> {
  if (!rows || !Array.isArray(rows)) return {};
  return rows.reduce((accum: Record<number, boolean>, row) => {
    if (row != null && row.dataIndex !== undefined) {
      accum[row.dataIndex] = true;
    }
    return accum;
  }, {});
}

function escapeDangerousCSVCharacters<T>(data: T): T | string {
  if (typeof data === 'string') {
    return data.replace(/^\+|^\-|^\=|^\@/g, "'$&");
  }

  return data;
}

function warnDeprecated(warning: string, consoleWarnings: boolean | ((message: string) => void) = true): void {
  const consoleWarn = typeof consoleWarnings === 'function' ? consoleWarnings : console.warn;
  if (consoleWarnings) {
    consoleWarn(`Deprecation Notice:  ${warning}`);
  }
}

function warnInfo(warning: string, consoleWarnings: boolean | ((message: string) => void) = true): void {
  const consoleWarn = typeof consoleWarnings === 'function' ? consoleWarnings : console.warn;
  if (consoleWarnings) {
    consoleWarn(`${warning}`);
  }
}

function getPageValue(count: number, rowsPerPage: number, page: number): number {
  const totalPages = count <= rowsPerPage ? 1 : Math.ceil(count / rowsPerPage);

  return page >= totalPages ? totalPages - 1 : page;
}

function getCollatorComparator(): (a: string, b: string) => number {
  if (typeof Intl !== 'undefined') {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    return collator.compare;
  }

  const fallbackComparator = (a: string, b: string) => a.localeCompare(b);
  return fallbackComparator;
}

function sortCompare(order: 'asc' | 'desc'): (a: { data: unknown }, b: { data: unknown }) => number {
  return (a, b) => {
    if (a == null || b == null) return 0;
    const aData = a.data === null || typeof a.data === 'undefined' ? '' : a.data;
    const bData = b.data === null || typeof b.data === 'undefined' ? '' : b.data;
    return (
      (typeof (aData as string).localeCompare === 'function'
        ? (aData as string).localeCompare(bData as string)
        : (aData as number) - (bData as number)) * (order === 'asc' ? 1 : -1)
    );
  };
}

function buildCSV(
  columns: MUIDataTableColumnState[],
  data: MUIDataTableDisplayRow[],
  options: Pick<MUIDataTableOptions, 'downloadOptions' | 'onDownload'>,
): string | false {
  const replaceDoubleQuoteInString = (columnData: unknown) =>
    typeof columnData === 'string' ? columnData.replace(/\"/g, '""') : columnData;

  const buildHead = (cols: MUIDataTableColumnState[]) => {
    return (
      cols
        .reduce(
          (soFar: string, column) =>
            column.download
              ? soFar +
                '"' +
                escapeDangerousCSVCharacters(replaceDoubleQuoteInString(column.label || column.name) as string) +
                '"' +
                options.downloadOptions!.separator
              : soFar,
          '',
        )
        .slice(0, -1) + '\r\n'
    );
  };
  const CSVHead = buildHead(columns);

  const buildBody = (rows: MUIDataTableDisplayRow[]) => {
    if (!rows.length) return '';
    return rows
      .reduce(
        (soFar: string, row) =>
          soFar +
          '"' +
          row.data
            .filter((_, index) => columns[index].download)
            .map((columnData) => escapeDangerousCSVCharacters(replaceDoubleQuoteInString(columnData)))
            .join('"' + options.downloadOptions!.separator + '"') +
          '"\r\n',
        '',
      )
      .trim();
  };
  const CSVBody = buildBody(data);

  const csv = options.onDownload
    ? options.onDownload(
        buildHead as unknown as (columns: MUIDataTableColumnState[]) => string,
        buildBody as unknown as (data: MUIDataTableDisplayRow[]) => string,
        columns,
        data,
      )
    : `${CSVHead}${CSVBody}`.trim();

  return csv;
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv' });

  const legacyNavigator = navigator as LegacyNavigator;
  if (legacyNavigator && legacyNavigator.msSaveOrOpenBlob) {
    legacyNavigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const dataURI = `data:text/csv;charset=utf-8,${csv}`;

    const URL = window.URL || (window as unknown as { webkitURL: typeof window.URL }).webkitURL;
    let downloadURI = dataURI;
    if (URL && typeof URL.createObjectURL === 'function') {
      try {
        downloadURI = URL.createObjectURL(blob);
      } catch {
        downloadURI = dataURI;
      }
    }

    const link = document.createElement('a');
    link.setAttribute('href', downloadURI);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function createCSVDownload(
  columns: MUIDataTableColumnState[],
  data: MUIDataTableDisplayRow[],
  options: Pick<MUIDataTableOptions, 'downloadOptions' | 'onDownload'>,
  downloadCSVFn: (csv: string, filename: string) => void,
): void {
  const csv = buildCSV(columns, data, options);

  if (options.onDownload && csv === false) {
    return;
  }

  downloadCSVFn(csv as string, options.downloadOptions!.filename!);
}

export {
  buildMap,
  getPageValue,
  getCollatorComparator,
  sortCompare,
  createCSVDownload,
  buildCSV,
  downloadCSV,
  warnDeprecated,
  warnInfo,
  escapeDangerousCSVCharacters,
};
