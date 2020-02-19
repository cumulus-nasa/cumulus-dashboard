import isNil from 'lodash.isnil';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import DateTimePicker from 'react-datetime-picker';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { DATEPICKER_DATECHANGE, DATEPICKER_DROPDOWN_FILTER, DATEPICKER_HOUR_FORMAT } from '../../actions/types';
import { updateRouterLocation } from '../../utils/url-helper';

const allDateRanges = [
  {value: 'All', label: 'All'},
  {value: 'Custom', label: 'Custom'},
  {value: 1 / 24.0, label: 'Last hour'},
  {value: 1, label: 'Last day'},
  {value: 7, label: 'Last week'},
  {value: 30, label: 'Last 30 Days'},
  {value: 60, label: 'Last 60 days'},
  {value: 180, label: 'Last 180 days'},
  {value: 366, label: 'Last year'}
];
const allHourFormats = ['12HR', '24HR'];
const dateTimeFormat = 'YYYY-MM-DDTHH:mm:ss.sss';

/**
 * Component representing the Datepicker.
 * Use by adding <Datepicker />. Update the connected state.datepicker to make changes.
 */
class Datepicker extends React.PureComponent {
  constructor (props) {
    super(props);
    this.handleDropdownChange = this.handleDropdownChange.bind(this);
    this.handleHourFormatChange = this.handleHourFormatChange.bind(this);
    this.handleDateTimeRangeChange = this.handleDateTimeRangeChange.bind(this);
    this.clear = this.clear.bind(this);
  }

  clear () {
    const { value, label } = allDateRanges.find(a => a.label === 'All');
    this.props.dispatch(this.dispatchDropdownUpdate(value, label));
  }

  dispatchDropdownUpdate(value, label) {
    return (dispatch, getState) => {
      dispatch({
        type: DATEPICKER_DROPDOWN_FILTER,
        data: { dateRange: { value, label } }
      });
      const datepickerState = getState().datepicker;
      this.updateRouterWithNewProps(datepickerState);
    };
  }

  handleDropdownChange (e) {
    const { value, label } = allDateRanges[e.target.selectedIndex];
    this.props.dispatch(this.dispatchDropdownUpdate(value, label));
  }

  handleHourFormatChange (e) {
    this.props.dispatch({
      type: DATEPICKER_HOUR_FORMAT,
      data: e.target.value
    });
  }

  handleDateTimeRangeChange (name, newValue) {
    // User input is in UTC, but the DateTimePicker component interprets it's
    // data as local time.  So we need convert the Date value to UTC.
    const utcValue = moment.utc(moment(newValue).format(dateTimeFormat)).toDate();
    if (isNaN(utcValue.valueOf())) return;
    const updatedProps = {
      startDateTime: this.props.startDateTime,
      endDateTime: this.props.endDateTime,
      [name]: utcValue
    };
    updatedProps.dateRange = allDateRanges.find(a => a.label === 'Custom');
    this.props.dispatch({type: DATEPICKER_DATECHANGE, data: updatedProps});
    this.updateRouterWithNewProps(updatedProps);
  }

  updateRouterWithNewProps (newProps) {
    const urlDateFormat = 'YYYYMMDDHHmmSS';
    const urlProps = ['endDateTime', 'startDateTime'];

    urlProps.map((time) => {
      let urlValue = '';
      if (newProps[time] !== null) {
        urlValue = moment.utc(newProps[time]).format(urlDateFormat);
      }
      updateRouterLocation(this.props.router, this.props.location, time, urlValue);
    });
  }

  renderDateRangeDropDown () {
    return (
      <React.Fragment>
        <div className="datetime dropdown__dtrange">
          <select
            name='dateRange'
            value={this.props.dateRange.value}
            onChange={this.handleDropdownChange}
            data-cy="datetime-dropdown">
            {allDateRanges.map((option, i) => <option value={option.value} key={i}>{option.label}</option>)}
          </select>
        </div>
      </React.Fragment>
    );
  }

  renderHourFormatSelect () {
    const name = 'hourFormat';

    return (
      <React.Fragment>
        {allHourFormats.map((option, i) => {
          return (
            <label className="selector__hrformat" key={i}>
              <input
                type="radio"
                name={name}
                value={option}
                key={i}
                checked={option === this.props.hourFormat}
                onChange={this.handleHourFormatChange}
              />
              <span className="selector"></span>
              {option}
            </label>
          );
        })
        }
      </React.Fragment>
    );
  }

  renderDateTimeRange (name) {
    const hourFormat = this.props.hourFormat;
    const value = this.props[name];
    const locale = (hourFormat === '24HR') ? 'en-GB' : 'en-US';
    const format = (hourFormat === '24HR') ? 'MM/dd/yyyyy HH:mm' : 'MM/dd/yyyyy hh:mm a';

    const utcValue = isNil(value) ? null : moment(moment.utc(value).format(dateTimeFormat)).toDate();

    return (
      <DateTimePicker
        dayPlaceholder='DD'
        format={format}
        hourPlaceholder='HH'
        locale={locale}
        monthPlaceholder='MM'
        minutePlaceholder='mm'
        name={name}
        onChange={(value) => this.handleDateTimeRangeChange(name, value)}
        value={utcValue}
        yearPlaceholder='YYYY'
      />
    );
  }

  render () {
    return (
      <div className="datetime__module">
        <div className="datetime">
          <div className="datetime__range">
            <ul className="datetime__internal">
              <li>
                { this.renderDateRangeDropDown() }
              </li>
              <li data-cy='startDateTime'>
                { this.renderDateTimeRange('startDateTime') }
              </li>
              <li>
                <span> to </span>
              </li>
              <li data-cy='endDateTime'>
                { this.renderDateTimeRange('endDateTime') }
              </li>
              <li className="selector__hrformat" data-cy='hourFormat'>
              <li className="selector__hrformat">
                { this.renderHourFormatSelect() }
              </li>
            </ul>
          </div>
          <div className="datetime__wrapper">
            <h3>Date and Time Range</h3>
          </div>
        </div>
        <div className="datetime__clear">
          <button
            className="button button--small"
            onClick={this.clear}
            data-cy="datetime-clear" >
            Clear Selection
          </button>
        </div>
      </div>
    );
  }
}

Datepicker.propTypes = {
  name: PropTypes.string,
  dateRange: PropTypes.shape({
    value: PropTypes.node,
    label: PropTypes.string
  }),
  startDateTime: PropTypes.instanceOf(Date),
  endDateTime: PropTypes.instanceOf(Date),
  hourFormat: PropTypes.oneOf(allHourFormats),
  onChange: PropTypes.func,
  dispatch: PropTypes.func,
  router: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(connect((state) => state.datepicker)(Datepicker));
