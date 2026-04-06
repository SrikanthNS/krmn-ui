import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "../services/user.service";

const initialState = {
  reviewers: [],
  users: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
};

export const retrieveReviewers = createAsyncThunk(
  "users/reviewer",
  async () => {
    const res = await UserService.retrieveReviewers();
    return res.data;
  },
);

export const retrieveAllUsers = createAsyncThunk(
  "users/list",
  async (params = {}) => {
    const res = await UserService.retrieveAllUsers(params);
    return res.data;
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }) => {
    const res = await UserService.update(id, data);
    return res.data;
  },
);

export const deactivateUser = createAsyncThunk(
  "users/deactivate",
  async ({ id }) => {
    const res = await UserService.deactivate(id);
    return res.data;
  },
);

export const activateUser = createAsyncThunk(
  "users/activate",
  async ({ id }) => {
    const res = await UserService.activate(id);
    return res.data;
  },
);

const userSlice = createSlice({
  name: "users",
  initialState,
  extraReducers: {
    [retrieveReviewers.fulfilled]: (state, action) => {
      state.reviewers = action.payload;
    },
    [retrieveAllUsers.fulfilled]: (state, action) => {
      state.users = action.payload.rows;
      state.totalItems = action.payload.totalItems;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
    },
    [updateUser.fulfilled]: (state, action) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
    [deactivateUser.fulfilled]: (state, action) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], isActive: false };
      }
    },
    [activateUser.fulfilled]: (state, action) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], isActive: true };
      }
    },
  },
});

const { reducer } = userSlice;
export default reducer;
