'use strict';
/* eslint node/no-deprecated-api: 0 */
import classnames from 'classnames';
import path from 'path';
import PropTypes from 'prop-types';
import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import url from 'url';
import { getReconciliationReport } from '../../actions';
import {
  tableColumnsCollections,
  tableColumnsFiles,
  tableColumnsGranules,
  tableColumnsS3Files,
} from '../../utils/table-config/reconciliation-reports';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';
import Loading from '../LoadingIndicator/loading-indicator';
import SortableTable from '../SortableTable/SortableTable';
import TableCards from './table-cards';

const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/',
  },
  {
    label: 'Reports Overview',
    href: '/reconciliation-reports',
  },
  {
    label: 'Report',
    active: true,
  },
];

const ReportStateHeader = ({ reportState, startDate, endDate }) => {
  const displayStartDate = startDate
    ? new Date(startDate).toLocaleDateString()
    : 'missing';
  const displayEndDate = endDate
    ? new Date(startDate).toLocaleDateString()
    : 'missing';
  return (
    <>
      <b>Date Range:</b> {displayStartDate} to {displayEndDate} <b>state:</b>{' '}
      <span
        className={`status__badge status__badge__${
          reportState === 'PASSED' ? 'passed' : 'conflict'
        }`}
      >
        {' '}
        {reportState}{' '}
      </span>
    </>
  );
};

ReportStateHeader.propTypes = {
  reportState: PropTypes.string,
  endDate: PropTypes.string,
  startDate: PropTypes.string,
};

const parseFileObject = (d) => {
  const parsed = url.parse(d.uri);
  return {
    granuleId: d.granuleId,
    filename: path.basename(parsed.pathname),
    bucket: parsed.hostname,
    path: parsed.href,
  };
};

const getFilesSummary = ({ onlyInDynamoDb = [], onlyInS3 = [] }) => {
  const filesInS3 = onlyInS3.map((d) => {
    const parsed = url.parse(d);
    return {
      filename: path.basename(parsed.pathname),
      bucket: parsed.hostname,
      path: parsed.href,
    };
  });

  const filesInDynamoDb = onlyInDynamoDb.map(parseFileObject);

  return { filesInS3, filesInDynamoDb };
};

const getCollectionsSummary = ({ onlyInCumulus = [], onlyInCmr = [] }) => {
  const getCollectionName = (collectionName) => ({ name: collectionName });
  const collectionsInCumulus = onlyInCumulus.map(getCollectionName);
  const collectionsInCmr = onlyInCmr.map(getCollectionName);
  return { collectionsInCumulus, collectionsInCmr };
};

const getGranulesSummary = ({ onlyInCumulus = [], onlyInCmr = [] }) => {
  const granulesInCumulus = onlyInCumulus;
  const granulesInCmr = onlyInCmr.map((granule) => ({
    granuleId: granule.GranuleUR,
  }));
  return { granulesInCumulus, granulesInCmr };
};

const getGranuleFilesSummary = ({ onlyInCumulus = [], onlyInCmr = [] }) => {
  const granuleFilesOnlyInCumulus = onlyInCumulus.map(parseFileObject);

  const granuleFilesOnlyInCmr = onlyInCmr.map((d) => {
    const parsed = url.parse(d.URL);
    const bucket = parsed.hostname.split('.')[0];
    return {
      granuleId: d.GranuleUR,
      filename: path.basename(parsed.pathname),
      bucket,
      path: `s3://${bucket}${parsed.pathname}`,
    };
  });

  return { granuleFilesOnlyInCumulus, granuleFilesOnlyInCmr };
};

/**
 * returns PASSED or CONFLICT based on reconcilation report data.
 * @param {Object} cardConfig - reshaped report data
 */
const reportState = (cardConfig) => {
  const anyBad = cardConfig.some((item) =>
    item.tables.some((table) => table.data.length)
  );
  return anyBad ? 'CONFLICT' : 'PASSED';
};

class ReconciliationReport extends React.Component {
  constructor() {
    super();
    this.navigateBack = this.navigateBack.bind(this);
    this.handleCardClick = this.handleCardClick.bind(this);
    this.state = {
      activeIdx: 'dynamo',
    };
  }

  componentDidMount() {
    const { dispatch, match, reconciliationReports } = this.props;
    const { reconciliationReportName } = match.params;
    if (!reconciliationReports.map[reconciliationReportName]) {
      dispatch(getReconciliationReport(reconciliationReportName));
    }
  }

  navigateBack() {
    this.props.history.push('/reconciliations');
  }

  handleCardClick(e, id) {
    e.preventDefault();
    this.setState({ activeIdx: id });
  }

  render() {
    const { reconciliationReports } = this.props;
    const { reconciliationReportName } = this.props.match.params;
    const { activeIdx } = this.state;

    // TODO [MHS, 2020-05-27] Maybe consider reshaping the data in the reducer and removing some of the logic from here.
    const record = reconciliationReports.map[reconciliationReportName];
    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    }

    let filesInS3 = [];
    let filesInDynamoDb = [];

    let granuleFilesOnlyInCumulus = [];
    let granuleFilesOnlyInCmr = [];

    let collectionsInCumulus = [];
    let collectionsInCmr = [];

    let granulesInCumulus = [];
    let granulesInCmr = [];

    let error;
    const { reportStartTime = null, reportEndTime = null } = record.data;

    if (record.data) {
      const {
        filesInCumulus: internalCompareFiles = {},
        filesInCumulusCmr: compareFiles = {},
        collectionsInCumulusCmr: compareCollections = {},
        granulesInCumulusCmr: compareGranules = {},
      } = record.data;

      ({ filesInS3, filesInDynamoDb } = getFilesSummary(internalCompareFiles));

      ({ collectionsInCumulus, collectionsInCmr } = getCollectionsSummary(
        compareCollections
      ));

      ({ granulesInCumulus, granulesInCmr } = getGranulesSummary(
        compareGranules
      ));

      ({
        granuleFilesOnlyInCumulus,
        granuleFilesOnlyInCmr,
      } = getGranuleFilesSummary(compareFiles));

      error = record.data.error;
    }

    const cardConfig = [
      {
        id: 'dynamo',
        name: 'DynamoDB',
        tables: [
          {
            name: 'Files in DynamoDb not found in S3',
            data: filesInDynamoDb,
            columns: tableColumnsFiles,
          },
        ],
      },
      {
        id: 's3',
        name: 'S3',
        tables: [
          {
            name: 'Files in S3 not found in DynamoDb',
            data: filesInS3,
            columns: tableColumnsS3Files,
          },
        ],
      },
      {
        id: 'cumulusOnly',
        name: 'Cumulus',
        tables: [
          {
            id: 'cumulusCollections',
            name: 'Collections only in Cumulus',
            data: collectionsInCumulus,
            columns: tableColumnsCollections,
          },
          {
            id: 'cumulusGranules',
            name: 'Granules only in Cumulus',
            data: granulesInCumulus,
            columns: tableColumnsGranules,
          },
          {
            id: 'cumulusFiles',
            name: 'Files only in Cumulus',
            data: granuleFilesOnlyInCumulus,
            columns: tableColumnsFiles,
          },
        ],
      },
      {
        id: 'cmrOnly',
        name: 'CMR',
        tables: [
          {
            id: 'cmrCollections',
            name: 'Collections only in CMR',
            data: collectionsInCmr,
            columns: tableColumnsCollections,
          },
          {
            id: 'cmrGranules',
            name: 'Granules only in CMR',
            data: granulesInCmr,
            columns: tableColumnsGranules,
          },
          {
            id: 'cmrFiles',
            name: 'Files only in CMR',
            data: granuleFilesOnlyInCmr,
            columns: tableColumnsFiles,
          },
        ],
      },
    ];

    const theReportState = reportState(cardConfig);

    return (
      <div className="page__component">
        <section className="page__section page__section__controls">
          <div className="reconciliation-reports__options--top">
            <ul>
              <li key="breadcrumbs">
                <Breadcrumbs config={breadcrumbConfig} />
              </li>
            </ul>
          </div>
        </section>
        <section className="page__section page__section__header-wrapper">
          <div className="page__section__header">
            <div>
              <h1 className="heading--large heading--shared-content with-description ">
                {reconciliationReportName}
              </h1>
            </div>
            <ReportStateHeader
              reportState={theReportState}
              startDate={reportStartTime}
              endDate={reportEndTime}
            />
            {error ? <ErrorReport report={error} /> : null}
          </div>
        </section>

        <section className="page__section page__section--small">
          <div className="tablecard--wrapper">
            <TableCards
              titleCaption="Cumulus intercomparison"
              config={cardConfig.slice(0, 2)}
              onClick={this.handleCardClick}
              activeCard={activeIdx}
            />
            <TableCards
              titleCaption="Cumulus versus CMR comparison"
              config={cardConfig.slice(2, 4)}
              onClick={this.handleCardClick}
              activeCard={activeIdx}
            />
          </div>
        </section>

        <section className="page__section">
          <div className="accordion__wrapper">
            <Accordion>
              {cardConfig
                .find((card) => card.id === activeIdx)
                .tables.map((item, index) => {
                  return (
                    <div className="accordion__table" key={index}>
                      <Accordion.Toggle as={Card.Header} eventKey={index}>
                        {item.name}
                        <span className="num-title--inverted">
                          {item.data.length}
                        </span>
                        <span className="expand-icon"></span>
                      </Accordion.Toggle>
                      {/* TODO [MHS, 2020-06-03]   add classnames here */}
                      <Accordion.Collapse eventKey={index}>
                        <SortableTable
                          data={item.data}
                          tableColumns={item.columns}
                          shouldUsePagination={true}
                          initialHiddenColumns={['']}
                        />
                      </Accordion.Collapse>
                    </div>
                  );
                })}
            </Accordion>
          </div>
        </section>
      </div>
    );
  }
}

ReconciliationReport.propTypes = {
  reconciliationReports: PropTypes.object,
  dispatch: PropTypes.func,
  match: PropTypes.object,
  history: PropTypes.object,
};

ReconciliationReport.defaultProps = {
  reconciliationReports: [],
};

export { ReconciliationReport };
export default withRouter(
  connect((state) => ({
    reconciliationReports: state.reconciliationReports,
  }))(ReconciliationReport)
);
