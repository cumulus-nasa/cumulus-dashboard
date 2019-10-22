'use strict';
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { initialValueFromLocation, updateRouterLocation } from '../../utils/url-helper';

class Search extends React.Component {
  constructor (props) {
    super(props);
    this.displayName = 'Search';
    const value = initialValueFromLocation(props);
    this.state = { value };
    this.complete = this.complete.bind(this);
    this.submit = this.submit.bind(this);
    this.delayedQuery = this.delayedQuery.bind(this);
  }

  componentDidMount () {
    const { dispatch, action, location, paramKey } = this.props;
    dispatch(action({value: location.query[paramKey]}));
  }

  componentDidUpdate () {
    const { dispatch, action, location, paramKey } = this.props;
    dispatch(action({value: location.query[paramKey]}));
  }

  componentWillUnmount () {
    if (this.cancelDelay) { this.cancelDelay(); }
    const { dispatch, clear } = this.props;
    dispatch(clear());
  }

  complete (e) {
    const value = e.currentTarget.value || null;
    this.setState({ value });
    if (this.cancelDelay) { this.cancelDelay(); }
    this.cancelDelay = this.delayedQuery(value);
  }

  submit (e) {
    e.preventDefault();
    const value = e.currentTarget.getAttribute('value') || null;
    this.setState({ value });
    const { dispatch, action } = this.props;
    if (this.cancelDelay) { this.cancelDelay(); }
    dispatch(action(value));
  }

  delayedQuery (value) {
    const { dispatch, action, clear, location, router, paramKey } = this.props;
    const timeoutId = setTimeout(function () {
      if (value && value.length) {
        updateRouterLocation(router, location, paramKey, value);
        dispatch(action(value));
      } else {
        updateRouterLocation(router, location, paramKey, '');
        dispatch(clear());
      }
    }, 650);
    return () => clearTimeout(timeoutId);
  }

  render () {
    return (
        <div className='filter__item'>
        <form className='search__wrapper form-group__element' onSubmit={this.submit} >
        <input className='search' type='search' onChange={this.complete} value={this.state.value}/>
        <span className='search__icon'/>
        </form>
        </div>
    );
  }
}

Search.defaultProps = {
  paramKey: 'search'
};

Search.propTypes = {
  dispatch: PropTypes.func,
  action: PropTypes.func,
  clear: PropTypes.func,
  paramKey: PropTypes.string,
  location: PropTypes.object,
  router: PropTypes.object
};

export default withRouter(connect()(Search));
