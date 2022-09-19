import { combineReducers } from "redux";

import { userReducer } from "./user/user.reducer";
import udemyReducer from "./udemy/udemy.reducer";
import { countriesReducer } from "./countries/countries.reducer";

export const rootReducer = combineReducers({
  udemy: udemyReducer,
  user: userReducer,
  countries: countriesReducer,
});
