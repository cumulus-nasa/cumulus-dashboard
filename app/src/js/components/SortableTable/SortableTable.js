import React, {
  useMemo,
  useEffect,
  useState,
  createRef
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import {
  defaultOrderByFn,
  useTable,
  useResizeColumns,
  useFlexLayout,
  useSortBy,
  useRowSelect,
  usePagination
} from 'react-table';
import SimplePagination from '../Pagination/simple-pagination';
import TableFilters from '../Table/TableFilters';
import ListFilters from '../ListActions/ListFilters';
import { checkInView, getColumnWidth, IndeterminateCheckbox, sortData } from '../../utils/sortable-table';

const SortableTable = ({
  canSelect,
  changeSortProps,
  clearSelected,
  data = [],
  getToggleColumnOptions,
  initialHiddenColumns = [],
  initialSortId,
  legend,
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
      minWidth: 50, // minWidth is only used as a limit for resizing
      width: 125, // width is used for both the flex-basis and flex-grow
    }),
    []
  );
  const [fitColumn, setFitColumn] = useState({});
  const [leftScrollButtonVisibility, setLeftScrollButtonVisibility] = useState({ display: 'none', opacity: 0 });
  const [rightScrollButtonVisibility, setRightScrollButtonVisibility] = useState({ display: 'none', opacity: 0 });

  let rightScrollInterval;
  let leftScrollInterval;

  const {
    getTableProps,
    rows,
    flatRows,
    allColumns,
    orderByFn = defaultOrderByFn,
    manualSortBy,
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
    setHiddenColumns,
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
        hiddenColumns: initialHiddenColumns,
        sortBy: initialSortId ? [{ id: initialSortId, desc: true }] : [],
      },
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
            disableResizing: true,
            width: 50,
            Header: ({ getToggleAllRowsSelectedProps }) => ( // eslint-disable-line react/prop-types
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            ),
            Cell: ({ row }) => ( // eslint-disable-line react/prop-types
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /> // eslint-disable-line react/prop-types
            ),
          },
          ...columns
        ]);
      }
    }
  );

  const tableRows = page || rows;

  // useMemo code modified from https://github.com/tannerlinsley/react-table/blob/master/src/plugin-hooks/useSortBy.js#L272
  const [sortedRows] = React.useMemo(() => {
    // we only want to do this if we're already manually sorting but have columns we want to sort client side
    if (!manualSortBy || !sortBy.length) {
      return [tableRows, flatRows];
    }

    const sortedFlatRows = [];

    // Filter out sortBys that correspond to non existing columns
    const availableSortBy = sortBy.filter((sort) => allColumns
      .find((col) => (typeof col.sortMethod === 'function') && (col.id === sort.id)));

    //  if we don't find any columns with a defined sortMethod, let's bail
    if (!availableSortBy.length) {
      return [tableRows, flatRows];
    }

    const sortedData = sortData({ allColumns, availableSortBy, orderByFn, rows: tableRows, sortedFlatRows });

    return [sortedData, sortedFlatRows];
  }, [manualSortBy, sortBy, tableRows, flatRows, allColumns, orderByFn]);

  const includeFilters = typeof getToggleColumnOptions !== 'function';

  const tableRef = createRef();
  const scrollLeftButton = createRef();
  const scrollRightButton = createRef();

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
    const availableSortBy = sortBy.filter((sortColumn) => !sortColumn.id.includes('__no-sort'));
    if (typeof changeSortProps === 'function') {
      changeSortProps(availableSortBy);
    }
  }, [changeSortProps, sortBy]);

  useEffect(() => {
    if (typeof getToggleColumnOptions === 'function') {
      getToggleColumnOptions({
        setHiddenColumns,
        hiddenColumns
      });
    }
  }, [getToggleColumnOptions, hiddenColumns, setHiddenColumns]);

  function resetHiddenColumns() {
    setHiddenColumns(initialHiddenColumns);
  }

  function handleDoubleClick(id, header, originalWidth) {
    setFitColumn({
      ...fitColumn,
      [id]: getColumnWidth(tableRows, id, header, originalWidth)
    });
  }

  function handleMouseDown(e, id, onMouseDown) {
    if (fitColumn[id]) {
      const newFitColumn = omit(fitColumn, [id]);
      setFitColumn(newFitColumn);
    }
    onMouseDown(e);
  }

  function handleTableColumnMouseEnter(event) {
    if ((event.target.className.includes('th') || event.target.className.includes('td')) && !checkInView(tableRef.current, event.target.nextSibling, false)) {
      showScrollRightButton(event);
    }

    if ((event.target.className.includes('th') || event.target.className.includes('td')) && !checkInView(tableRef.current, event.target.previousSibling, false)) {
      showScrollLeftButton(event);
    }
  }

  function handleTableColumnMouseLeave(event) {
    if ((event.target.className.includes('th') || event.target.className.includes('td')) && !checkInView(tableRef.current, event.target.nextSibling, false)) {
      hideScrollRightButton();
    }

    if ((event.target.className.includes('th') || event.target.className.includes('td')) && !checkInView(tableRef.current, event.target.previousSibling, false)) {
      hideScrollLeftButton();
    }
  }

  function scrollTableRight() {
    if (tableRef !== null && tableRef.current !== null) {
      tableRef.current.scrollLeft += 20;
    }
  }

  function startScrollTableRight() {
    rightScrollInterval = setInterval(scrollTableRight, 1);
  }

  function stopScrollTableRight() {
    clearInterval(rightScrollInterval);
  }

  function scrollTableLeft() {
    if (tableRef !== null && tableRef.current !== null) {
      tableRef.current.scrollLeft -= 20;
    }
  }

  function startScrollTableLeft() {
    leftScrollInterval = setInterval(scrollTableLeft, 1);
  }

  function stopScrollTableLeft() {
    clearInterval(leftScrollInterval);
  }

  function handleLeftScrollButtonOnMouseLeave() {
    hideScrollLeftButton();
    clearInterval(leftScrollInterval);
  }

  function handleRightScrollbuttonOnMouseLeave() {
    hideScrollRightButton();
    clearInterval(rightScrollInterval);
  }

  function showScrollLeftButton(event) {
    setLeftScrollButtonVisibility({ display: 'flex', opacity: leftScrollButtonVisibility.opacity });
    setTimeout(() => {
      setLeftScrollButtonVisibility({ display: 'flex', opacity: 1 });
    }, 10);
  }

  function hideScrollLeftButton() {
    if (leftScrollButtonVisibility.opacity === 1) {
      setLeftScrollButtonVisibility({ display: leftScrollButtonVisibility.display, opacity: 0 });
      setLeftScrollButtonVisibility({ display: 'none', opacity: 0 });
    }
  }

  function showScrollRightButton(event) {
    setRightScrollButtonVisibility({ display: 'flex', opacity: rightScrollButtonVisibility.opacity });
    setTimeout(() => {
      setRightScrollButtonVisibility({ display: 'flex', opacity: 1 });
    }, 10);
  }

  function hideScrollRightButton() {
    if (rightScrollButtonVisibility.opacity === 1) {
      setRightScrollButtonVisibility({ display: rightScrollButtonVisibility.display, opacity: 0 });
      setRightScrollButtonVisibility({ display: 'none', opacity: 0 });
    }
  }

  return (
    <div className='table--wrapper'>
      {(includeFilters || legend) &&
        <ListFilters>
          {includeFilters &&
            <TableFilters columns={tableColumns}
              setHiddenColumns={setHiddenColumns}
              hiddenColumns={hiddenColumns}
              resetHiddenColumns={resetHiddenColumns}
              initialHiddenColumns={initialHiddenColumns} />
          }
          {legend}
        </ListFilters>}
      <div className='table' {...getTableProps()} ref={tableRef}>
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

                  const wrapperClassNames = classNames(
                    'th',
                    {
                      'no-resize': !column.canResize,
                    }
                  );

                  const { style, ...restHeaderProps } = column.getHeaderProps();
                  const columnWidth = fitColumn[column.id];
                  if (columnWidth) style.width = `${columnWidth}px`;

                  const {
                    onMouseDown,
                    role,
                    ...restResizerProps
                  } = column.getResizerProps ? column.getResizerProps() : {};

                  return (
                    <div {...restHeaderProps}
                      className={wrapperClassNames}
                      style={style}
                      onMouseEnter={(e) => handleTableColumnMouseEnter(e)}
                      onMouseLeave={(e) => handleTableColumnMouseLeave(e)}
                    >
                      <span {...column.getSortByToggleProps()} className={columnClassName}>
                        {column.render('Header')}
                      </span>
                      {column.canResize && <div
                        {...restResizerProps}
                        role={role}
                        title='Double click to expand'
                        onMouseDown={(e) => handleMouseDown(e, column.id, onMouseDown)}
                        onDoubleClick={() => handleDoubleClick(column.id, column.Header, column.originalWidth)}
                        className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
                      />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className='tbody'>
          {sortedRows.map((row, i) => {
            prepareRow(row);
            return (
              <div className='tr' data-value={row.id} {...row.getRowProps()} key={i}>
                {row.cells.map((cell, cellIndex) => {
                  const primaryIdx = canSelect ? 1 : 0;
                  const wrapperClassNames = classNames(
                    'td',
                    {
                      'table__main-asset': cellIndex === primaryIdx,
                      table__checkbox: canSelect && cellIndex === 0,
                    }
                  );

                  const { style, ...restCellProps } = cell.getCellProps();
                  const columnWidth = fitColumn[cell.column.id];
                  if (columnWidth) style.width = `${columnWidth}px`;

                  return (
                    <div
                      className={wrapperClassNames}
                      {...restCellProps}
                      style={style}
                      key={cellIndex}
                      onMouseEnter={(e) => handleTableColumnMouseEnter(e)}
                      onMouseLeave={(e) => handleTableColumnMouseLeave(e)}
                    >
                      {cell.render('Cell')}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div role="button"
        ref={scrollLeftButton}
        tabIndex={0}
        className="scrollButton scrollButtonLeft"
        style={{
          opacity: leftScrollButtonVisibility.opacity,
          display: leftScrollButtonVisibility.display
        }}
        onMouseDown={() => startScrollTableLeft()}
        onMouseUp={() => stopScrollTableLeft()}
        onMouseEnter={() => showScrollLeftButton()}
        onMouseLeave={() => handleLeftScrollButtonOnMouseLeave()}>
        <div><i className="fa fa-arrow-circle-left fa-2x"></i></div>
        <div>SCROLL</div>
      </div>
      <div role="button"
        ref={scrollRightButton}
        tabIndex={0}
        className="scrollButton scrollButtonRight"
        style={{
          opacity: rightScrollButtonVisibility.opacity,
          display: rightScrollButtonVisibility.display
        }}
        onMouseDown={() => startScrollTableRight()}
        onMouseUp={() => stopScrollTableRight()}
        onMouseEnter={() => showScrollRightButton()}
        onMouseLeave={() => handleRightScrollbuttonOnMouseLeave()}>
        <div><i className="fa fa-arrow-circle-right fa-2x"></i></div>
        <div>SCROLL</div>
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
    </div>
  );
};

SortableTable.propTypes = {
  canSelect: PropTypes.bool,
  changeSortProps: PropTypes.func,
  clearSelected: PropTypes.bool,
  data: PropTypes.array,
  getToggleColumnOptions: PropTypes.func,
  initialHiddenColumns: PropTypes.array,
  initialSortId: PropTypes.string,
  legend: PropTypes.node,
  onSelect: PropTypes.func,
  rowId: PropTypes.any,
  shouldManualSort: PropTypes.bool,
  shouldUsePagination: PropTypes.bool,
  tableColumns: PropTypes.array,
};

export default SortableTable;
