import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ClientService from "../services/client.service";
import { setMessage } from "./message";

const initialState = [];

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
    }
);

export const retrieveClients = createAsyncThunk(
    "clients/retrieve",
    async () => {
        const res = await ClientService.getAll();
        return res.data;
    }
);

export const updateClient = createAsyncThunk(
    "clients/update",
    async ({ id, data }) => {
        const res = await ClientService.update(id, data);
        return res.data;
    }
);


export const deleteClient = createAsyncThunk(
    "Clients/delete",
    async ({ id }) => {
        await ClientService.remove(id);
        return { id };
    }
);

export const deleteAllClients = createAsyncThunk(
    "Clients/deleteAll",
    async () => {
        const res = await ClientService.removeAll();
        return res.data;
    }
);

export const findClientByName = createAsyncThunk(
    "Clients/findByName",
    async ({ name }) => {
        const res = await ClientService.findByName(name);
        return res.data;
    }
);

const clientSlice = createSlice({
    name: "client",
    initialState,
    extraReducers: {
        [createClient.fulfilled]: (state, action) => {
            state.push(action.payload);
        },
        [retrieveClients.fulfilled]: (state, action) => {
            return [...action.payload];
        },
        [updateClient.fulfilled]: (state, action) => {
            const index = state.findIndex(Task => Task.id === action.payload.id);
            state[index] = {
                ...state[index],
                ...action.payload,
            };
        },
        [deleteClient.fulfilled]: (state, action) => {
            let index = state.findIndex(({ id }) => id === action.payload.id);
            state.splice(index, 1);
        },
        [deleteAllClients.fulfilled]: (state, action) => {
            return [];
        },
        [findClientByName.fulfilled]: (state, action) => {
            return [...action.payload];
        }
    },
});

const { reducer } = clientSlice;
export default reducer;