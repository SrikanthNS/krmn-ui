import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import messageReducer from "./slices/message";
import tasksReducer from "./slices/tasks";
import userReducer from "./slices/users";
import clientReducer from "./slices/clients";
import loadingReducer from "./slices/loading";
import featureFlagsReducer from "./slices/featureFlags";

const reducer = {
  auth: authReducer,
  message: messageReducer,
  tasks: tasksReducer,
  user: userReducer,
  client: clientReducer,
  loading: loadingReducer,
  featureFlags: featureFlagsReducer,
};

const store = configureStore({
  reducer: reducer,
  devTools: process.env.NODE_ENV === "development",
});

export default store;
