import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ClientService from "../services/client.service";

const initialState = [];



export const retrieveClients = createAsyncThunk(
    "clients/retrieve",
    async () => {
        const res = await ClientService.getAll();
        return res.data;
    }
);


const clientSlice = createSlice({
    name: "client",
    initialState,
    extraReducers: {

        [retrieveClients.fulfilled]: (state, action) => {
            return [...action.payload];
        }
    },
});

const { reducer } = clientSlice;
export default reducer;