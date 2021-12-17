import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "../services/user.service";

const initialState = [];



export const retrieveReviewers = createAsyncThunk(
    "users/reviewer",
    async () => {
        const res = await UserService.retrieveReviewers();
        return res.data;
    }
);

const userSlice = createSlice({
    name: "client",
    initialState,
    extraReducers: {
        [retrieveReviewers.fulfilled]: (state, action) => {
            return [...action.payload];
        }
    },
});

const { reducer } = userSlice;
export default reducer;