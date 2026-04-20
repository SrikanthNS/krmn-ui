import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AnalyticsService from "../services/analytics.service";

export const fetchCompanyPerformance = createAsyncThunk(
  "analytics/company",
  async (params, thunkAPI) => {
    try {
      const res = await AnalyticsService.getCompanyPerformance(params);
      return res.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const fetchStaffPerformance = createAsyncThunk(
  "analytics/staff",
  async (params, thunkAPI) => {
    try {
      const res = await AnalyticsService.getStaffPerformance(params);
      return res.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const fetchClientDelivery = createAsyncThunk(
  "analytics/client",
  async (params, thunkAPI) => {
    try {
      const res = await AnalyticsService.getClientDelivery(params);
      return res.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const fetchMyPerformance = createAsyncThunk(
  "analytics/myPerformance",
  async (params, thunkAPI) => {
    try {
      const res = await AnalyticsService.getMyPerformance(params);
      return res.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const fetchMyClientDelivery = createAsyncThunk(
  "analytics/myClients",
  async (params, thunkAPI) => {
    try {
      const res = await AnalyticsService.getMyClientDelivery(params);
      return res.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    company: null,
    staff: null,
    clientDelivery: null,
    myPerformance: null,
    myClientDelivery: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAnalytics: (state) => {
      state.company = null;
      state.staff = null;
      state.clientDelivery = null;
      state.myPerformance = null;
      state.myClientDelivery = null;
      state.error = null;
    },
  },
  extraReducers: {
    [fetchCompanyPerformance.pending]: (state) => {
      state.loading = true;
      state.error = null;
    },
    [fetchCompanyPerformance.fulfilled]: (state, action) => {
      state.loading = false;
      state.company = action.payload;
    },
    [fetchCompanyPerformance.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [fetchStaffPerformance.pending]: (state) => {
      state.loading = true;
      state.error = null;
    },
    [fetchStaffPerformance.fulfilled]: (state, action) => {
      state.loading = false;
      state.staff = action.payload;
    },
    [fetchStaffPerformance.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [fetchClientDelivery.pending]: (state) => {
      state.loading = true;
      state.error = null;
    },
    [fetchClientDelivery.fulfilled]: (state, action) => {
      state.loading = false;
      state.clientDelivery = action.payload;
    },
    [fetchClientDelivery.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [fetchMyPerformance.pending]: (state) => {
      state.loading = true;
      state.error = null;
    },
    [fetchMyPerformance.fulfilled]: (state, action) => {
      state.loading = false;
      state.myPerformance = action.payload;
    },
    [fetchMyPerformance.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [fetchMyClientDelivery.pending]: (state) => {
      state.loading = true;
      state.error = null;
    },
    [fetchMyClientDelivery.fulfilled]: (state, action) => {
      state.loading = false;
      state.myClientDelivery = action.payload;
    },
    [fetchMyClientDelivery.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
