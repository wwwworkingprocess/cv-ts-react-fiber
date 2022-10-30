import { useEffect, useState } from "react";

export const useAdminOneGeoData = (
  country_code: string,
  path?: string | undefined
) => {
  const p = path ? path : "";
  //
  const [loading, setLoading] = useState<boolean>(false);
  const [features, setFeatures] =
    useState<Array<{ properties: any; geometry: any }>>();

  const fetchApi = (p: string, country_code: string) => {
    if (country_code) {
      const code = country_code.replace("Q", "");
      const url = `${p}data/geojson/admin1.${code}.geojson`;
      //
      fetch(url)
        .then((response) => response.json())
        .then((gjson) => {
          setFeatures(gjson.features);
          setLoading(false);
        })
        .catch((error) => {
          setFeatures([]);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    setLoading(true);

    fetchApi(p, country_code);
  }, [country_code, p]);

  return { loading, features };
};
