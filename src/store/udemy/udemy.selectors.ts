import { createSelector } from "reselect";
import { RootState } from "../store";
import { UdemyState } from "./udemy.reducer";

const selectUdemy = (state: RootState): UdemyState => state.udemy;

export const selectUdemyItems = createSelector(
  [selectUdemy],
  (udemy) => udemy.items
);
// https://www.udemy.com/api-2.0/courses/3792262/?fields[course]=title,headline,description,num_lectures,num_quizzes,url,image_240x135
