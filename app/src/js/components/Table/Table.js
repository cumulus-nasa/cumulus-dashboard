'use strict';

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ErrorReport from '../Errors/report';
import Loading from '../LoadingIndicator/loading-indicator';
import Pagination from '../Pagination/pagination';
import SortableTable from '../SortableTable/SortableTable';
// Lodash
import isEqual from 'lodash.isequal';
import isNil from 'lodash.isnil';
import omitBy from 'lodash.omitby';
import ListActions from '../ListActions/ListActions';

class List extends React.Component {
  constructor (props) {
    super(props);
    this.queryNewPage = this.queryNewPage.bind(this);
    this.queryNewSort = this.queryNewSort.bind(this);
    this.updateSelection = this.updateSelection.bind(this);
    this.onBulkActionSuccess = this.onBulkActionSuccess.bind(this);
    this.onBulkActionError = this.onBulkActionError.bind(this);
    this.getQueryConfig = this.getQueryConfig.bind(this);

    const initialPage = 1;
    const initialSortId = props.sortId;
    const initialOrder = 'desc';

    this.state = {
      page: initialPage,
      sortId: initialSortId,
      order: initialOrder,
      selected: [],
      clearSelected: false,
      infix: null,
      queryConfig: {
        page: initialPage,
        order: initialOrder,
        sort_by: initialSortId,
        ...(props.query || {})
      },
      params: {},
      completedBulkActions: 0,
      bulkActionError: null
    };
  }

  componentDidUpdate (prevProps) {
    const { query, list } = this.props;

    if (!isEqual(query, prevProps.query)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ queryConfig: this.getQueryConfig({}, query) });
    }

    // Remove parameters with null or undefined values
    const params = omitBy(list.params, isNil);

    if (!isEqual(params, this.state.params)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ params }, () => this.setState({
        queryConfig: this.getQueryConfig()
      }));
    }
  }

  queryNewPage (page) {
    this.setState({
      page,
      queryConfig: this.getQueryConfig({ page }),
      clearSelected: true
    });
  }

  queryNewSort (sortProps) {
    this.setState({
      ...sortProps,
      queryConfig: this.getQueryConfig({
        order: sortProps.order,
        sort_by: sortProps.sortId
      }),
      clearSelected: true
    });
  }

  updateSelection (selected) {
    this.setState({
      selected,
      clearSelected: false
    });
  }

  onBulkActionSuccess (results, error) {
    // not-elegant way to trigger a re-fresh in the timer
    this.setState({
      completedBulkActions: this.state.completedBulkActions + 1,
      clearSelected: true,
      bulkActionError: error ? this.state.bulkActionError : null
    });
  }

  onBulkActionError (error) {
    const bulkActionError = (error.id && error.error)
      ? `Could not process ${error.id}, ${error.error}`
      : error;

    this.setState({
      bulkActionError,
      clearSelected: true
    });
  }

  getQueryConfig (config = {}, query = (this.props.query || {})) {
    // Remove empty keys so as not to mess up the query
    const { search, ...restQuery } = query;
    return omitBy({
      page: this.state.page,
      order: this.state.order,
      sort_by: this.state.sortId,
      infix: search,
      ...this.state.params,
      ...config,
      ...restQuery
    }, isNil);
  }

  render () {
    const {
      dispatch,
      action,
      children,
      bulkActions,
      rowId,
      sortId: initialSortId,
      list,
      tableColumns,
      data
    } = this.props;
    const { meta, data: listData } = list;
    const { count, limit } = meta;
    const tableData = data || listData;
    const {
      page,
      sortId,
      order,
      selected,
      clearSelected,
      completedBulkActions,
      bulkActionError
    } = this.state;
    const hasActions = Array.isArray(bulkActions) && bulkActions.length > 0;

    const queryConfig = this.getQueryConfig();

    return (
      <>
        <ListActions
          dispatch={dispatch}
          action={action}
          bulkActions={bulkActions}
          queryConfig={queryConfig}
          completedBulkActions={completedBulkActions}
          onBulkActionSuccess={this.onBulkActionSuccess}
          onBulkActionError={this.onBulkActionError}
          selected={selected}>
          {children}
        </ListActions>
        <div className='list-view'>
          {list.inflight && <Loading/>}
          {list.error && <ErrorReport report={list.error} truncate={true}/>}
          {bulkActionError && <ErrorReport report={bulkActionError}/>}
          <div className = "list__wrapper">
            {/* Will add back when working on ticket 1462<TableOptions
            count={count}
            limit={limit}
            page={page}
            onNewPage={this.queryNewPage}
            showPages={false}
          /> */}
            <SortableTable
              tableColumns={tableColumns}
              data={tableData}
              canSelect={hasActions}
              rowId={rowId}
              onSelect={this.updateSelection}
              initialSortId={initialSortId}
              sortId={sortId}
              changeSortProps={this.queryNewSort}
              order={order}
              clearSelected={clearSelected}
            />
            <Pagination
              count={count}
              limit={limit}
              page={page}
              onNewPage={this.queryNewPage}
              showPages={true}
            />
          </div>
        </div>
      </>
    );
  }
}

List.propTypes = {
  list: PropTypes.object,
  dispatch: PropTypes.func,
  action: PropTypes.func,
  children: PropTypes.node,
  sortId: PropTypes.string,
  query: PropTypes.object,
  bulkActions: PropTypes.array,
  rowId: PropTypes.any,
  tableColumns: PropTypes.array,
  data: PropTypes.array
};

export { List };
export default connect()(List);
