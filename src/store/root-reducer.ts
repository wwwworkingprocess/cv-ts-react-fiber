import { combineReducers } from "redux";

// import { categoriesReducer } from "./categories/categories.reducer";
import { userReducer } from "./user/user.reducer";
import udemyReducer from "./udemy/udemy.reducer";

export const rootReducer = combineReducers({
  udemy: udemyReducer,
  user: userReducer,
  // categories: categoriesReducer,
});
