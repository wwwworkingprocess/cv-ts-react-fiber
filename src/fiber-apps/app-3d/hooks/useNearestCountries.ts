import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { TextureLoader } from "three";
import useWikiGeoJson from "../../../hooks/wiki/useWikiGeoJson";
import useWikiImages from "../../../hooks/wiki/useWikiImages";
import { WikiCountry } from "../../../utils/firebase/repo/wiki-country.types";

const useNearestCountries = (
  countriesFromPosition: Array<WikiCountry>,
  LAST_IDX: number,
  setCountryBorderPoints: React.Dispatch<
    React.SetStateAction<Array<Array<[number, number]>>>
  >
) => {
  const nearestCountry = useMemo(
    () => (countriesFromPosition ? countriesFromPosition[0] : undefined),
    [countriesFromPosition]
  );

  const geojsonUrl = useMemo(() => nearestCountry?.urls.geo, [nearestCountry]);
  const rawWikiJson = useWikiGeoJson(
    geojsonUrl ? geojsonUrl.replace("http:", "https:") : undefined
  );
  const countryCoords = useMemo(() => {
    if (rawWikiJson) {
      const arrs = rawWikiJson.data.features[0].geometry.coordinates;
      //
      return arrs;
    } else return [];
  }, [rawWikiJson]);

  const nearbyCountries = useMemo(
    () =>
      countriesFromPosition
        ? countriesFromPosition.slice(1, 1 + LAST_IDX + 1)
        : [],
    [countriesFromPosition, LAST_IDX]
  );

  const nearbyCountryIds = useMemo(
    () => (nearbyCountries ? nearbyCountries.map((c) => c.code) : []),
    [nearbyCountries]
  );

  const flagProperty = "P41";
  const { images } = useWikiImages(nearbyCountryIds, LAST_IDX, flagProperty);

  useEffect(() => {
    if (countryCoords) setCountryBorderPoints(countryCoords);
  }, [countryCoords, setCountryBorderPoints]);
  //

  const textures = useLoader(
    TextureLoader,
    nearbyCountries.map((c, idx) => `data/dice/dice_${(idx % 6) + 1}.jpg`)
  );
  //
  return useMemo(
    () => ({
      nearbyCountries,
      images,
      textures,
    }),
    [nearbyCountries, images, textures]
  );
};

export default useNearestCountries;
