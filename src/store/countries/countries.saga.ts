import { takeLatest, all, call, put } from "typed-redux-saga/macro";
import { getWikiCountriesFromStore } from "../../utils/firebase/repo/wiki-country";

import {
  fetchCountriesFailed,
  fetchCountriesSuccess,
} from "./countries.action";
import { COUNTRIES_ACTION_TYPES } from "./countries.types";

export function* fetchCountriesAsync() {
  try {
    const countriesArray = yield* call(getWikiCountriesFromStore);
    //
    yield* put(fetchCountriesSuccess(countriesArray));
  } catch (error) {
    yield* put(fetchCountriesFailed(error as Error));
  }
}

export function* onFetchCountries() {
  yield* takeLatest(
    COUNTRIES_ACTION_TYPES.FETCH_COUNTRIES_START,
    fetchCountriesAsync
  );
}

export function* countriesSaga() {
  yield* all([call(onFetchCountries)]);
}
