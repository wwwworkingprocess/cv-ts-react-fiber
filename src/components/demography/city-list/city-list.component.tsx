import { useMemo } from "react";
import useGameAppStore from "../../../fiber-apps/demography-game/stores/useGameAppStore";
import useWikiImages from "../../../hooks/wiki/useWikiImages";
import type { WikiCountry } from "../../../utils/firebase/repo/wiki-country.types";
import { Spinner } from "../../spinner/spinner.component";

import { CityListItem } from "./city-list.styles";

type CityListProps = {
  cities: Array<any> | null;
  onClicked: (c: WikiCountry) => void;
};

const CityList = (props: CityListProps) => {
  const { cities, onClicked } = props;
  //
  //
  const cityCodes = useMemo(
    () => (cities ? cities.map((c) => `Q${c.code}`) : []),
    [cities]
  );

  //
  const [selectedCode, setSelectedCode] = useGameAppStore((s) => [
    s.selectedCode,
    s.setSelectedCode,
  ]);
  //
  //
  const { images } = useWikiImages(cityCodes, cityCodes.length);
  //
  const defaultUrl =
    "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Charleroi - Hôtel de ville vu de la place Charles II - 2019-06-01.jpg&width=95";

  //
  //
  //
  return cities ? (
    <>
      {cities.map((c, idx) => (
        <CityListItem
          key={idx}
          onClick={() => {
            //
            // only allow selection, if coordinates are given
            //
            const hasCoords = !isNaN(c?.data?.lng);
            if (hasCoords) {
              setSelectedCode(`Q${c.code}`);
              onClicked(c);
            } else {
              alert("Sorry, this item has no geolocation.");
            }
          }}
          style={{
            color: selectedCode === `Q${c.code}` ? "gold" : "unset",
            backgroundColor:
              selectedCode === `Q${c.code}` ? "rgba(255,255,255,0.2)" : "unset",
          }}
        >
          {images ? (
            <img src={images[`Q${c.code}`] ?? defaultUrl} alt={c.name} />
          ) : (
            <div style={{ width: "40px", height: "30px" }}>
              <Spinner />
            </div>
          )}
          <br />
          <div>
            {isNaN(c.data?.lng) ? "[!]" : ""}
            {c.name}
          </div>
          <small>
            {(c.data?.pop ?? 0) > 0
              ? `${(c.data.pop * 0.000001).toFixed(2)}M`
              : `${idx + 1}.`}
          </small>
        </CityListItem>
      ))}
    </>
  ) : null;
};

export default CityList;
