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

export const retrieveAllUsers = createAsyncThunk(
    "users/list",
    async () => {
        const res = await UserService.retrieveAllUsers();
        return res.data;

    }
);

const userSlice = createSlice({
    name: "client",
    initialState,
    extraReducers: {
        [retrieveReviewers.fulfilled]: (state, action) => {
            state.reviewers = action.payload;
        },
        [retrieveAllUsers.fulfilled]: (state, action) => {
            state.users = action.payload;
        }
    },
});

const { reducer } = userSlice;
export default reducer;