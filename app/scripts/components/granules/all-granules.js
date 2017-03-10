'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { searchGranules, clearGranuleSearch, listGranules } from '../../actions';
import { get } from 'object-path';
import { granuleSearchResult, lastUpdated } from '../../utils/format';
import { isUndefined as undef } from '../../utils/validate';
import { tableHeader, tableRow, tableSortProps } from '../../utils/table-config/granules';
import List from '../table/list-view';
import LogViewer from '../logs/viewer';
import Search from '../form/search';

var AllGranules = React.createClass({
  displayName: 'AllGranules',

  propTypes: {
    granules: React.PropTypes.object,
    logs: React.PropTypes.object,
    dispatch: React.PropTypes.func,
    params: React.PropTypes.object
  },

  generateQuery: function () {
    const pdrName = get(this.props, ['params', 'pdrName']);
    const prefix = get(this.props, ['granules', 'list', 'meta', 'query', 'prefix']);

    const options = {};
    if (!undef(pdrName)) { options.pdrName = pdrName; }
    if (!undef(prefix)) { options.prefix = prefix; }

    return options;
  },

  render: function () {
    const { pdrName } = this.props.params;
    const { list, search } = this.props.granules;
    const { count, queriedAt } = list.meta;
    const logsQuery = { q: 'granuleId' };

    return (
      <div className='page__component'>
        <section className='page__section'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content'>
              {pdrName || 'All'} Granules <span style={{color: 'gray'}}>{ count ? `(${count})` : null }</span>
            </h1>
            {lastUpdated(queriedAt)}
          </div>
          <div className='filters filters__wlabels'>
            <div className='filter__item'>
              <label htmlFor='collectionFilter'>Collection</label>
              <div className='dropdown__wrapper form-group__element'>
                <select id='collectionFilter'>
                  <option value='ASTER_1A_versionId_1'>ASTER_1A_versionId_1</option>
                  <option value='TODO'>TODO</option>
                </select>
              </div>
            </div>
            <div className='filter__item'>
              <Search dispatch={this.props.dispatch}
                action={searchGranules}
                results={search}
                format={granuleSearchResult}
                clear={clearGranuleSearch}
              />
            </div>
          </div>

          <List
            list={list}
            dispatch={this.props.dispatch}
            action={listGranules}
            tableHeader={tableHeader}
            tableRow={tableRow}
            tableSortProps={tableSortProps}
            query={this.generateQuery()}
            isRemovable={true}
            pageRowId={'granuleId'}
          />
        </section>
        <LogViewer query={logsQuery} dispatch={this.props.dispatch} logs={this.props.logs}/>
      </div>
    );
  }
});

export default connect(state => state)(AllGranules);
