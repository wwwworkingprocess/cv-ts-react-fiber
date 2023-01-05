import type TreeHelper from "../../utils/tree-helper";
import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

import {
  AvailableCountryCodes,
  getAvailableCountryCodes as _getAvailableCountryCodes,
  isAvailableCountryCode,
} from "./available-countries";

import { zoomFixes } from "./zoom-fixes";
import countryBoundsRaw from "../../assets/json/wiki/countries.bounds.json";

type RawBounds = [number, number, number, number];

/**
 *  Returns bounds as an array, [min_lng, max_lng, min_lat, max_lat]
 */
const bounds = Object.fromEntries(
  Object.entries(countryBoundsRaw).map(([code, c]: [code: string, c: any]) => [
    code,
    c.bb,
  ])
) as Record<AvailableCountryCodes, RawBounds>;

/**
 * @returns Codes of countries, enabled for the 3D map
 */
export const getAvailableCountryCodes = _getAvailableCountryCodes;

/**
 * Retrieve country bounds information by code
 *
 * @param code Code of country, string (e.g. Q28)
 * @returns Array of floats, [min_lng, max_lng, min_lat, max_lat]
 */
export const getCountryBoundsByCode = (code: string): RawBounds | undefined => {
  const b = bounds[code as AvailableCountryCodes];
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
  const valid = isAvailableCountryCode(country.code);
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
  const valid = isAvailableCountryCode(code);
  //
  return valid ? zoomFixes[code as AvailableCountryCodes] || 0 : 0;
};

/*
   Fixing top-most level features' names by country
*/
const empty = "";
export const beautifyAdminOneName = (
  countryCode: number,
  featureName: string
) => {
  const q = `Q${countryCode}` as AvailableCountryCodes;
  //
  if (!q) return featureName; // invalid country, skip
  //
  if (!featureName) console.log("INVALID NAME", featureName);
  //
  const s = featureName ?? "";
  //
  if (!s) return ""; // invalid name, returning empty
  //
  const r = (s: string, remove: string) => s.replaceAll(remove, empty);
  const ra = (s: string, remove: string, removeAfter: string) =>
    s.replaceAll(remove, empty).replaceAll(removeAfter, empty);
  //
  switch (q) {
    case "Q28":
      return s.replaceAll(" County", "").replaceAll(" District", "");
    case "Q34":
      return s.replaceAll(" County", "");
    case "Q43":
      return s.replaceAll(" Province", "");
    case "Q77":
      return s.replaceAll(" Department", "");
    case "Q117":
      return s.replaceAll(" Region", "");
    case "Q191":
      return s.replaceAll(" County", "");
    case "Q211":
      return s.replaceAll(" Municipality", "");
    case "Q212":
      return s.replaceAll(" Oblast", "");
    case "Q214":
      return s.replaceAll(" Region", "").replaceAll(" region", "");
    case "Q224":
      return s.replaceAll(" County", "");
    case "Q227":
      return s.replaceAll(" District", "");
    case "Q229":
      return s.replaceAll(" District", "");
    case "Q232":
      return s.replaceAll(" Region", "");
    case "Q241":
      return s.replaceAll(" Province", "");
    case "Q334":
      return s.replaceAll(" Region", "");
    case "Q398":
      return s.replaceAll(" Governorate", "");
    case "Q399":
      return s.replaceAll(" Region", "").replaceAll(" Province", "");
    case "Q414":
      return s.replaceAll(" Province", "");
    case "Q685":
      return s.replaceAll(" Province", "");
    case "Q796":
      return s.replaceAll(" Governorate", "");
    case "Q800":
      return s.replaceAll(" Province", "");
    case "Q801":
      return s.replaceAll(" District", "");
    case "Q805":
      return s.replaceAll(" Governorate", "");
    case "Q810":
      return s.replaceAll(" Governorate", "");
    case "Q811":
      return s.replaceAll(" Department", "");
    case "Q813":
      return s.replaceAll(" Region", "");
    case "Q842":
      return s.replaceAll(" Governorate", "");
    case "Q851":
      return s.replaceAll(" Province", "");
    case "Q858":
      return r(s, " Governorate");
    case "Q863":
      return ra(s, " Rayon", " District");
    case "Q874":
      return r(s, " Region");
    case "Q878":
      return r(s, "Emirate of ");
    case "Q902":
      return r(s, " Division");
    case "Q916":
      return r(s, " Province");
    case "Q1016":
      return r(s, " District");
    case "Q1050":
      return r(s, " District");

    default:
      return featureName ? featureName : "";
  }
};
