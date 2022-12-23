import { WikiCountry } from "../../../../utils/firebase/repo/wiki-country.types";

const Nearby = (props: {
  countriesFromPosition: Array<WikiCountry>;
  availableCountryCodes: Array<string>;
  LAST_IDX: number;
}) => {
  const { countriesFromPosition, availableCountryCodes, LAST_IDX } = props;
  //
  const first = countriesFromPosition[0];
  //
  const renderCountry = (c: WikiCountry, idx: number) => (
    <span key={`${c.code}_${idx}`}>
      {availableCountryCodes.includes(c.code) ? (
        <a href={`map/${c.code}`} title={c.name}>
          <b key={c.code} style={{ color: "gold" }}>
            {c.name}
          </b>
        </a>
      ) : (
        <small>{c.name}</small>
      )}
      {idx < LAST_IDX ? " - " : ""}
    </span>
  );

  return (
    <div>
      {first ? (
        <>
          Nearest is {renderCountry(first, LAST_IDX)},{" "}
          {(first.distance ?? 0).toFixed(2)} km away.
        </>
      ) : null}
      <br />
      Nearby:{" "}
      {countriesFromPosition
        ? countriesFromPosition.slice(1, 1 + LAST_IDX + 1).map(renderCountry)
        : null}
    </div>
  );
};

export default Nearby;
