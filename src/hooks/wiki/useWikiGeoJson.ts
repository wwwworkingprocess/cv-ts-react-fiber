import { useEffect, useState } from "react";

const useWikiGeoJson = (geojsonUrl: string) => {
  const [selectedWikiCountryGeo, setSelectedWikiCountryGeo] = useState<any>();
  //
  // when [selectedWikiCountry] triggering load of
  // the country from wikidata in geojson format
  //
  useEffect(() => {
    if (geojsonUrl) {
      const origUrl = geojsonUrl;
      const resource = origUrl.split("/").pop();
      //
      const new_url = `https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&rvslots=*&rvprop=content&format=json&titles=${resource}&origin=*`;
      //
      const txtFromResult = (r: any) => {
        if (r.query) {
          const page = Object.values(r.query.pages)[0];
          //
          if (page) {
            const revision = (page as any).revisions[0];
            //
            if (revision) {
              return revision.slots.main["*"];
            }
          }
        }
      };
      //
      if (new_url) {
        fetch(new_url)
          .then((r) => r.json())
          .then((json) => {
            const geojsonAsText = txtFromResult(json);
            //
            if (geojsonAsText) {
              setSelectedWikiCountryGeo(JSON.parse(geojsonAsText));
            }
          });
      }
    }
    //
    return () => setSelectedWikiCountryGeo(undefined); // reset on unmount
  }, [geojsonUrl]);
  //
  return { selectedWikiCountryGeo };
};

export default useWikiGeoJson;
