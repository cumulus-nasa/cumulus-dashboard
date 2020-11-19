import React, {
  useMemo,
  useEffect,
  forwardRef,
  useRef
} from 'react';
import PropTypes from 'prop-types';
import { useTable, useResizeColumns, useFlexLayout, useSortBy, useRowSelect, usePagination } from 'react-table';
import SimplePagination from '../Pagination/simple-pagination';
import TableFilters from '../Table/TableFilters';

/**
 * IndeterminateCheckbox
 * @description Component for rendering the header and column checkboxs when canSelect is true
 * Taken from react-table examples
 */
const IndeterminateCheckbox = forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <input type="checkbox" ref={resolvedRef} {...rest} />
    );
  }
);

IndeterminateCheckbox.propTypes = {
  indeterminate: PropTypes.any,
  onChange: PropTypes.func
};

const SortableTable = ({
  canSelect,
  changeSortProps,
  clearSelected,
  data = [],
  initialHiddenColumns = [],
  onSelect,
  rowId,
  shouldManualSort = false,
  shouldUsePagination = false,
  tableColumns = [],
}) => {
  const defaultColumn = useMemo(
    () => ({
      Cell: ({ value = '' }) => value,
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 125, // width is used for both the flex-basis and flex-grow
      maxWidth: 350, // maxWidth is only used as a limit for resizing
    }),
    []
  );

  const {
    getTableProps,
    rows,
    prepareRow,
    headerGroups,
    state: {
      selectedRowIds,
      sortBy,
      pageIndex,
      hiddenColumns
    },
    toggleAllRowsSelected,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    toggleHideColumn
  } = useTable(
    {
      data,
      columns: tableColumns,
      defaultColumn,
      getRowId: (row, relativeIndex) => (typeof rowId === 'function' ? rowId(row) : row[rowId] || relativeIndex),
      autoResetSelectedRows: false,
      autoResetSortBy: false,
      manualSortBy: shouldManualSort,
      // if we want to use the pagination hook, then pagination should not be manual
      manualPagination: !shouldUsePagination,
      initialState: {
        hiddenColumns: initialHiddenColumns
      }
    },
    useFlexLayout, // this allows table to have dynamic layouts outside of standard table markup
    useResizeColumns, // this allows for resizing columns
    useSortBy, // this allows for sorting
    usePagination,
    useRowSelect, // this allows for checkbox in table
    (hooks) => {
      if (canSelect) {
        hooks.visibleColumns.push((columns) => [
          {
            id: 'selection',
            Header: ({ getToggleAllRowsSelectedProps }) => ( // eslint-disable-line react/prop-types
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            ),
            Cell: ({ row }) => ( // eslint-disable-line react/prop-types
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /> // eslint-disable-line react/prop-types
            ),
            minWidth: 61,
            width: 61,
            maxWidth: 61
          },
          ...columns
        ]);
      }
    }
  );

  const tableRows = page || rows;
  const includeFilters = initialHiddenColumns.length > 0;

  useEffect(() => {
    if (clearSelected) {
      toggleAllRowsSelected(false);
    }
  }, [clearSelected, toggleAllRowsSelected]);

  useEffect(() => {
    const selected = Object.keys(selectedRowIds).reduce((selectedRows, key) => {
      if (selectedRowIds[key]) {
        selectedRows.push(key);
      }
      return selectedRows;
    }, []);

    if (typeof onSelect === 'function') {
      onSelect(selected);
    }
  }, [selectedRowIds, onSelect]);

  useEffect(() => {
    if (typeof changeSortProps === 'function') {
      changeSortProps(sortBy);
    }
  }, [changeSortProps, sortBy]);

  return (
    <div className='table--wrapper'>
      {includeFilters &&
        <TableFilters columns={tableColumns} onChange={toggleHideColumn} hiddenColumns={hiddenColumns} />
      }
      <form>
        <div className='table' {...getTableProps()}>
          <div className='thead'>
            <div className='tr'>
              {headerGroups.map((headerGroup) => (
                <div {...headerGroup.getHeaderGroupProps()} className="tr">
                  {headerGroup.headers.map((column) => {
                    let columnClassName = '';
                    if (column.canSort) {
                      let columnClassNameSuffix;

                      if (column.isSortedDesc === true) {
                        columnClassNameSuffix = '--desc';
                      } else if (column.isSortedDesc === false) {
                        columnClassNameSuffix = '--asc';
                      } else {
                        columnClassNameSuffix = '';
                      }

                      columnClassName = `table__sort${columnClassNameSuffix}`;
                    }
                    return (
                      <div {...column.getHeaderProps()} className='th'>
                        <div {...column.getSortByToggleProps()} className={columnClassName}>
                          {column.render('Header')}
                        </div>
                        <div
                          {...column.getResizerProps()}
                          className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className='tbody'>
            {tableRows.map((row, i) => {
              prepareRow(row);
              return (
                <div className='tr' data-value={row.id} {...row.getRowProps()} key={i}>
                  {row.cells.map((cell, cellIndex) => {
                    const primaryIdx = canSelect ? 1 : 0;
                    return (
                      <React.Fragment key={cellIndex}>
                        <div
                          className={`td ${cellIndex === primaryIdx ? 'table__main-asset' : ''}`}
                          {...cell.getCellProps()}
                          key={cellIndex}
                        >
                          {cell.render('Cell')}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {shouldUsePagination &&
          <SimplePagination
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            pageCount={pageCount}
            gotoPage={gotoPage}
            nextPage={nextPage}
            previousPage={previousPage}
            pageOptions={pageOptions}
            pageIndex={pageIndex}
            dataCount={data.length}
          />}
      </form>
    </div>
  );
};

SortableTable.propTypes = {
  canSelect: PropTypes.bool,
  changeSortProps: PropTypes.func,
  clearSelected: PropTypes.bool,
  data: PropTypes.array,
  initialHiddenColumns: PropTypes.array,
  onSelect: PropTypes.func,
  rowId: PropTypes.any,
  shouldManualSort: PropTypes.bool,
  shouldUsePagination: PropTypes.bool,
  tableColumns: PropTypes.array,
};

export default SortableTable;
