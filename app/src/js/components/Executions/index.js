import React from 'react';
import { Helmet } from 'react-helmet';
import { withRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import withQueryParams from 'react-router-query-params';
import PropTypes from 'prop-types';
import Sidebar from '../Sidebar/sidebar';
import DatePickerHeader from '../DatePickerHeader/DatePickerHeader';
import ExecutionOverview from './overview';
import ExecutionStatus from './execution-status';
import ExecutionLogs from './execution-logs';
import ExecutionEvents from './execution-events';
import ExecutionsList from './executions-list';
import { getCount, listExecutions } from '../../actions';
import { strings } from '../locale';
import { filterQueryParams } from '../../utils/url-helper';

const Executions = ({
  dispatch,
  location,
  queryParams
}) => {
  const { pathname } = location;
  const showDatePicker = pathname === '/executions';
  const filteredQueryParams = filterQueryParams(queryParams);

  function query () {
    dispatch(getCount({
      type: 'executions',
      field: 'status',
      ...filteredQueryParams
    }));
    dispatch(listExecutions(filteredQueryParams));
  }

  return (
    <div className='page__workflows'>
      <Helmet>
        <title> Cumulus Executions </title>
      </Helmet>
      {showDatePicker
        ? <DatePickerHeader onChange={query} heading={strings.executions}/>
        : <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge'>{strings.executions}</h1>
          </div>
        </div>
      }
      <div className='page__content'>
        <div className='wrapper__sidebar'>
          <Route path='/executions/execution/:executionArn' component={Sidebar} />
          <Route path='/executions/executions-list/:granule' component={Sidebar} />
          <Route exact path='/executions' component={Sidebar} />
          <div className='page__content--shortened'>
            <Switch>
              <Route exact path='/executions' render={(props) => <ExecutionOverview queryParams={filteredQueryParams} {...props} />} />
              <Route exact path='/executions/execution/:executionArn/logs' component={ExecutionLogs} />
              <Route exact path='/executions/execution/:executionArn/events' component={ExecutionEvents} />
              <Route exact path='/executions/execution/:executionArn' component={ExecutionStatus} />
              <Route exact path='/executions/executions-list/:collectionId/:granuleId' component={ExecutionsList} />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

Executions.propTypes = {
  dispatch: PropTypes.func,
  location: PropTypes.object,
  queryParams: PropTypes.object
};

export default withRouter(withQueryParams()(connect()(Executions)));
