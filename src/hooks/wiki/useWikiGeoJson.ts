import { useEffect, useState } from "react";

const toJson = (r: Response) => r.json();
const parseJson = (s: string) =>
  s !== undefined && s !== "" ? JSON.parse(s) : undefined;
const readRevisionSlot = (r: Record<string, any>) => {
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
// Retrieves geojson country outline from WikiData about the
// entity specified by the qualifier. (e.g Q28 or Q36)
//
const useWikiGeoJson = (geojsonUrl: string | undefined) => {
  const [selectedWikiCountryGeo, setSelectedWikiCountryGeo] = useState<any>();
  //
  // Fetch data from WikiData using a no-cors request
  //
  useEffect(() => {
    if (geojsonUrl) {
      const resource = geojsonUrl.replace(
        "https://commons.wikimedia.org/data/main/",
        ""
      );
      const url = `https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&rvslots=*&rvprop=content&format=json&titles=${resource}&origin=*`;
      //
      console.log("original", geojsonUrl);
      console.log("fetching", url);
      if (url) {
        fetch(url)
          .then(toJson)
          .then(readRevisionSlot)
          .then(parseJson)
          .then((geoJson) => geoJson && setSelectedWikiCountryGeo(geoJson));
      }
    } else setSelectedWikiCountryGeo(undefined);
    //
    return () => setSelectedWikiCountryGeo(undefined); // reset on unmount
  }, [geojsonUrl]);
  //
  return selectedWikiCountryGeo;
};

export default useWikiGeoJson;
