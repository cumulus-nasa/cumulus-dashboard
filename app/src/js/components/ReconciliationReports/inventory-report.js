import classNames from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import TableCards from './table-cards';
import {
  searchReconciliationReport,
  clearReconciliationSearch,
  filterReconciliationReport,
  clearReconciliationReportFilter,
  listGranules
} from '../../actions';
import List from '../Table/Table';
import { reshapeReport } from './reshape-report';
import { handleDownloadUrlClick, handleDownloadCsvClick } from '../../utils/download-file';
import Search from '../Search/search';
import Dropdown from '../DropDown/dropdown';
import ReportHeading from './report-heading';
import ListFilters from '../ListActions/ListFilters';

const bucketsForFilter = (allBuckets) => {
  const uniqueBuckets = [...new Set(allBuckets)];
  return uniqueBuckets.map((bucket) => ({
    id: bucket,
    label: bucket,
  }));
};

const InventoryReport = ({
  bulkActions,
  filterBucket,
  filterString,
  groupAction,
  onSelect,
  legend,
  recordData,
  reportName,
  reportUrl
}) => {
  const [activeId, setActiveId] = useState('dynamo');
  const { reportStartTime = null, reportEndTime = null, error = null } =
    recordData || {};
  const {
    internalComparison,
    cumulusVsCmrComparison,
    allBuckets,
  } = reshapeReport(recordData, filterString, filterBucket);
  const reportComparisons = [...internalComparison, ...cumulusVsCmrComparison];
  const activeCardTables = reportComparisons.find(
    (displayObj) => displayObj.id === activeId
  ).tables;

  const downloadOptions = [
    {
      label: 'JSON - Full Report',
      onClick: (e) => handleDownloadUrlClick(e, { url: reportUrl })
    },
    ...activeCardTables.map((table) => ({
      label: `CSV - ${table.name}`,
      onClick: (e) => handleDownloadCsvClick(e, { reportName, table }),
    })),
  ];
  const [expandedState, setExpandedState] = useState(
    reportComparisons.reduce((object, item) => {
      object[item.id] = item.tables.reduce((tableObject, table, index) => {
        // expand the zeroth table in each bucket. collapse all others
        tableObject[table.id] = index === 0;
        return tableObject;
      }, {});
      return object;
    }, {})
  );

  function handleCardClick(e, id) {
    e.preventDefault();
    setActiveId(id);
  }

  function handleToggleClick(e, tableId) {
    e.preventDefault();
    const updatedState = {
      [activeId]: {
        ...expandedState[activeId],
        [tableId]: !expandedState[activeId][tableId],
      },
    };
    setExpandedState({
      ...expandedState,
      ...updatedState,
    });
  }

  function handleExpandClick() {
    const updatedState = cloneDeep(expandedState);
    const expanded = !allCollapsed();
    Object.keys(updatedState).forEach((key) => {
      const obj = updatedState[key];
      Object.keys(obj).forEach((prop) => {
        obj[prop] = expanded;
      });
    });
    setExpandedState(updatedState);
  }

  function allCollapsed() {
    return Object.keys(expandedState[activeId]).every(
      (key) => expandedState[activeId][key] === true
    );
  }

  return (
    <div className="page__component">
      <ReportHeading
        downloadOptions={downloadOptions}
        endTime={reportEndTime}
        error={error}
        name={reportName}
        startTime={reportStartTime}
        type='Inventory'
      />
      <section className="page__section">
        <div className="heading__wrapper--border">
          <h2 className="heading--medium heading--shared-content with-description">
            Bucket Status
          </h2>
        </div>
        <p className="description">
          Click on the bucket to see comparison report details below.
        </p>
        <div className="tablecard--wrapper">
          <TableCards
            titleCaption="Cumulus (DynamoDB) versus S3"
            config={internalComparison}
            onClick={handleCardClick}
            activeCard={activeId}
          />
          <TableCards
            titleCaption="Cumulus versus CMR"
            config={cumulusVsCmrComparison}
            onClick={handleCardClick}
            activeCard={activeId}
          />
        </div>
      </section>

      <section className="page__section">
        <div className="multicard">
          <div className="collapse-link">
            <span className="link" onClick={handleExpandClick} role="button" tabIndex="0">
              {!allCollapsed() ? 'Expand All' : 'Collapse All'}
            </span>
          </div>

          <div className="list-action-wrapper">
            <Search
              action={searchReconciliationReport}
              clear={clearReconciliationSearch}
              label="Search"
              labelKey="granuleId"
              options={[]}
              placeholder="Search"
            />
            <ListFilters>
              <Dropdown
                options={bucketsForFilter(allBuckets)}
                action={filterReconciliationReport}
                clear={clearReconciliationReportFilter}
                paramKey="bucket"
                label="Bucket"
                inputProps={{
                  placeholder: 'All',
                }}
              />
            </ListFilters>
          </div>

          {reportComparisons
            .find((displayObj) => displayObj.id === activeId)
            .tables.map((item, index) => {
              const isExpanded = expandedState[activeId][item.id];
              return (
                <div className="multicard__table" key={index}>
                  <Card.Header
                    className={classNames({
                      multicard__header: true,
                      'multicard__header--expanded': isExpanded,
                    })}
                    key={index}
                    onClick={(e) => handleToggleClick(e, item.id)}
                    aria-controls={item.id}
                  >
                    {item.name}
                    <span
                      className={classNames({
                        'num-title--inverted': !isExpanded,
                        'num-title': isExpanded,
                      })}
                    >
                      {item.data.length}
                    </span>
                    <span
                      className={classNames({
                        'expand-icon': !isExpanded,
                        'collapse-icon': isExpanded,
                      })}
                    ></span>
                  </Card.Header>
                  <Collapse in={isExpanded}>
                    <div id={item.id}>
                      <List
                        action={listGranules}
                        data={item.data}
                        initialHiddenColumns={['']}
                        legend={legend}
                        bulkActions={bulkActions}
                        groupAction={groupAction}
                        onSelect={onSelect}
                        rowId="granuleId"
                        shouldUsePagination={true}
                        tableColumns={item.columns}
                      />
                    </div>
                  </Collapse>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

InventoryReport.propTypes = {
  bulkActions: PropTypes.array,
  filterBucket: PropTypes.string,
  filterString: PropTypes.string,
  groupAction: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
  }),
  legend: PropTypes.node,
  onSelect: PropTypes.func,
  recordData: PropTypes.object,
  reportName: PropTypes.string,
  reportUrl: PropTypes.string
};

export default InventoryReport;
