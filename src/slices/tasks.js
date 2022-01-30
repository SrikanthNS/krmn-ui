import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import TaskService from "../services/task.service";
import { setMessage } from "./message";

const initialState = [];

export const createTask = createAsyncThunk(
    "task/create",
    async ({ description, minutesSpent, date, completed, clientId, reviewerId, taskType }, thunkAPI) => {
        try {
            const res = await TaskService.create({ description, minutesSpent, date, completed, clientId, reviewerId, taskType });
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

export const retrieveTasks = createAsyncThunk(
    "tasks/retrieve",
    async () => {
        const res = await TaskService.getAll();
        return res.data;
    }
);

export const retrieveCurrentUserTasks = createAsyncThunk(
    "currentUsertasks/retrieve",
    async () => {
        const res = await TaskService.getAll();
        return res.data;
    }
);

export const updateTask = createAsyncThunk(
    "tasks/update",
    async ({ id, data }) => {
        const res = await TaskService.update(id, data);
        return res.data;
    }
);

export const deleteTask = createAsyncThunk(
    "Tasks/delete",
    async ({ id }) => {
        await TaskService.remove(id);
        return { id };
    }
);

export const deleteAllTasks = createAsyncThunk(
    "Tasks/deleteAll",
    async () => {
        const res = await TaskService.removeAll();
        return res.data;
    }
);

export const findTasksByTitle = createAsyncThunk(
    "Tasks/findByTitle",
    async ({ description }) => {
        const res = await TaskService.findByDesc(description);
        return res.data;
    }
);

const TaskSlice = createSlice({
    name: "Task",
    initialState,
    extraReducers: {
        [createTask.fulfilled]: (state, action) => {
            state.push(action.payload);
        },
        [retrieveTasks.fulfilled]: (state, action) => {
            return [...action.payload];
        },
        [retrieveCurrentUserTasks.fulfilled]: (state, action) => {
            return [...action.payload];
        },
        [updateTask.fulfilled]: (state, action) => {
            const index = state.findIndex(Task => Task.id === action.payload.id);
            state[index] = {
                ...state[index],
                ...action.payload,
            };
        },
        [deleteTask.fulfilled]: (state, action) => {
            let index = state.findIndex(({ id }) => id === action.payload.id);
            state.splice(index, 1);
        },
        [deleteAllTasks.fulfilled]: (state, action) => {
            return [];
        },
        [findTasksByTitle.fulfilled]: (state, action) => {
            return [...action.payload];
        },
    },
});

const { reducer } = TaskSlice;
export default reducer;