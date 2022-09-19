import { createSelector } from "reselect";
import { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

import type { RootState } from "../store";
import type { CountriesState } from "./countries.reducer";
// import { Category, CategoryMap } from "./countries.types";

const selectCountriesReducer = (state: RootState): CountriesState =>
  state.countries;

export const selectCountries = createSelector(
  [selectCountriesReducer], // input selectors
  (countriesSlice): Array<WikiCountry> => countriesSlice.countries // output selector
);

// export const selectCategoriesMap = createSelector(
//   // the selector will only re-run when state.categories has cahanged
//   [selectCategories],
//   (categories): CategoryMap =>
//     categories.reduce((acc, category) => {
//       const { title, items } = category;
//       //
//       acc[title.toLowerCase()] = items;
//       //
//       return acc;
//     }, {} as CategoryMap)
// );

export const selectIsLoading = createSelector(
  [selectCountriesReducer],
  (categoriesSlice) => categoriesSlice.isLoading
);
