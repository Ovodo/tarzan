import { configureStore } from "@reduxjs/toolkit";
import marketReducer from "./slices/marketSlice";
import utilsReducer from "./slices/utilsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: { market: marketReducer, utils: utilsReducer },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
