import { useMemo, useEffect, useState } from "react";
import { LineBasicMaterial, LineSegments } from "three";
import { GeoJsonGeometry } from "three-geojson-geometry";

const geojsonUrlSmallCountry =
  "data/geojson/ne_110m_admin_0_only_hungary.geojson";
const geojsonUrlLargeCountry = "data/geojson/admin1.28.geojson";

const geojsonUrlSmall = "data/geojson/ne_110m_admin_0_countries.geojson";
const geojsonUrlLarge = "data/geojson/admin1.geojson";

export type CountryGeoJson = {
  features: Array<{ properties: Array<any>; geometry: any }>;
};

//
//
//
const useCountryBorders = (
  parentReady: boolean,
  isHighResolution: boolean,
  isSingleCountry: boolean
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<CountryGeoJson>();
  //
  const datasourceUrl = useMemo(
    () =>
      isSingleCountry
        ? isHighResolution
          ? geojsonUrlLargeCountry
          : geojsonUrlSmallCountry
        : isHighResolution
        ? geojsonUrlLarge
        : geojsonUrlSmall,
    [isHighResolution, isSingleCountry]
  );

  //
  // creating line segments (spherical projection)
  //
  const lineObjs = useMemo(() => {
    if (countries) {
      const alt = 1.03; // earth radius * 1.03
      //
      const materials = [
        new LineBasicMaterial({ color: "blue", linewidth: 1 }), // outer ring
        new LineBasicMaterial({ color: "green" }), // inner holes
      ];
      //
      const segments = countries.features.map(
        ({ properties, geometry }: any) =>
          new LineSegments(new GeoJsonGeometry(geometry, alt), materials)
      );
      //
      return segments as Array<LineSegments>;
    }
    //
    return undefined;
  }, [countries]);

  //
  // loading geojson
  //
  useEffect(() => {
    if (parentReady && datasourceUrl) {
      const fetchGeoJson = (url: string) => {
        fetch(url)
          .then((res) => res.json())
          .then((countries: CountryGeoJson) => {
            setCountries(countries);
            setLoading(false);
          });
      };
      //
      setLoading(true);
      fetchGeoJson(datasourceUrl);
    }
  }, [parentReady, datasourceUrl]);
  //
  return useMemo(() => ({ loading, lineObjs }), [loading, lineObjs]);
};

export default useCountryBorders;
