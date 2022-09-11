import { useMemo, useEffect, useState, useCallback } from "react";
import { LineBasicMaterial, LineSegments, Scene } from "three";
import { GeoJsonGeometry } from "three-geojson-geometry";
import EarthD3D from "../../Earth3D";

// const geojsonUrlSmall = "data/geojson/ne_110m_admin_0_only_hungary.geojson";
// const geojsonUrlLarge = "data/geojson/admin1.28.geojson";

const geojsonUrlSmall = "data/geojson/ne_110m_admin_0_countries.geojson";
const geojsonUrlLarge = "data/geojson/admin1.geojson";

export type CountryGeoJson = {
  features: Array<{ properties: Array<any>; geometry: any }>;
};
const useCountryBorders = (
  scene: Scene,
  e3d: EarthD3D | undefined,
  isHighResolution: boolean
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [countries, setCountries] = useState<CountryGeoJson>();
  const [lineObjs] = useState<Array<LineSegments>>([]);
  //
  //
  //
  const parentReady = useMemo(
    () => Boolean(scene) && Boolean(e3d),
    [scene, e3d]
  );

  //
  // after data loaded
  //
  const afterDataLoaded = useCallback(
    (countries: CountryGeoJson) => {
      setCountries(countries);
      setLoading(false);
      //
      // const huf = countries.features.filter( (f) => (f.properties as any)["ISO3166-1-Alpha-3"] === "HUN" );
    },
    [setCountries]
  );

  //
  // draw to scene
  //
  useEffect(() => {
    if (countries && e3d) {
      e3d.mesh_lines.clear(); // reset target
      //
      const alt = 1.03;
      //
      const materials = [
        new LineBasicMaterial({ color: "blue", linewidth: 1 }), // outer ring
        new LineBasicMaterial({ color: "green" }), // inner holes
      ];

      countries.features.forEach(({ properties, geometry }: any) => {
        lineObjs.push(
          new LineSegments(new GeoJsonGeometry(geometry, alt), materials)
        );
      });

      lineObjs.forEach((obj) => e3d.mesh_lines.add(obj));
    }
  }, [e3d, countries]);

  const datasourceUrl = useMemo(
    () => (isHighResolution ? geojsonUrlLarge : geojsonUrlSmall),
    [isHighResolution]
  );
  //
  // loading geojson
  //
  useEffect(() => {
    if (parentReady) {
      const fetchGeoJson = () => {
        fetch(datasourceUrl)
          .then((res) => res.json())
          .then(afterDataLoaded);
      };
      //
      setLoading(true);
      fetchGeoJson();
    }
  }, [parentReady, datasourceUrl, afterDataLoaded]);
  //

  return useMemo(() => ({ loading, lineObjs }), [loading, lineObjs]);
};

export default useCountryBorders;
