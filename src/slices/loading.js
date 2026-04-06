import { createSlice } from "@reduxjs/toolkit";

const isPendingAction = (action) => action.type.endsWith("/pending");
const isFulfilledAction = (action) => action.type.endsWith("/fulfilled");
const isRejectedAction = (action) => action.type.endsWith("/rejected");

const initialState = {
  activeRequests: 0,
  message: null,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.activeRequests += 1;
      state.message = action.payload || null;
    },
    clearLoading: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      if (state.activeRequests === 0) state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isPendingAction, (state) => {
        state.activeRequests += 1;
      })
      .addMatcher(isFulfilledAction, (state) => {
        state.activeRequests = Math.max(0, state.activeRequests - 1);
        if (state.activeRequests === 0) state.message = null;
      })
      .addMatcher(isRejectedAction, (state) => {
        state.activeRequests = Math.max(0, state.activeRequests - 1);
        if (state.activeRequests === 0) state.message = null;
      });
  },
});

export const { setLoading, clearLoading } = loadingSlice.actions;
export const selectIsLoading = (state) => state.loading.activeRequests > 0;
export const selectLoadingMessage = (state) => state.loading.message;

const { reducer } = loadingSlice;
export default reducer;
