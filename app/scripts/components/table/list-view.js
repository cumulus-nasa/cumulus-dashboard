'use strict';
import React from 'react';
import { interval } from '../../actions';
import SortableTable from './sortable';
import Pagination from '../app/pagination';
import Loading from '../app/loading-indicator';
import ErrorReport from '../errors/report';
import { updateInterval } from '../../config';
import { isUndefined as undef } from '../../utils/validate';

var List = React.createClass({
  displayName: 'List',

  getInitialState: function () {
    return {
      page: 1,
      sortIdx: 0,
      order: 'desc',
      selected: [],
      prefix: null,
      clockTick: updateInterval / 1000,
      clockRunning: false,
      immediateFetch: true,
      options: {}
    };
  },

  propTypes: {
    list: React.PropTypes.object,
    dispatch: React.PropTypes.func,
    action: React.PropTypes.func,
    tableHeader: React.PropTypes.array,
    tableRow: React.PropTypes.array,
    tableSortProps: React.PropTypes.array,
    query: React.PropTypes.object,
    isRemovable: React.PropTypes.bool,
    rowId: React.PropTypes.string
  },

  componentWillMount: function () {
    this.list();
    this.toggleFetchClock();
  },

  componentWillUnmount: function () {
    if (this.cancelInterval) { this.cancelInterval(); }
  },

  componentWillReceiveProps: function (newProps) {
    if (JSON.stringify(newProps.query) !== JSON.stringify(this.props.query)) {
      this.list({}, newProps.query);
    }

    if (newProps.list.prefix !== this.state.prefix) {
      this.setState({ prefix: newProps.list.prefix }, () => this.list());
    }

    if (newProps.list.error && this.cancelInterval) {
      this.cancelInterval();
      this.cancelInterval = null;
    }
  },

  queryNewPage: function (page) {
    this.setState({ page });
    this.list({ page });
    this.setState({selected: []});
  },

  queryNewSort: function (sortProps) {
    this.setState(sortProps);
    this.list({ order: sortProps.order, sort_by: this.getSortProp(sortProps.sortIdx) });
    this.setState({selected: []});
  },

  getSortProp: function (idx) {
    return this.props.tableSortProps[idx];
  },

  selectAll: function (e) {
    const { data } = this.props.list;
    if (!data.length) return;
    const selected = this.state.selected.length === data.length;
    if (selected) {
      this.setState({ selected: [] });
    } else {
      this.setState({ selected: data.map(d => d[this.props.rowId]) });
    }
  },

  updateSelection: function (id) {
    const { selected } = this.state;
    if (selected.indexOf(id) === -1) {
      this.setState({ selected: selected.concat([id]) });
    } else {
      this.setState({ selected: selected.filter(d => d === id) });
    }
  },

  toggleFetchClock: function () {
    // If clock is on, turn off, halt fetch
    if (this.state.clockRunning) {
      this.setState({ clockRunning: false, clockTick: -1 });
      if (this.cancelInterval) { this.cancelInterval(); }
    // if clock is off, turn on, reset countdown
    } else {
      this.setState({ clockRunning: true, clockTick: updateInterval / 1000, immediateFetch: true });
      this.countdownInterval = setInterval(this.fetchCountdown, 1000);
    }
  },

  fetchCountdown: function () {
    const { clockTick, clockRunning, immediateFetch } = this.state;

    if (immediateFetch) {
      this.runQuery(immediateFetch);
      this.setState({ clockTick: clockTick - 1, immediateFetch: false });
    } else if (!clockRunning) {
      this.turnOffCountdown();
    } else if (clockTick === 0) {
      this.resetClock(immediateFetch);
    } else {
      this.setState({ clockTick: clockTick - 1 });
    }
  },

  turnOffCountdown: function () {
    this.setState({ clockTick: -1 });
    clearInterval(this.countdownInterval);
  },

  resetClock: function (immediate) {
    this.setState({ clockTick: updateInterval / 1000 });
    this.runQuery(immediate);
  },

  list: function (options, query) {
    options = options || {};
    const { page, order, sort_by, prefix } = options;

    // attach page, and sort properties using the current state
    if (undef(page)) { options.page = this.state.page; }
    if (undef(order)) { options.order = this.state.order; }
    if (undef(sort_by)) { options.sort_by = this.getSortProp(this.state.sortIdx); }
    if (undef(prefix)) { options.prefix = this.state.prefix; }

    if (query) {
      options = Object.assign({}, options, query);
    } else if (this.props.query) {
      options = Object.assign({}, options, this.props.query);
    }

    this.setState({options: options});

    this.resetClock(true);
  },

  runQuery: function (immediate) {
    // remove empty keys so as not to mess up the query
    let options = this.state.options;
    for (let key in options) { !options[key] && delete options[key]; }

    // if there's a fetch in progress, kill it
    if (this.cancelInterval) { this.cancelInterval(); }
    const { dispatch, action } = this.props;
    this.cancelInterval = interval(() => dispatch(action(options)), updateInterval, immediate);
  },

  render: function () {
    const { tableHeader, tableRow, tableSortProps, isRemovable, rowId, list } = this.props;
    const { count, limit } = list.meta;
    const { page, sortIdx, order, selected, clockTick } = this.state;
    const primaryIdx = 0;
    const checked = this.state.selected.length === list.data.length && list.data.length;

    return (
      <div>
        {isRemovable ? (
          <div className='form--controls'>
            <label className='form__element__select form-group__element form-group__element--small'>
              <input type='checkbox' className='form-select__all' name='Select' checked={checked} onChange={this.selectAll} />
              Select
            </label>
            <button className='button button--small form-group__element'>Remove From CMR</button>
            <button className='button button--small form-group__element'>Reprocess</button>
            <button onClick={this.toggleFetchClock}>{clockTick === -1 ? '-' : clockTick}</button>
          </div>
        ) : null}

        {list.inflight ? <Loading /> : null}
        {list.error ? <ErrorReport report={list.error} /> : null}

        <SortableTable
          primaryIdx={primaryIdx}
          data={list.data}
          header={tableHeader}
          row={tableRow}
          props={tableSortProps}
          sortIdx={sortIdx}
          order={order}
          changeSortProps={this.queryNewSort}
          onSelect={this.updateSelection}
          isRemovable={isRemovable}
          selectedRows={selected}
          rowId={rowId}
        />

        <Pagination count={count} limit={limit} page={page} onNewPage={this.queryNewPage} />
      </div>
    );
  }
});

export default List;
