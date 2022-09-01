import { AnyAction } from "redux";
import udemyItems from "./udemy.data.json";

// export type UdemyItem = {
//   id: number;
//   title: string;
//   imageUrl: string;
//   linkUrl: string;
// };
export type UdemyItem = {
  id: number;
  title: string;
  headline: string;
  image_240x135: string;
  // linkUrl: string;
  url: string;
  description: string;
  num_lectures: number;
  num_quizzes: number;
};

export type CompletionDetails = {
  certUrl: string;
  duration: number; // 15.0;
  finished: string; // '2021-04-05'
};

export type CompletedCourse = UdemyItem & CompletionDetails;

// https://www.udemy.com/certificate/UC-c01e5ad6-2fa1-4e8c-8876-b3d8a2bb62ba/

export type UdemyState = {
  readonly items: Array<CompletedCourse>;
  readonly isLoading: boolean;
  readonly error: Error | null;
};

const completedCourses = udemyItems.map(
  (u: UdemyItem) =>
    ({
      ...u,
      ...({
        certUrl: "certUrl",
        duration: 1.2,
        finished: "2021-04-05",
      } as CompletionDetails),
    } as CompletedCourse)
);

export const INITIAL_STATE: UdemyState = {
  isLoading: false,
  error: null,
  items: completedCourses as Array<CompletedCourse>,
};

const udemyReducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default udemyReducer;

/*
Array.from(
  document.querySelectorAll(
    "div.enrolled-course-card--container--3CFBO > div > div:nth-child(2) > h3"
  )
)
  .map((c) => c.innerHTML)
  .map((txt) => {
    const tkns = txt.split("course_id=");
    const idx = tkns[1].indexOf('"');

    return {
      id: parseInt(tkns[1].substring(0, idx)),
      title: tkns[1].substring(idx + 2, tkns[1].length - 1 - 3),
      imageUrl: "",
      linkUrl: "",
    };
  });
*/
