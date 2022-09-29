import { useMemo, useEffect, useState } from "react";
import { LineBasicMaterial, LineSegments } from "three";
import { GeoJsonGeometry } from "three-geojson-geometry";

export type CountryGeoJson = {
  features: Array<{ properties: Array<any>; geometry: any }>;
};

//
//
//
const useCountryBorders = (
  parentReady: boolean,
  isHighResolution: boolean,
  isSingleCountry: boolean,
  path: string | undefined
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<CountryGeoJson>();
  //
  const p = `${path ?? ""}data/geojson/`;
  //
  const datasourceUrl = useMemo(
    () =>
      isSingleCountry
        ? isHighResolution
          ? `${p}admin1.28.geojson`
          : `${p}ne_110m_admin_0_only_hungary.geojson`
        : isHighResolution
        ? `${p}admin1.geojson`
        : `${p}ne_110m_admin_0_countries.geojson`,
    [p, isHighResolution, isSingleCountry]
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
