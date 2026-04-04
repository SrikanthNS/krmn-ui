import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import FeatureFlagService from "../services/featureFlag.service";

export const retrieveFeatureFlags = createAsyncThunk(
  "featureFlags/retrieve",
  async (_, thunkAPI) => {
    try {
      const res = await FeatureFlagService.getAll();
      return res.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const toggleFeatureFlag = createAsyncThunk(
  "featureFlags/toggle",
  async ({ key, enabled }, thunkAPI) => {
    try {
      const res = await FeatureFlagService.toggle(key, enabled);
      return res.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const featureFlagSlice = createSlice({
  name: "featureFlags",
  initialState: { flags: {}, loading: false, error: null },
  reducers: {},
  extraReducers: {
    [retrieveFeatureFlags.pending]: (state) => {
      state.loading = true;
      state.error = null;
    },
    [retrieveFeatureFlags.fulfilled]: (state, action) => {
      state.loading = false;
      state.flags = action.payload;
    },
    [retrieveFeatureFlags.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [toggleFeatureFlag.fulfilled]: (state, action) => {
      state.flags[action.payload.key] = action.payload.enabled;
    },
    [toggleFeatureFlag.rejected]: (state, action) => {
      state.error = action.payload;
    },
  },
});

export default featureFlagSlice.reducer;
