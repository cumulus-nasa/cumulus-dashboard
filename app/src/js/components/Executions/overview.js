'use strict';
import React from 'react';
import { get } from 'object-path';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  clearExecutionsFilter,
  filterExecutions,
  searchExecutions,
  clearExecutionsSearch,
  getCount,
  getCumulusInstanceMetadata,
  listCollections,
  listExecutions,
  listWorkflows
} from '../../actions';
import {
  tally,
  lastUpdated,
  displayCase
} from '../../utils/format';
import {
  workflowOptions,
  collectionOptions
} from '../../selectors';
import statusOptions from '../../utils/status';
import pageSizeOptions from '../../utils/page-size';
import List from '../Table/Table';
import Dropdown from '../DropDown/dropdown';
import Search from '../Search/search';
import Overview from '../Overview/overview';
import { strings } from '../locale';
import { tableColumns } from '../../utils/table-config/executions';
import ListFilters from '../ListActions/ListFilters';

class ExecutionOverview extends React.Component {
  constructor (props) {
    super(props);
    this.queryMeta = this.queryMeta.bind(this);
    this.renderOverview = this.renderOverview.bind(this);
    this.searchOperationId = this.searchOperationId.bind(this);
  }

  componentDidMount () {
    this.queryMeta();
    this.props.dispatch(getCumulusInstanceMetadata());
  }

  queryMeta () {
    this.props.dispatch(listCollections({
      limit: 100,
      fields: 'name,version',
      getMMT: false
    }));
    this.props.dispatch(listWorkflows());
    this.props.dispatch(getCount({
      type: 'executions',
      field: 'status'
    }));
  }

  searchOperationId (list, infix) {
    return list.filter((item) => {
      if (item.asyncOperationId && item.asyncOperationId.includes(infix)) return item;
    });
  }

  renderOverview (count) {
    const overview = count.map(d => [tally(d.count), displayCase(d.key)]);
    return <Overview items={overview} inflight={false} />;
  }

  render () {
    const { dispatch, stats, executions, collectionOptions, workflowOptions } = this.props;
    const { list } = executions;
    const { count, queriedAt } = list.meta;
    if (list.infix && list.infix.value) {
      list.data = this.searchOperationId(list.data, list.infix.value);
    }
    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description'>Execution Overview</h1>
            {lastUpdated(queriedAt)}
            {this.renderOverview(get(stats, 'count.data.executions.count', []))}
          </div>
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>All Executions <span className='num-title'>{count ? ` ${tally(count)}` : 0}</span></h2>
          </div>
          <List
            list={list}
            dispatch={this.props.dispatch}
            action={listExecutions}
            tableColumns={tableColumns}
            query={{}}
            rowId='name'
            sortId='createdAt'
          >
            <ListFilters>
              <Dropdown
                options={statusOptions}
                action={filterExecutions}
                clear={clearExecutionsFilter}
                paramKey={'status'}
                label={'Status'}
              />

              <Dropdown
                options={collectionOptions}
                action={filterExecutions}
                clear={clearExecutionsFilter}
                paramKey={'collectionId'}
                label={strings.collection_id}
              />

              <Dropdown
                options={workflowOptions}
                action={filterExecutions}
                clear={clearExecutionsFilter}
                paramKey={'type'}
                label={'Workflow'}
              />

              <Search dispatch={dispatch}
                action={searchExecutions}
                clear={clearExecutionsSearch}
                paramKey={'asyncOperationId'}
                label={'Async Operation ID'}
              />

              <Dropdown
                options={pageSizeOptions}
                action={filterExecutions}
                clear={clearExecutionsFilter}
                paramKey={'limit'}
                label={'Results Per Page'}
              />
            </ListFilters>
          </List>
        </section>
      </div>
    );
  }
}

ExecutionOverview.propTypes = {
  dispatch: PropTypes.func,
  stats: PropTypes.object,
  executions: PropTypes.object,
  collectionOptions: PropTypes.object,
  workflowOptions: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats,
  executions: state.executions,
  workflowOptions: workflowOptions(state),
  collectionOptions: collectionOptions(state)
}))(ExecutionOverview));
