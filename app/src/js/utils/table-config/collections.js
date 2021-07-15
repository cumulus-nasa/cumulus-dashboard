import React from 'react';
import { get } from 'object-path';
import { Link } from 'react-router-dom';
import { seconds, tally, collectionNameVersion, fromNowWithTooltip, CopyCellPopover, collectionHrefFromNameVersion } from '../format';
import { deleteCollection } from '../../actions';
import { strings } from '../../components/locale';
import BatchDeleteConfirmContent from '../../components/DeleteCollection/BatchDeleteConfirmContent';
import BatchDeleteCompleteContent from '../../components/DeleteCollection/BatchDeleteCompleteContent';
import BatchDeleteWithGranulesContent from '../../components/DeleteCollection/BatchDeleteWithGranulesContent';
import { getPersistentQueryParams, historyPushWithQueryParams } from '../url-helper';
import { numberSort, stringSort } from '../sortable-table';

export const tableColumns = [
  {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ cell: { value, row } }) => { // eslint-disable-line react/prop-types
      const { values } = row; // eslint-disable-line react/prop-types
      const content = <Link to={(location) => ({
        // eslint-disable-next-line react/prop-types
        pathname: collectionHrefFromNameVersion({ name: value, version: values.version }),
        search: getPersistentQueryParams(location)
      })}>{value}</Link>;
      return (
        <CopyCellPopover
          cellContent={content}
          id={`collectionId-${value}-popover`}
          popoverContent={content}
          value={value}
        />
      );
    },
    width: 175
  },
  {
    Header: 'Version',
    accessor: 'version'
  },
  {
    Header: strings.granules,
    accessor: (row) => tally(get(row, 'stats.total')),
    id: 'granules__no-sort',
    sortMethod: (rowA, rowB, columnId) => numberSort(rowA, rowB, columnId),
    width: 100
  },
  {
    Header: 'Completed',
    accessor: (row) => tally(get(row, 'stats.completed')),
    id: 'completed__no-sort',
    sortMethod: (rowA, rowB, columnId) => numberSort(rowA, rowB, columnId),
    width: 100
  },
  {
    Header: 'Running',
    accessor: (row) => tally(get(row, 'stats.running')),
    id: 'running__no-sort',
    sortMethod: (rowA, rowB, columnId) => numberSort(rowA, rowB, columnId),
    width: 100
  },
  {
    Header: 'Failed',
    accessor: (row) => tally(get(row, 'stats.failed')),
    id: 'failed__no-sort',
    sortMethod: (rowA, rowB, columnId) => numberSort(rowA, rowB, columnId),
    width: 100
  },
  {
    Header: 'MMT',
    accessor: 'MMTLink',
    id: 'mmt__no-sort',
    Cell: ({ cell: { value } }) => (value ? <a href={value} target="_blank">MMT</a> : null), // eslint-disable-line react/prop-types
    sortMethod: (rowA, rowB, columnId) => stringSort(rowA, rowB, columnId),
    width: 100
  },
  {
    Header: 'Duration',
    accessor: 'duration',
    Cell: ({ cell: { value } }) => seconds(value)
  },
  {
    Header: 'Timestamp',
    accessor: 'timestamp',
    Cell: ({ cell: { value } }) => fromNowWithTooltip(value),
    id: 'timestamp'
  }
];

const confirmRecover = (d) => `Recover ${d} ${strings.collection}${d > 1 ? 's' : ''}?`;
export const recoverAction = (collections, config) => [{
  text: 'Recover',
  action: config.recover.action,
  state: collections.executed, // this will probably need to be changed
  confirm: confirmRecover
}];

const confirmDelete = (d) => `Delete ${d} ${strings.collection}${d > 1 ? 's' : ''}?`;

export const bulkActions = (collections) => {
  const getModalOptions = ({
    selected = [],
    history,
    isOnModalConfirm,
    isOnModalComplete,
    errorMessage,
    results,
  }) => {
    const modalOptions = {};

    if (!isOnModalConfirm && !isOnModalComplete) {
      modalOptions.children = <BatchDeleteConfirmContent selected={selected} />;
    } else if (isOnModalConfirm && !isOnModalComplete) {
      const selectionsWithGranules = selected.filter((selection) => {
        const { name, version } = collectionNameVersion(selection);
        const collectionItem = collections.list.data.find((item) => item.name === name && item.version === version);
        return get(collectionItem, 'stats.total', 0) > 0;
      });

      if (selectionsWithGranules.length > 0) {
        modalOptions.confirmButtonText = 'Go To Granules';
        modalOptions.confirmButtonClass = 'button__goto';
        modalOptions.cancelButtonText = 'Cancel Request';
        modalOptions.onConfirm = () => {
          historyPushWithQueryParams('/granules');
        };
        modalOptions.children = <BatchDeleteWithGranulesContent selectionsWithGranules={selectionsWithGranules} />;
      }
    } else if (isOnModalComplete) {
      modalOptions.children = <BatchDeleteCompleteContent results={results} error={errorMessage} />;
      // since cancel button closes the modal, let's use that.
      modalOptions.hasConfirmButton = false;
      modalOptions.cancelButtonClass = 'button--green';
      modalOptions.cancelButtonText = 'Close';
    }

    return modalOptions;
  };
  return [
    {
      Component: (
        <Link
          className="button button--green button--add button--small form-group__element"
          to={(location) => ({
            pathname: '/collections/add',
            search: getPersistentQueryParams(location),
          })}
          role="button"
        >
          {strings.add_collection}
        </Link>
      ),
    },
    {
      text: 'Delete Collection(s)',
      action: (collectionId) => {
        const { name, version } = collectionNameVersion(collectionId);
        return deleteCollection(name, version);
      },
      state: collections.deleted,
      confirm: confirmDelete,
      className: 'button button--delete button--small form-group__element',
      getModalOptions
    }
  ];
};
