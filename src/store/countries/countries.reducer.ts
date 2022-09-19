import { AnyAction } from "redux";

import {
  fetchCountriesStart,
  fetchCountriesSuccess,
  fetchCountriesFailed,
} from "./countries.action";

import { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

export type CountriesState = {
  readonly countries: Array<WikiCountry>;
  readonly isLoading: boolean;
  readonly error: Error | null;
};

export const COUNTRIES_INITIAL_STATE: CountriesState = {
  countries: [],
  isLoading: false,
  error: null,
};

export const countriesReducer = (
  state = COUNTRIES_INITIAL_STATE,
  action: AnyAction
): CountriesState => {
  if (fetchCountriesStart.match(action)) {
    return { ...state, isLoading: true };
  }
  //
  if (fetchCountriesSuccess.match(action)) {
    return { ...state, isLoading: false, countries: action.payload };
  }
  //
  if (fetchCountriesFailed.match(action)) {
    return { ...state, isLoading: false, error: action.payload };
  }
  //
  return state;
};
