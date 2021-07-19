'use strict';

import test from 'ava';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { shallow, configure } from 'enzyme';

import { ReconciliationReport } from '../../../app/src/js/components/ReconciliationReports/reconciliation-report';

configure({ adapter: new Adapter() });

const reconciliationReports = {
  map: {
    exampleInventoryReport: {
      data: {
        presignedS3Url: 'https://example.amazonaws.com/example',
        data: {
          reportStartTime: '2018-06-11T18:52:37.710Z',
          reportEndTime: '2018-06-11T18:52:39.893Z',
          status: 'SUCCESS',
          error: null,
          reportType: 'Inventory',
          okFileCount: 21,
          filesInCumulus: {
            okCount: 129,
            onlyInS3: [
              's3://some-bucket/path/to/key-1.hdf',
              's3://some-bucket/path/to/key-2.hdf'
            ],
            onlyInDynamoDb: [
              {
                uri: 's3://some-bucket/path/to/key-123.hdf',
                granuleId: 'g-123'
              },
              {
                uri: 's3://some-bucket/path/to/key-456.hdf',
                granuleId: 'g-456'
              }
            ],
          },
          collectionsInCumulusCmr: {
            okCount: 1
          },
          granulesInCumulusCmr: {
            okCount: 7
          },
          filesInCumulusCmr: {
            okCount: 4
          }
        }
      },
    },
    exampleGranuleNotFoundReport: {
      data: {
        presignedS3Url: 'https://example.amazonaws.com/example',
        data: {
          createStartTime: '2018-06-11T18:52:37.710Z',
          createEndTime: '2018-06-11T18:52:39.893Z',
          status: 'SUCCESS',
          error: null,
          reportType: 'Granule Not Found',
          okFileCount: 21,
          filesInCumulus: {
            okCount: 129,
            onlyInS3: [
              's3://some-bucket/path/to/key-1.hdf',
              's3://some-bucket/path/to/key-2.hdf'
            ],
            onlyInDynamoDb: [
              {
                uri: 's3://some-bucket/path/to/key-123.hdf',
                granuleId: 'g-123'
              },
              {
                uri: 's3://some-bucket/path/to/key-456.hdf',
                granuleId: 'g-456'
              }
            ],
          },
          collectionsInCumulusCmr: {
            okCount: 1
          },
          granulesInCumulusCmr: {
            okCount: 7
          },
          filesInCumulusCmr: {
            okCount: 4
          }
        }
      },
    },
    exampleReportWithError: {
      data: {
        error: 'error creating report'
      }
    },
    exampleReportExceedsPayloadLimit: {
      data: {
        presignedS3Url: 'https://example.amazonaws.com/example',
        data: 'Error: Report examplereport exceeded maximum allowed payload size',
      }
    }
  },
  list: {
    params: {}
  }
};

test('shows an individual inventory report', function (t) {
  const match = { params: { reconciliationReportName: 'exampleInventoryReport' } };

  const dispatch = () => { };

  const granules = () => { };

  const workflowOptions = () => {[]};

  const report = shallow(
    <ReconciliationReport
      granules={granules}
      match={match}
      reconciliationReports={reconciliationReports}
      dispatch={dispatch}
      workflowOptions={workflowOptions}
    />
  );

  t.is(report.length, 1);

  const InventoryReport = report.find('InventoryReport');
  t.is(InventoryReport.length, 1);
  const inventoryReportWrapper = InventoryReport.dive();

  const ReportHeading = inventoryReportWrapper.find('ReportHeading');
  t.is(ReportHeading.length, 1);

  const TableCards = inventoryReportWrapper.find('TableCards');
  t.is(TableCards.length, 2);
  const TableCardWrapper = TableCards.at(0).dive();
  const Cards = TableCardWrapper.find('Card');

  // there should be one card for DynamoDB and one card for S3
  t.is(Cards.length, 2);

  const Table = inventoryReportWrapper.find('withRouter(withQueryParams(Connect(List)))');
  t.is(Table.length, 1);
});

test('shows an individual Granule Not Found report', function (t) {
  const match = { params: { reconciliationReportName: 'exampleGranuleNotFoundReport' } };

  const dispatch = () => { };

  const granules = () => { };

  const workflowOptions = () => {[]};

  const report = shallow(
    <ReconciliationReport
      granules={granules}
      match={match}
      reconciliationReports={reconciliationReports}
      dispatch={dispatch}
      workflowOptions={workflowOptions}
    />
  );

  t.is(report.length, 1);

  const GnfReport = report.find('GnfReport');
  t.is(GnfReport.length, 1);
  const gnfReportWrapper = GnfReport.dive();

  const ReportHeading = gnfReportWrapper.find('ReportHeading');
  t.is(ReportHeading.length, 1);

  const Table = gnfReportWrapper.find('withRouter(withQueryParams(Connect(List)))');
  t.is(Table.length, 1);
});

test('correctly renders the heading', function (t) {

  const match = { params: { reconciliationReportName: 'exampleInventoryReport' } };

  const dispatch = () => { };

  const granules = () => { };

  const workflowOptions = () => {[]};

  const report = shallow(
    <ReconciliationReport
      granules={granules}
      match={match}
      reconciliationReports={reconciliationReports}
      dispatch={dispatch}
      workflowOptions={workflowOptions}
    />
  );

  t.is(report.length, 1);

  const InventoryReport = report.find('InventoryReport');
  t.is(InventoryReport.length, 1);
  const inventoryReportWrapper = InventoryReport.dive();

  const ReportHeading = inventoryReportWrapper.find('ReportHeading');
  t.is(ReportHeading.length, 1);

  const { downloadOptions, ...headingProps } = ReportHeading.props();

  const expectedHeadingProps = {
    endTime: '2018-06-11T18:52:39.893Z',
    error: null,
    name: 'exampleInventoryReport',
    startTime: '2018-06-11T18:52:37.710Z',
    type: 'Inventory'
  };

  t.is(downloadOptions.length, 2);

  t.deepEqual(headingProps, expectedHeadingProps);

  const reportHeadingWrapper = ReportHeading.dive();

  const downloadItems = reportHeadingWrapper.find('DropdownItem');
  t.is(downloadItems.length, 2);
});

test('report with error triggers error message', function (t) {
  const match = { params: { reconciliationReportName: 'exampleReportWithError' } };

  const dispatch = () => { };

  const granules = () => { };

  const workflowOptions = () => {[]};

  const report = shallow(
    <ReconciliationReport
      granules={granules}
      match={match}
      reconciliationReports={reconciliationReports}
      dispatch={dispatch}
      workflowOptions={workflowOptions}
    />
  );

  t.is(report.length, 1);

  const InventoryReport = report.find('InventoryReport');
  t.is(InventoryReport.length, 1);
  const inventoryReportWrapper = InventoryReport.dive();

  const ReportHeading = inventoryReportWrapper.find('ReportHeading');
  t.is(ReportHeading.length, 1);
  const reportHeadingWrapper = ReportHeading.dive();

  const ErrorReport = reportHeadingWrapper.find('ErrorReport');
  const props = ErrorReport.props();
  t.is(props.report, reconciliationReports.map.exampleReportWithError.data.error);
  t.is(ErrorReport.dive().find('ShowMoreOrLess').props().text, reconciliationReports.map.exampleReportWithError.data.error);
});

test('report which exceeds maximum allowed payload size triggers error message', function (t) {
  const match = { params: { reconciliationReportName: 'exampleReportExceedsPayloadLimit' } };

  const dispatch = () => { };

  const granules = () => { };

  const workflowOptions = () => {[]};

  const report = shallow(
    <ReconciliationReport
      granules={granules}
      match={match}
      reconciliationReports={reconciliationReports}
      dispatch={dispatch}
      workflowOptions={workflowOptions}
    />
  );

  t.is(report.length, 1);

  const InventoryReport = report.find('InventoryReport');
  t.is(InventoryReport.length, 1);
  const inventoryReportWrapper = InventoryReport.dive();

  const ReportHeading = inventoryReportWrapper.find('ReportHeading');
  t.is(ReportHeading.length, 1);
  const reportHeadingWrapper = ReportHeading.dive();

  const ErrorReport = reportHeadingWrapper.find('ErrorReport');
  const props = ErrorReport.props();
  const errorMessage = reconciliationReports.map.exampleReportExceedsPayloadLimit.data.data;
  t.true(props.report.includes(errorMessage));
  t.true(ErrorReport.dive().find('ShowMoreOrLess').props().text.includes(errorMessage));
});
