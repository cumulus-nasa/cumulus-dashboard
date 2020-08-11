import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown as DropdownBootstrap } from 'react-bootstrap';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import ErrorReport from '../Errors/report';

/**
 * ReportHeading
 * @description Reusable heading for all report types
 */

const ReportHeading = ({
  downloadOptions,
  endTime,
  error,
  name,
  onDownloadClick,
  startTime,
  reportState,
}) => {
  const breadcrumbConfig = [
    {
      label: 'Dashboard Home',
      href: '/',
    },
    {
      label: 'Reports',
      href: '/reconciliation-reports',
    },
    {
      label: name,
      active: true,
    },
  ];

  const formattedStartTime = startTime
    ? new Date(startTime).toLocaleDateString()
    : 'missing';

  const formattedEndTime = endTime
    ? new Date(endTime).toLocaleDateString()
    : 'missing';
  return (
    <>
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
              {name}
            </h1>
          </div>
          <div className="status--process">
            <dl className="status--process--report">
              <dt>Date Range:</dt>
              <dd>{`${formattedStartTime} to ${formattedEndTime}`}</dd>
              <dt>State:</dt>
              <dd
                className={`status__badge status__badge--${
                  reportState === 'PASSED' ? 'passed' : 'conflict'
                }`}
              >
                {reportState}
              </dd>
            </dl>
            {downloadOptions && (
              <DropdownBootstrap className="form-group__element--right">
                <DropdownBootstrap.Toggle
                  className="button button--small button--download"
                  id="download-report-dropdown"
                >
                  Download Report
                </DropdownBootstrap.Toggle>
                <DropdownBootstrap.Menu>
                  {downloadOptions.map(({ label, onClick }, index) => (
                    <DropdownBootstrap.Item
                      key={index}
                      as="button"
                      onClick={onClick}
                    >
                      {label}
                    </DropdownBootstrap.Item>
                  ))}
                </DropdownBootstrap.Menu>
              </DropdownBootstrap>
            )}
            {onDownloadClick && (
              <button
                className="form-group__element--right button button--small button--download"
                onClick={onDownloadClick}
              >
                Downlaod Report
              </button>
            )}
          </div>
          {error && <ErrorReport report={error} />}
        </div>
      </section>
    </>
  );
};

ReportHeading.propTypes = {
  /**
   * Create dropdown for downloading multiple tables using these options
   */
  downloadOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  endTime: PropTypes.string,
  error: PropTypes.string,
  name: PropTypes.string,
  /**
   * Create button for single download
   */
  onDownloadClick: PropTypes.func,
  startTime: PropTypes.string,
  reportState: PropTypes.string,
};

export default ReportHeading;
