export type WikiCountryInputFlat = {
  country: string;
  capital: string;
  countryLabel: string;
  capitalLabel: string;
  co_pop?: string;
  c_pop?: string;
  c_min_elevation?: string;
  c_area?: string;
  c_ll?: string;
  co_geoshape?: string;
  co_flag?: string;
  co_arms?: string;
};

export type WikiCountry = {
  idx: number;
  code: string; // e.g Q28
  //
  coords?: [number, number];
  minElevation: number;
  distance?: number;
  //
  name: string;
  capital: string;
  population: number;
  capitalPopulation: number;
  //
  urls: {
    geo: string;
    flag: string;
    flagArms: string;
    //
    capital: string;
    self: string;
  };
};
