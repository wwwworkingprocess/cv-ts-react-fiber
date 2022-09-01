import { useEffect, useState } from "react";

export const useAdminOneGeoData = (country_code: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  // const [data, setData] = useState<Array<any> | null>(null);
  const [features, setFeatures] =
    useState<Array<{ properties: any; geometry: any }>>();

  const fetchApi = (country_code: string) => {
    if (country_code) {
      const url = `data/geojson/admin1.${country_code}.geojson`;
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
    fetchApi(country_code);
  }, [country_code]);

  return { loading, features };
};
