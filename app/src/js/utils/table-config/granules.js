import path from 'path';
import React from 'react';
import { get } from 'object-path';
import Collapsible from 'react-collapsible';
import { Link } from 'react-router-dom';
import noop from 'lodash/noop';
import {
  seconds,
  bool,
  nullValue,
  displayCase,
  collectionLink,
  granuleLink,
  providerLink,
  fromNowWithTooltip,
  CopyCellPopover
} from '../format';
import {
  applyWorkflowToGranuleClearError,
  deleteGranule,
  deleteGranuleClearError,
  reingestGranule,
  reingestGranuleClearError,
  removeGranule,
  removeGranuleClearError,
  removeAndDeleteGranule
} from '../../actions';
import ErrorReport from '../../components/Errors/report';
import { strings } from '../../components/locale';
import SimpleDropdown from '../../components/DropDown/simple-dropdown';
import Bulk from '../../components/Granules/bulk';
import BatchReingestConfirmContent from '../../components/ReingestGranules/BatchReingestConfirmContent';
import BatchReingestCompleteContent from '../../components/ReingestGranules/BatchReingestCompleteContent';
import TextArea from '../../components/TextAreaForm/text-area';
import { getPersistentQueryParams, historyPushWithQueryParams } from '../url-helper';
import GranuleInventory from '../../components/Granules/granule-inventory';

export const groupAction = {
  title: 'Granule Actions',
  description: 'Select the action you would like to perform on the selected granules from the table below',
};

export const tableColumns = [
  {
    Header: 'Status',
    accessor: 'status',
    width: 110,
    Cell: ({ cell: { value } }) => <Link to={(location) => ({ pathname: `/granules/${value}`, search: getPersistentQueryParams(location) })} className={`granule__status granule__status--${value}`}>{displayCase(value)}</Link> // eslint-disable-line react/prop-types
  },
  {
    Header: 'Name',
    accessor: 'granuleId',
    // eslint-disable-next-line react/prop-types
    Cell: ({ cell: { value } }) => <CopyCellPopover cellContent={granuleLink(value)} id={`granuleId-${value}-popover`} popoverContent={granuleLink(value)} value={value} />,
    width: 225
  },
  {
    Header: 'Published',
    accessor: 'published',
    Cell: ({ row: { original: { cmrLink, published } } }) => (// eslint-disable-line react/prop-types
      cmrLink ? <a href={cmrLink} target='_blank'>{bool(published)}</a> : bool(published)
    )
  },
  {
    Header: strings.collection_id,
    accessor: 'collectionId',
    // eslint-disable-next-line react/prop-types
    Cell: ({ cell: { value } }) => <CopyCellPopover cellContent={collectionLink(value)} id={`collectionId-${value}-popover`} popoverContent={collectionLink(value)} value={value} />,
  },
  {
    Header: 'Executions List',
    accessor: 'granuleId',
    Cell: ({ row: { original: {collectionId, granuleId} } }) => (
      <Link to={(location) => ({ pathname: `/executions/executions-list/${encodeURIComponent(collectionId)}/${encodeURIComponent(path.basename(granuleId))}` })}>link</Link>
    ),
    disableSortBy: true,
    width: 90,
    id: 'execution-list'
  },
  {
    Header: 'Provider',
    accessor: 'provider',
    Cell: ({ cell: { value } }) => providerLink(value)
  },
  {
    Header: 'Recovery',
    accessor: (row) => (row.recoveryStatus ? displayCase(row.recoveryStatus) : row.recoveryStatus),
    id: 'recoveryStatus',
    disableSortBy: true,
    width: 110,
  },
  {
    Header: 'Execution',
    accessor: 'execution',
    Cell: ({ cell: { value } }) => ( // eslint-disable-line react/prop-types
      <Link to={(location) => ({ pathname: `/executions/execution/${path.basename(value)}`, search: getPersistentQueryParams(location) })}>link</Link>),
    disableSortBy: true,
    width: 90
  },
  {
    Header: 'Duration',
    accessor: (row) => seconds(row.duration),
    id: 'duration',
    width: 100
  },
  {
    Header: 'Updated',
    accessor: 'timestamp',
    Cell: ({ cell: { value } }) => fromNowWithTooltip(value),
    id: 'timestamp'
  }
];

export const defaultHiddenColumns = ['recoveryStatus'];

export const errorTableColumns = [
  {
    Header: 'Error Type',
    accessor: (row) => get(row, 'error.Error', nullValue),
    id: 'error.Error.keyword',
    width: 100
  },
  {
    Header: 'Error',
    accessor: (row) => get(row, 'error.Cause', nullValue),
    id: 'error',
    Cell: ({ row: { original } }) => ( // eslint-disable-line react/prop-types
      <ErrorReport report={get(original, 'error.Cause', nullValue)} truncate={true} disableScroll={true} />),
    disableSortBy: true,
    width: 175
  },
  {
    Header: 'Granule',
    accessor: 'granuleId',
    Cell: ({ cell: { value } }) => granuleLink(value),
    width: 200
  },
  {
    Header: 'Duration',
    accessor: (row) => seconds(row.duration),
    id: 'duration'
  },
  {
    Header: 'Updated',
    accessor: 'timestamp',
    Cell: ({ cell: { value } }) => fromNowWithTooltip(value),
    id: 'timestamp'
  }
];

export const defaultWorkflowMeta = JSON.stringify({ meta: {} }, null, 2);

export const executeDialog = (config) => (
  <div>
    <SimpleDropdown
      key={config.label}
      label={config.label.toUpperCase()}
      value={config.value}
      options={config.options}
      id={config.label}
      onChange={config.selectHandler}
    />
    <Collapsible trigger='Add Custom Workflow Meta' triggerWhenOpen='Collapse'>
      <form>
        <TextArea
          value={config.initialMeta}
          id={`${config.label}-meta-text-area`}
          onChange={(id, value) => config.metaHandler(value)}
          mode='json'
          minLines={30}
          maxLines={200}
        />
      </form>
    </Collapsible>
  </div>
);

export const simpleDropdownOption = (config) => (
  <SimpleDropdown
    key={config.label}
    label={config.label.toUpperCase()}
    value={config.value}
    options={config.options}
    id={config.label}
    onChange={config.handler}
  />
);

const confirmRecover = (d) => `Recover ${d} granule(s)?`;
export const recoverAction = (granules, config) => ({
  text: 'Recover Granule',
  action: config.recover.action,
  state: granules.executed,
  clearError: applyWorkflowToGranuleClearError,
  confirm: confirmRecover
});

const confirmReingest = (d) => `Reingest ${d} Granule${d > 1 ? 's' : ''}?`;
const confirmApply = (d) => `Run workflow on ${d} granule${d > 1 ? 's' : ''}?`;
const confirmRemove = (d) => `Remove ${d} granule${d > 1 ? 's' : ''} from ${strings.cmr}?`;
const confirmDelete = (d) => `Delete ${d} granule${d > 1 ? 's' : ''}?`;
const confirmRemoveFromCMR = (d) => 'Selection contains granules that are published to CMR which must be removed before deleting. Remove published granules from CMR and delete?';

/**
 * Determine the base context of a collection view
 * @param {Object} path - react router history object
 */
const determineCollectionsBase = (currPath) => {
  if (currPath.includes('granules')) {
    return currPath.replace(/\/granules.*/, '/granules');
  }
  return `${currPath}/granules`;
};

/**
 * Determines next location based on granule success/error and number of
 * successes.
 *   - If there's an error do nothing.
 *   - If there is a single granule visit that granule's detail page
 *   - If there are multiple granules reingested visit the running granules page.
 * Multiple granules will redirect to a base location determined by the current
 * location's pathname.
 *
 * @param {Object} anonymous
 * @param {Object} anonymous.history - Connected router history object.
 * @param {Object} anonymous.error - error object.
 * @param {Object} anonymous.selected - array of selected values.
 * @param {Function} anonymous.closeModal - function to close the Modal component.
 * @returns {Function} function to call on confirm selection.
 */
const setOnConfirm = ({ history, error, selected, closeModal }) => {
  const redirectAndClose = (redirect) => () => {
    historyPushWithQueryParams(redirect);
    if (typeof closeModal === 'function') closeModal();
  };
  const baseRedirect = determineCollectionsBase(history.location.pathname);
  if (error) { return noop; }
  if (selected.length > 1) {
    return redirectAndClose(`${baseRedirect}/processing`);
  }
  return redirectAndClose(`/granules/granule/${selected[0]}`);
};

const granuleModalJourney = ({
  selected = [],
  history,
  isOnModalConfirm,
  isOnModalComplete,
  errorMessage,
  errors,
  results,
  closeModal
}) => {
  const initialEntry = !isOnModalConfirm && !isOnModalComplete;
  const modalOptions = {
    size: 'lg'
  };
  if (initialEntry) {
    modalOptions.children = <BatchReingestConfirmContent selected={selected}/>;
  }
  if (isOnModalComplete) {
    modalOptions.children = <BatchReingestCompleteContent results={results} errorMessage={errorMessage}
      errors={errors} />;
    modalOptions.size = 'lg';
    modalOptions.hasConfirmButton = !errorMessage;
    modalOptions.cancelButtonText = 'Close';
    if (!errorMessage) {
      modalOptions.confirmButtonText = (selected.length > 1) ? 'View Running' : 'View Granule';
      modalOptions.cancelButtonClass = 'button--green';
      modalOptions.confirmButtonClass = 'button__goto';
      modalOptions.onConfirm = setOnConfirm({ history, selected, errorMessage, closeModal });
    }
  }
  return modalOptions;
};

const containsPublishedGranules = (selectedGranules) => {
  let publishedGranules = [];

  if (Array.isArray(selectedGranules) && selectedGranules.length > 0) {
    publishedGranules = selectedGranules.filter((g) => g.published === true);
  }

  if (publishedGranules.length < 1) {
    return false;
  }

  return true;
};

export const reingestAction = (granules) => ({
  text: 'Reingest',
  action: reingestGranule,
  state: granules.reingested,
  clearError: reingestGranuleClearError,
  confirm: confirmReingest,
  className: 'button--reingest',
  getModalOptions: granuleModalJourney
});

export const bulkActions = (granules, config, selectedGranules) => [
  reingestAction(granules),
  {
    text: 'Execute',
    action: config.execute.action,
    state: granules.executed,
    clearError: applyWorkflowToGranuleClearError,
    confirm: confirmApply,
    confirmOptions: config.execute.options,
    className: 'button--execute'
  },
  {
    Component:
      <GranuleInventory
        element='button'
        className='csv__download button button--small button--file button--green form-group__element'
        confirmAction={true}
      />
  },
  {
    text: strings.remove_from_cmr,
    action: removeGranule,
    state: granules.removed,
    clearError: removeGranuleClearError,
    confirm: confirmRemove,
    className: 'button--remove'
  },
  {
    Component:
      <Bulk
        element='button'
        className='button button__bulkgranules button--green button--small form-group__element'
        confirmAction={true}
      />
  },
  {
    text: 'Delete',
    action: containsPublishedGranules(selectedGranules) ? removeAndDeleteGranule : deleteGranule,
    state: granules.deleted,
    clearError: deleteGranuleClearError,
    confirm: containsPublishedGranules(selectedGranules) ? confirmRemoveFromCMR : confirmDelete,
    className: 'button--delete'
  }];

const granules = {
  setOnConfirm,
  historyPushWithQueryParams
};

export default granules;
