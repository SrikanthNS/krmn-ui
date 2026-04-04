import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";

import AuthService from "../services/auth.service";

const user = JSON.parse(localStorage.getItem("user"));

export const register = createAsyncThunk(
  "auth/register",
  async ({ username, email, password, roles }, thunkAPI) => {
    try {
      const response = await AuthService.register(
        username,
        email,
        password,
        roles,
      );
      thunkAPI.dispatch(setMessage(response.data.message));
      return response.data;
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

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, thunkAPI) => {
    try {
      const data = await AuthService.login(username, password);
      return { user: data };
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

export const logout = createAsyncThunk("auth/logout", () => {
  AuthService.logout();
});

const initialState = user
  ? { isLoggedIn: true, user }
  : { isLoggedIn: false, user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateItemsPerPage: (state, action) => {
      if (state.user) {
        state.user.itemsPerPage = action.payload;
        const stored = JSON.parse(localStorage.getItem("user"));
        if (stored) {
          stored.itemsPerPage = action.payload;
          localStorage.setItem("user", JSON.stringify(stored));
        }
      }
    },
    updateDarkModeSettings: (state, action) => {
      if (state.user) {
        state.user.darkModeSettings = action.payload;
        const stored = JSON.parse(localStorage.getItem("user"));
        if (stored) {
          stored.darkModeSettings = action.payload;
          localStorage.setItem("user", JSON.stringify(stored));
        }
      }
    },
  },
  extraReducers: {
    [register.fulfilled]: (state, action) => {
      state.isLoggedIn = false;
    },
    [register.rejected]: (state, action) => {
      state.isLoggedIn = false;
    },
    [login.fulfilled]: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
    },
    [login.rejected]: (state, action) => {
      state.isLoggedIn = false;
      state.user = null;
    },
    [logout.fulfilled]: (state, action) => {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

const { reducer, actions } = authSlice;
export const { updateItemsPerPage, updateDarkModeSettings } = actions;
export default reducer;
