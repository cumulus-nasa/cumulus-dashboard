import PropTypes from 'prop-types';
import React from 'react';
import Datepicker from '../Datepicker/Datepicker';

const DatePickerHeader = ({ heading, onChange }) => (
  <div className='content__header'>
    <div className='row'>
      <ul className='datetimeheader'>
        <li>
          <div className='datetimeheader__content'>
            <h1 className='heading--xlarge'>{heading}</h1>
          </div>
        </li>
        <li>
          <Datepicker hideWrapper={true} onChange={onChange} />
        </li>
      </ul>
    </div>
  </div>
);

DatePickerHeader.propTypes = {
  onChange: PropTypes.func,
  heading: PropTypes.string
};

export default DatePickerHeader;
