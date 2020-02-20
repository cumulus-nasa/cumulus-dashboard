'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { connect } from 'react-redux';
import { withRouter, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import { interval, getCount } from '../../actions';
import _config from '../../config';
import Pdr from './pdr';
import PdrOverview from './overview';
import PdrList from './list';

const { updateInterval } = _config;

class Pdrs extends React.Component {
  constructor () {
    super();
    this.displayName = 'Pdrs';
    this.query = this.query.bind(this);
  }

  componentDidMount () {
    this.cancelInterval = interval(() => this.query(), updateInterval, true);
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  query () {
    this.props.dispatch(getCount({
      type: 'pdrs',
      field: 'status'
    }));
  }

  render () {
    const count = get(this.props.stats, 'count.data.pdrs.count');
    return (
      <div className='page__pdrs'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge'>PDRs</h1>
          </div>
        </div>
        <div className='page__content'>
          <div className='wrapper__sidebar'>
            <Sidebar
              currentPath={this.props.location.pathname}
              params={this.props.params}
              count={count}
            />
            <div className='page__content--shortened'>
              <Switch>
                <Route exact path='/pdrs' component={PdrOverview} />
                <Route path='/pdrs/active' component={PdrList} />
                <Route path='/pdrs/failed' component={PdrList} />
                <Route path='/pdrs/completed' component={PdrList} />
                <Route path='/pdrs/pdr/:pdrName' component={Pdr} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Pdrs.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
  params: PropTypes.object,
  dispatch: PropTypes.func,
  stats: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats
}))(Pdrs));
