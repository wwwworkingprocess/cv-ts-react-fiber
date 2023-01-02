import { lazy, useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "../../components/spinner/spinner.component";

//TODO: fix usage
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";
import { getAvailableCountryCodes } from "../../config/country";

import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";
import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

const WikiDemographyGame = lazy(() => import("./game.component"));

const availableCountryCodes = getAvailableCountryCodes();

type GameInCountryRouteParams = { code: string; selectedCode?: string };

//
// country DEFINED, by code
//
const GameInCountry = (props: { path: string }) => {
  const navigate = useNavigate();
  //
  const { code, selectedCode } = useParams<GameInCountryRouteParams>();
  //
  const { path } = props;
  //
  const { loading, data: wikiCountries } = useWikiCountries(
    IS_CLOUD_ENABLED,
    path
  );
  //
  const isValidRouteParam = availableCountryCodes.includes(code ?? "");
  //
  const validRouteParam = useMemo(() => {
    if (loading) return undefined;
    //
    return isValidRouteParam
      ? wikiCountries?.filter((c) => c.code === code)[0]
      : undefined;
  }, [loading, isValidRouteParam, wikiCountries, code]);
  //
  const [selectedCountry, setSelectedCountry] = useState<
    WikiCountry | undefined
  >(validRouteParam as WikiCountry);

  //
  // Redirect to parent route, when the selected country is not valid
  //
  useEffect(() => {
    if (!isValidRouteParam) navigate("..");
  }, [navigate, isValidRouteParam]);

  //
  // Updating YET COMPONENT-level state from route params, when provided
  // country code is 'valid and available'
  //
  useEffect(() => {
    if (!loading && validRouteParam) setSelectedCountry(validRouteParam);

    //
    return () => setSelectedCountry(undefined);
  }, [loading, validRouteParam]);

  //
  // Mounting game for selected valid country
  //
  return selectedCountry ? (
    <WikiDemographyGame
      path={path}
      selectedCountry={selectedCountry}
      selectedRouteCode={selectedCode}
    />
  ) : loading ? (
    <Spinner />
  ) : null; // <>Invalid country selection, going back... </>
};

export default GameInCountry;
