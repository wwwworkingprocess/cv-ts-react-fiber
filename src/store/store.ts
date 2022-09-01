import { compose, createStore, applyMiddleware } from "redux";
import type { Middleware } from "redux";

import { persistStore, persistReducer } from "redux-persist";
import type { PersistConfig } from "redux-persist";

import storage from "redux-persist/lib/storage";
// import thunk from 'redux-thunk';
// import createSagaMiddleware from "redux-saga";

import logger from "redux-logger";
// import { loggerMiddleware } from './middleware/logger';

import { rootReducer } from "./root-reducer";
// import { rootSaga } from "./root-saga";

export type RootState = ReturnType<typeof rootReducer>;

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

type ExtendedPersistConfig = PersistConfig<RootState> & {
  whitelist: Array<keyof RootState>;
};

const persistConfig: ExtendedPersistConfig = {
  key: "root", // persist everything
  storage,
  // blacklist: ["udemy"], // dont persist the userSlice
  whitelist: ["udemy"], // ONLY persist the udemySlice
};

// const sagaMiddleware = createSagaMiddleware();

const persistedReducer = persistReducer(persistConfig, rootReducer);

const enhancers = undefined;
const middlewares = [
  process.env.NODE_ENV !== "production" && logger,
  // sagaMiddleware,
].filter((middleware): middleware is Middleware => Boolean(middleware)); // [loggerMiddleware]

const composeEnhancer =
  (process.env.NODE_ENV !== "production" &&
    window &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

// const composedEnhancers = compose(applyMiddleware(...middlewares));
const composedEnhancers = composeEnhancer(applyMiddleware(...middlewares));

// export const store = createStore(rootReducer, enhancers, composedEnhancers);
export const store = createStore(
  persistedReducer,
  enhancers,
  composedEnhancers
);

// sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);
