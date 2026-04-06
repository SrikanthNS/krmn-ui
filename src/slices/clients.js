import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ClientService from "../services/client.service";
import { setMessage } from "./message";

const initialState = {
  rows: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
};

export const createClient = createAsyncThunk(
  "client/create",
  async ({ name }, thunkAPI) => {
    try {
      const res = await ClientService.create({ name });
      return res.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      thunkAPI.dispatch(setMessage(message));
      return thunkAPI.rejectWithValue();
    }
  },
);

export const retrieveClients = createAsyncThunk(
  "clients/retrieve",
  async (params = {}) => {
    const res = await ClientService.getAll(params);
    return res.data;
  },
);

export const updateClient = createAsyncThunk(
  "clients/update",
  async ({ id, data }) => {
    const res = await ClientService.update(id, data);
    return res.data;
  },
);

export const deleteClient = createAsyncThunk(
  "Clients/delete",
  async ({ id }) => {
    await ClientService.remove(id);
    return { id };
  },
);

export const deleteAllClients = createAsyncThunk(
  "Clients/deleteAll",
  async () => {
    const res = await ClientService.removeAll();
    return res.data;
  },
);

const clientSlice = createSlice({
  name: "client",
  initialState,
  extraReducers: {
    [createClient.fulfilled]: (state, action) => {
      // Re-fetch after create
    },
    [retrieveClients.fulfilled]: (state, action) => {
      state.rows = action.payload.rows;
      state.totalItems = action.payload.totalItems;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
    },
    [updateClient.fulfilled]: (state, action) => {
      const index = state.rows.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.rows[index] = { ...state.rows[index], ...action.payload };
      }
    },
    [deleteClient.fulfilled]: (state, action) => {
      state.rows = state.rows.filter((c) => c.id !== action.payload.id);
      state.totalItems = Math.max(0, state.totalItems - 1);
    },
    [deleteAllClients.fulfilled]: (state) => {
      return { ...initialState };
    },
  },
});

const { reducer } = clientSlice;
export default reducer;
