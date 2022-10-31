import { WikiCountry } from "./firebase/repo/wiki-country.types";
import TreeHelper from "./tree-helper";

import countryBoundsRaw from "../assets/json/wiki/countries.bounds.json";

// "Q34", "Q37", "Q38", - no countryborder
const availableCountryCodes = ["Q28", "Q31", "Q37", "Q38", "Q215", "Q218"];
const zoomFixes = {
  Q28: 2,
  Q31: -4,
  Q37: 0,
  Q38: 17,
  Q215: -17,
  Q218: 8,
} as Record<string, number>;

/**
 *  Returns bounds as an array, [min_lng, max_lng, min_lat, max_lat]
 */
type RawBounds = [number, number, number, number];
const bounds = Object.fromEntries(
  Object.entries(countryBoundsRaw).map(([code, c]: [code: string, c: any]) => [
    code,
    c.bb,
  ])
) as Record<string, RawBounds>;

// const bounds = {
//   /*HU*/ Q28: [16.20229, 22.71053, 45.75948, 48.62385],
//   /*SI*/ Q215: [13.6981, 16.5648, 45.45231, 46.85238],
//   /*RO*/ Q218: [20.22019, 29.62654, 43.68844, 48.22088],
//   //
// } as Record<string, RawBounds>;

/**
 * @returns Codes of countries, enabled for the 3D map
 */
export const getAvailableCountryCodes = () => availableCountryCodes;

/**
 * Retrieve country bounds information by code
 *
 * @param code Code of country, string (e.g. Q28)
 * @returns Array of floats, [min_lng, max_lng, min_lat, max_lat]
 */
export const getCountryBoundsByCode = (code: string): RawBounds | undefined => {
  const b = bounds[code];
  //
  if (!b) console.warn("missing bounds data for ", code, b);
  //
  return b;
};

/**
 * Retrieve country nodes list from TreeHelper, and cleaning result per country when necessary
 *
 * @param code Code of country, string (e.g. Q28)
 * @returns Array of floats, [min_lng, max_lng, min_lat, max_lat]
 */
export const getCountryNodesFromTree = (
  country: WikiCountry,
  tree: TreeHelper
): Array<any> => {
  const valid = getAvailableCountryCodes().includes(country.code);
  //
  if (valid) {
    const all = tree.list_all();
    //
    switch (country.code) {
      case "Q28":
        return all.slice(143); // skip continents and countries except hungary
      default:
        return all;
    }
  }
  //
  return [];
};

/**
 * Retrieve country zoom fix value, applied when zoomed out.
 * Zero means, no change, the higher the value [0..15], the larger the view
 *
 * @param code Code of country, string (e.g. Q28)
 * @returns Array of floats, [min_lng, max_lng, min_lat, max_lat]
 */
export const getCountryZoomFixByCode = (code: string): number => {
  const zf = zoomFixes[code];
  //
  if (!zf) return 0;
  //
  return zf;
};
