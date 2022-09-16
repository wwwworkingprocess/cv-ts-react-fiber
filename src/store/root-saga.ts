import { all, call } from "typed-redux-saga/macro";

import { userSaga } from "./user/user.saga";

export function* rootSaga() {
  yield* all([call(userSaga) /* , ... */]);
}
