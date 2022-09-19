import { COUNTRIES_ACTION_TYPES } from "./countries.types";

import { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

import { createAction, withMatcher } from "../../utils/reducer";
import type { Action, ActionWithPayload } from "../../utils/reducer";

export type FetchCountriesStart =
  Action<COUNTRIES_ACTION_TYPES.FETCH_COUNTRIES_START>;

export type FetchCountriesSuccess = ActionWithPayload<
  COUNTRIES_ACTION_TYPES.FETCH_COUNTRIES_SUCCESS,
  Array<WikiCountry>
>;

export type FetchCountriesFailed = ActionWithPayload<
  COUNTRIES_ACTION_TYPES.FETCH_COUNTRIES_FAILED,
  Error
>;

export type CountriesAction =
  | FetchCountriesStart
  | FetchCountriesSuccess
  | FetchCountriesFailed;

export const fetchCountriesStart = withMatcher(
  (): FetchCountriesStart =>
    createAction(COUNTRIES_ACTION_TYPES.FETCH_COUNTRIES_START)
);

export const fetchCountriesSuccess = withMatcher(
  (countriesArray: Array<WikiCountry>): FetchCountriesSuccess =>
    createAction(COUNTRIES_ACTION_TYPES.FETCH_COUNTRIES_SUCCESS, countriesArray)
);

export const fetchCountriesFailed = withMatcher(
  (error: Error): FetchCountriesFailed =>
    createAction(COUNTRIES_ACTION_TYPES.FETCH_COUNTRIES_FAILED, error)
);
