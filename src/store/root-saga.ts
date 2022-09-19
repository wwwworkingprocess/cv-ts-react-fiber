import { all, call } from "typed-redux-saga/macro";
import { countriesSaga } from "./countries/countries.saga";

import { userSaga } from "./user/user.saga";

export function* rootSaga() {
  yield* all([call(userSaga), call(countriesSaga)]);
}
