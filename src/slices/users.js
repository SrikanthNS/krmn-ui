import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "../services/user.service";

const initialState = { reviewers: [], users: [] };

export const retrieveReviewers = createAsyncThunk(
  "users/reviewer",
  async () => {
    const res = await UserService.retrieveReviewers();
    return res.data;
  },
);

export const retrieveAllUsers = createAsyncThunk("users/list", async () => {
  const res = await UserService.retrieveAllUsers();
  return res.data;
});

export const findUserByName = createAsyncThunk(
  "users/findByName",
  async ({ name }) => {
    const res = await UserService.findByName(name);
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
      state.users = action.payload;
    },
    [findUserByName.fulfilled]: (state, action) => {
      return [...action.payload];
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
