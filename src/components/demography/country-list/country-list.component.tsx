import type { WikiCountry } from "../../../utils/firebase/repo/wiki-country.types";

import { CountryListItem } from "./country-list.styles";

type CountryListProps = {
  countries: Array<WikiCountry> | null;
  onClicked: (c: WikiCountry) => void;
};

const CountryList = (props: CountryListProps) => {
  const { countries, onClicked } = props;
  //
  return countries ? (
    <>
      {countries.map((c, idx) => (
        <CountryListItem key={idx} onClick={() => onClicked(c)}>
          <img src={c.urls.flag} alt={c.name} />
          <small>{(c.population * 0.000001).toFixed(3)}M</small>
          <br />
          {c.name}- {c.capital} <br />
        </CountryListItem>
      ))}
    </>
  ) : null;
};

export default CountryList;
