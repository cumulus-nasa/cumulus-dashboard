import React, { useEffect, forwardRef, useRef } from 'react';
import PropTypes from 'prop-types';

export const getColumnWidth = (rows, accessor, headerText, originalWidth) => {
  const maxWidth = 400;
  const magicSpacing = 10;
  const cellLength = Math.max(
    ...rows.map(
      (row) => (`${row.values[accessor]}` || '').length * magicSpacing
    ),
    headerText.length * magicSpacing,
    originalWidth
  );
  return Math.min(maxWidth, cellLength);
};

/** Code below modifed from https://github.com/tannerlinsley/react-table */

/**
 * IndeterminateCheckbox
 * @description Component for rendering the header and column checkboxs when canSelect is true
 * Taken from react-table examples
 */
export const IndeterminateCheckbox = forwardRef(
  ({ indeterminate, title, ...rest }, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        aria-label={title}
        title={title}
        {...rest}
      />
    );
  }
);

IndeterminateCheckbox.propTypes = {
  indeterminate: PropTypes.any,
  onChange: PropTypes.func,
  title: PropTypes.string,
};

export function checkInView(container, element, partial) {
  if (!container || !element) {
    return true;
  }

  // Get container properties
  const cLeft = container.scrollLeft;
  const cRight = cLeft + container.clientWidth;

  // Get element properties
  const eLeft = element.offsetLeft - container.offsetLeft;
  const eRight = eLeft + element.clientWidth;

  // Check if in view
  const isTotal = eLeft >= cLeft && eRight <= cRight;
  const isPartial =
    partial &&
    ((eLeft < cLeft && eRight > cLeft) || (eRight > cRight && eLeft < cRight));

  // Return outcome
  return isTotal || isPartial;
}

export const sortData = ({
  allColumns,
  availableSortBy,
  orderByFn,
  rows,
  sortedFlatRows,
}) => {
  // Use the orderByFn to compose multiple sortBy's together.
  // This will also perform a stable sorting using the row index
  // if needed.
  const sortedData = orderByFn(
    rows,
    availableSortBy.map((sort) => {
      // Support custom sorting methods for each column
      const column = allColumns.find((d) => d.id === sort.id);

      if (!column) {
        throw new Error(
          `React-Table: Could not find a column with id: ${sort.id} while sorting`
        );
      }

      const { sortMethod } = column;
      // Return the correct sortFn.
      // This function should always return in ascending order
      return (a, b) => sortMethod(a, b, sort.id, sort.desc);
    }),
    // Map the directions
    availableSortBy.map((sort) => {
      // Detect and use the sortInverted option
      const column = allColumns.find((d) => d.id === sort.id);

      if (column && column.sortInverted) {
        return sort.desc;
      }

      return !sort.desc;
    })
  );

  // If there are sub-rows, sort them
  sortedData.forEach((row) => {
    sortedFlatRows.push(row);
    if (!row.subRows || row.subRows.length === 0) {
      return;
    }
    row.subRows = sortData(row.subRows);
  });

  return sortedData;
};

/** Modified from https://github.com/tannerlinsley/react-table/blob/master/src/sortTypes.js */

const reSplitAlphaNumeric = /([0-9]+)/gm;

// Mixed sorting is slow, but very inclusive of many edge cases.
// It handles numbers, mixed alphanumeric combinations, and even
// null, undefined, and Infinity
export const alphanumericSort = (rowA, rowB, columnId) => {
  let [a, b] = getRowValuesByColumnID(rowA, rowB, columnId);

  // Force to strings (or "" for unsupported types)
  a = toString(a);
  b = toString(b);

  // Split on number groups, but keep the delimiter
  // Then remove falsey split values
  a = a.split(reSplitAlphaNumeric).filter(Boolean);
  b = b.split(reSplitAlphaNumeric).filter(Boolean);

  // While
  while (a.length && b.length) {
    const aa = a.shift();
    const bb = b.shift();

    const an = parseInt(aa, 10);
    const bn = parseInt(bb, 10);

    const combo = [an, bn].sort();

    // Both are string
    if (Number.isNaN(combo[0])) {
      if (aa > bb) {
        return 1;
      }
      if (bb > aa) {
        return -1;
      }
    }

    // One is a string, one is a number
    if (Number.isNaN(combo[1])) {
      return Number.isNaN(an) ? -1 : 1;
    }

    // Both are numbers
    if (an > bn) {
      return 1;
    }
    if (bn > an) {
      return -1;
    }
  }

  return a.length - b.length;
};
export function datetimeSort(rowA, rowB, columnId) {
  let [a, b] = getRowValuesByColumnID(rowA, rowB, columnId);

  a = a.getTime();
  b = b.getTime();

  return compareBasic(a, b);
}

export function basicSort(rowA, rowB, columnId) {
  const [a, b] = getRowValuesByColumnID(rowA, rowB, columnId);

  return compareBasic(a, b);
}

export function stringSort(rowA, rowB, columnId) {
  let [a = '', b = ''] = getRowValuesByColumnID(rowA, rowB, columnId);

  a = a.split('').filter(Boolean);
  b = b.split('').filter(Boolean);

  while (a.length && b.length) {
    const aa = a.shift();
    const bb = b.shift();

    const alower = aa.toLowerCase();
    const blower = bb.toLowerCase();

    // Case insensitive comparison until characters match
    if (alower > blower) {
      return 1;
    }
    if (blower > alower) {
      return -1;
    }
    // If lowercase characters are identical
    if (aa > bb) {
      return 1;
    }
    if (bb > aa) {
      return -1;
    }
  }

  return a.length - b.length;
}

export function numberSort(rowA, rowB, columnId) {
  let [a, b] = getRowValuesByColumnID(rowA, rowB, columnId);

  const replaceNonNumeric = /[^0-9.]/gi;

  a = Number(String(a).replace(replaceNonNumeric, ''));
  b = Number(String(b).replace(replaceNonNumeric, ''));

  return compareBasic(a, b);
}

// Utils

function compareBasic(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

function getRowValuesByColumnID(row1, row2, columnId) {
  return [row1.values[columnId], row2.values[columnId]];
}

function toString(a) {
  if (typeof a === 'number') {
    if (Number.isNaN(a) || a === Infinity || a === -Infinity) {
      return '';
    }
    return String(a);
  }
  if (typeof a === 'string') {
    return a;
  }
  return '';
}
