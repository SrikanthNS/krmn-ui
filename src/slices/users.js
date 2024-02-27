import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "../services/user.service";

const initialState = { reviewers: [], users: [] };

export const retrieveReviewers = createAsyncThunk(
  "users/reviewer",
  async () => {
    const res = await UserService.retrieveReviewers();
    return res.data;
  }
);

export const retrieveAllUsers = createAsyncThunk("users/list", async () => {
  const res = await UserService.retrieveAllUsers();
  return res.data;
});

export const findUserByName = createAsyncThunk(
  "users/findByName",
  async ({ name }) => {
    const res = await UserService.findByName(name);
    console.log("🚀 ~ file: users.js:25 ~ res.data:", res.data);
    return res.data;
  }
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }) => {
    const res = await UserService.update(id, data);
    return res.data;
  }
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
      const index = state.findIndex((Task) => Task.id === action.payload.id);
      state[index] = {
        ...state[index],
        ...action.payload,
      };
    },
  },
});

const { reducer } = userSlice;
export default reducer;
