import { createReducer } from '@reduxjs/toolkit';
import {
  SORTS,
} from '../actions/types';

export const initialState = {
  sorted: false,
  maintained: false,
};
export default createReducer(initialState, {
  [SORTS]: (state, action) => {
    state.sorted = true;
    state.maintained = action.holdPreviousState;
  },
});
