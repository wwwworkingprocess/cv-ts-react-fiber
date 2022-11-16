import { useCallback, useMemo } from "react";

import { useNavigate } from "react-router-dom";

//TODO: fix usage
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";

import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";
import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";
import { getAvailableCountryCodes } from "../../utils/country-helper";

import CountryList from "../../components/demography/country-list/country-list.component";

const availableCountryCodes = getAvailableCountryCodes();
const isAvailable = (c: WikiCountry) => availableCountryCodes.includes(c.code);
const sortByNameAsc = (a: WikiCountry, b: WikiCountry) =>
  a.name.localeCompare(b.name);

//
// no country code selected
//
const GameLandingPage = () => {
  const navigate = useNavigate();

  //
  // Showing only valid and enabled countries
  //
  const { data: wikiCountries } = useWikiCountries(IS_CLOUD_ENABLED);
  //
  const countries = useMemo(
    () => wikiCountries?.filter(isAvailable).sort(sortByNameAsc) ?? [],
    [wikiCountries]
  );

  //
  // Navigating to a valid country
  //
  const gotoGameInCountry = useCallback(
    (validCountryCode: string) => navigate(`./${validCountryCode}`),
    [navigate]
  );
  const onCountryClicked = (c: WikiCountry) => gotoGameInCountry(c.code);

  //
  //
  //
  return (
    <>
      <h3>Available Countries</h3>
      <p>Please select a country to start.</p>
      <CountryList countries={countries} onClicked={onCountryClicked} />
    </>
  );
};

export default GameLandingPage;
