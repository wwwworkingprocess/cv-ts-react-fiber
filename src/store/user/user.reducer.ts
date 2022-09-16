import type { AnyAction } from "redux";

import type { UserData } from "../../utils/firebase";

import { USER_ACTION_TYPES } from "./user.types";

import {
  signInSuccess,
  signInFailed,
  signUpFailed,
  signOutFailed,
  signOutSuccess,
} from "./user.action";

export type UserState = {
  readonly isLoading: boolean;
  readonly currentUser: UserData | null;
  readonly error: Error | null;
};

const INITIAL_STATE: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

export const userReducer = (state = INITIAL_STATE, action: AnyAction) => {
  if (signInSuccess.match(action)) {
    return { ...state, isLoading: false, currentUser: action.payload };
  }
  //
  if (signOutSuccess.match(action)) {
    return { ...state, isLoading: false, currentUser: null };
  }
  //
  if (
    signInFailed.match(action) ||
    signUpFailed.match(action) ||
    signOutFailed.match(action)
  ) {
    return { ...state, isLoading: false, error: action.payload };
  }
  //
  return state;
};
