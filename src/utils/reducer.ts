import { AnyAction } from "redux";

export type Action<T> = { type: T };

export type Matchable<AC extends () => AnyAction> = AC & {
  type: ReturnType<AC>["type"];
  match(action: AnyAction): action is ReturnType<AC>;
};

export type ActionWithPayload<T, P> = {
  type: T;
  payload: P;
};

export function withMatcher<AC extends () => AnyAction & { type: string }>(
  actionCreator: AC
): Matchable<AC>;

export function withMatcher<
  AC extends (...args: Array<any>) => AnyAction & { type: string }
>(actionCreator: AC): Matchable<AC>;

export function withMatcher(actionCreator: Function) {
  const type = actionCreator().type;
  //
  // creating a generic function (object), that matches type 'Matchable<AC>'
  //
  return Object.assign(actionCreator, {
    type,
    match(action: AnyAction) {
      return action.type === type; // applying type narrowing on the actionCreator
    },
  });
}

export function createAction<T extends string>(
  type: T,
  payload: void
): Action<T>;

export function createAction<T extends string, P>(
  type: T,
  payload: P
): ActionWithPayload<T, P>;

export function createAction<T extends string, P>(type: T, payload: P) {
  return { type, payload };
}
