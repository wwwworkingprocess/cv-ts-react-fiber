import type { WikiCountry } from "../../../utils/firebase/repo/wiki-country.types";

import { CountryListItem } from "./country-list.styles";

type CountryListProps = {
  wikiCountries: Array<WikiCountry> | null;
  onCountryClicked: (c: WikiCountry) => void;
};

const CountryList = (props: CountryListProps) => {
  const { wikiCountries, onCountryClicked } = props;
  //
  return wikiCountries ? (
    <>
      {wikiCountries.map((c, idx) => (
        <CountryListItem key={idx} onClick={() => onCountryClicked(c)}>
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
