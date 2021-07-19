import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import {
  getReconciliationReport,
  listWorkflows,
  applyWorkflowToGranule,
  applyRecoveryWorkflowToGranule
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import InventoryReport from './inventory-report';
import GnfReport from './gnf-report';
import Legend from './legend';
import { workflowOptionNames } from '../../selectors';
import {
  bulkActions,
  defaultWorkflowMeta,
  executeDialog,
  groupAction,
  recoverAction
} from '../../utils/table-config/granules';

const ReconciliationReport = ({
  dispatch,
  granules,
  match,
  reconciliationReports = [],
  workflowOptions
}) => {
  const { reconciliationReportName: encodedReportName } = match.params;
  const reconciliationReportName = decodeURIComponent(encodedReportName);
  const { list, map, searchString: filterString } = reconciliationReports;
  const record = map[reconciliationReportName];

  let error = get(record, 'data.error');
  let reportData = get(record, 'data.data', {});
  const reportUrl = get(record, 'data.presignedS3Url');

  // report data is an error message
  if (typeof reportData === 'string' && reportData.startsWith('Error')) {
    const reportError = `${reportData}, please download the report instead`;
    error = error || reportError;
    reportData = {};
  }

  const recordData = { ...reportData, error };
  const { reportType = 'Inventory' } = recordData || {};
  const filterBucket = list.params.bucket;

  const [workflow, setWorkflow] = useState(workflowOptions[0]);
  const [workflowMeta, setWorkflowMeta] = useState(defaultWorkflowMeta);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    dispatch(getReconciliationReport(reconciliationReportName));
  }, [dispatch, reconciliationReportName]);

  useEffect(() => {
    dispatch(listWorkflows());
  }, [dispatch]);

  useEffect(() => {
    setWorkflow(workflowOptions[0]);
  }, [workflowOptions]);

  function generateBulkActions() {
    const config = {
      execute: {
        options: getExecuteOptions(),
        action: applyWorkflow,
      },
      recover: {
        options: getExecuteOptions(),
        action: applyRecoveryWorkflow
      }
    };
    const selectedGranules = selected;
    let actions = bulkActions(granules, config, selectedGranules);
    if (config.enableRecovery) {
      actions = actions.concat(recoverAction(granules, config));
    }
    return actions;
  }

  function selectWorkflow(selectedWorkflow) {
    setWorkflow(selectedWorkflow);
  }

  function applyWorkflow(granuleId) {
    const { meta } = JSON.parse(workflowMeta);
    setWorkflowMeta(defaultWorkflowMeta);
    return applyWorkflowToGranule(granuleId, workflow, meta);
  }

  function applyRecoveryWorkflow(granuleId) {
    return applyRecoveryWorkflowToGranule(granuleId);
  }

  function getExecuteOptions() {
    return [
      executeDialog({
        selectHandler: selectWorkflow,
        label: 'workflow',
        value: workflow,
        options: workflowOptions,
        initialMeta: workflowMeta,
        metaHandler: setWorkflowMeta,
      }),
    ];
  }

  function updateSelection(selection) {
    setSelected(selection);
  }

  if (!record || (record.inflight && !record.data)) {
    return <Loading />;
  }

  return (
    <>
      {
        {
          Inventory: <InventoryReport
            bulkActions={generateBulkActions()}
            filterBucket={filterBucket}
            filterString={filterString}
            groupAction={groupAction}
            legend={<Legend />}
            onSelect={updateSelection}
            recordData={recordData}
            reportName={reconciliationReportName}
            reportUrl={reportUrl}
          />,
          'Granule Not Found': <GnfReport
            bulkActions={generateBulkActions()}
            filterString={filterString}
            groupAction={groupAction}
            legend={<Legend />}
            onSelect={updateSelection}
            recordData={recordData}
            reportName={reconciliationReportName}
            reportUrl={reportUrl}
          />
        }[reportType]
      }
    </>
  );
};

ReconciliationReport.propTypes = {
  dispatch: PropTypes.func,
  granules: PropTypes.object,
  match: PropTypes.object,
  reconciliationReports: PropTypes.object,
  workflowOptions: PropTypes.array
};

export { ReconciliationReport };
export default withRouter(
  connect((state) => ({
    granules: state.granules,
    reconciliationReports: state.reconciliationReports,
    workflowOptions: workflowOptionNames(state)
  }))(ReconciliationReport)
);
