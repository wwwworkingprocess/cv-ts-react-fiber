import { useMemo, useEffect, useState, useCallback } from "react";
import { LineBasicMaterial, LineSegments, Scene } from "three";
import { GeoJsonGeometry } from "three-geojson-geometry";
import EarthD3D from "../../Earth3D";

// const geojsonUrlSmall = "data/geojson/ne_110m_admin_0_only_hungary.geojson";
const geojsonUrlSmall = "data/geojson/ne_110m_admin_0_countries.geojson";
const geojsonUrlLarge = "data/geojson/admin1.geojson";
// const geojsonUrlLarge = "data/geojson/admin1.28.geojson";

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
  const [lineObjs, setLineObjs] = useState<Array<LineSegments>>([]);
  //
  //
  //
  const parentReady = useMemo(
    () => Boolean(scene) && Boolean(e3d),
    [scene, e3d]
  );

  //
  // retrieve json
  //

  //
  // after data loaded
  //
  const afterDataLoaded = useCallback(
    (countries: CountryGeoJson) => {
      setCountries(countries);
      setLoading(false);
      console.log("LOADED", countries);

      const fs = countries.features;
      //
      const huf = fs.filter(
        (f) => (f.properties as any)["ISO3166-1-Alpha-3"] === "HUN"
      );

      console.log("huf", huf);
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
      console.log("loaded countries");
      const alt = 1.03;
      //
      const materials = [
        new LineBasicMaterial({
          color: "blue",
          // opacity: 0.64,
          linewidth: 1,
          // transparent: true,
        }), // outer ring
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
      const fn = () => {
        fetch(datasourceUrl)
          .then((res) => res.json())
          .then(afterDataLoaded);
      };
      console.log("loading geojson");
      setLoading(true);
      fn();
    }
  }, [parentReady, datasourceUrl, afterDataLoaded]);
  //

  return useMemo(() => ({ loading, lineObjs }), [loading, lineObjs]);
};

export default useCountryBorders;
