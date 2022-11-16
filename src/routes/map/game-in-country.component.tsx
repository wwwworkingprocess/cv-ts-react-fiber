import { lazy, useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

//TODO: fix usage
import { useWikiCountries } from "../../fiber-apps/wiki-country/hooks/useWikiCountries";

import { IS_CLOUD_ENABLED } from "../../utils/firebase/provider";
import type { WikiCountry } from "../../utils/firebase/repo/wiki-country.types";

const WikiDemographyGame = lazy(() => import("./game.component"));

type GameInCountryRouteParams = { code: string; selectedCode?: string };

//
// country DEFINED, by code
//
const GameInCountry = (props: { path: string }) => {
  const { code, selectedCode } = useParams<GameInCountryRouteParams>();
  //
  const { path } = props;
  //
  const { loading, data: wikiCountries } = useWikiCountries(
    IS_CLOUD_ENABLED,
    path
  );
  //
  const validRouteParam = useMemo(() => {
    if (loading) return undefined;
    //
    return wikiCountries?.filter((c) => c.code === code)[0];
  }, [loading, wikiCountries, code]);
  //
  const countryFromParams = validRouteParam as WikiCountry;
  //
  const [selectedCountry, setSelectedCountry] = useState<
    WikiCountry | undefined
  >(countryFromParams);

  //
  // Updating module-level state from route params, when provided
  // country code is 'valid and available'
  //
  useEffect(() => {
    if (validRouteParam) setSelectedCountry(validRouteParam);
    //
    return () => setSelectedCountry(undefined);
  }, [validRouteParam]);

  //
  //
  //
  return selectedCountry ? (
    <WikiDemographyGame
      path={path}
      selectedCountry={selectedCountry}
      selectedRouteCode={selectedCode}
    />
  ) : (
    <>The provided country code ({code}) is invalid.</>
  );
};

export default GameInCountry;
