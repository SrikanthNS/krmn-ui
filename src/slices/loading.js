import { createSlice } from "@reduxjs/toolkit";

const isPendingAction = (action) => action.type.endsWith("/pending");
const isFulfilledAction = (action) => action.type.endsWith("/fulfilled");
const isRejectedAction = (action) => action.type.endsWith("/rejected");

const initialState = {
  activeRequests: 0,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(isPendingAction, (state) => {
        state.activeRequests += 1;
      })
      .addMatcher(isFulfilledAction, (state) => {
        state.activeRequests = Math.max(0, state.activeRequests - 1);
      })
      .addMatcher(isRejectedAction, (state) => {
        state.activeRequests = Math.max(0, state.activeRequests - 1);
      });
  },
});

export const selectIsLoading = (state) => state.loading.activeRequests > 0;

const { reducer } = loadingSlice;
export default reducer;
