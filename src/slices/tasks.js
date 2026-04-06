import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import TaskService from "../services/task.service";
import { setMessage } from "./message";

const initialState = {
  rows: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  statusCounts: { todo: 0, "in-progress": 0, completed: 0 },
};

export const createTask = createAsyncThunk(
  "task/create",
  async (
    {
      description,
      minutesSpent,
      date,
      completed,
      status,
      clientId,
      reviewerId,
      taskType,
      billingCategory,
      userId,
    },
    thunkAPI,
  ) => {
    try {
      const res = await TaskService.create({
        description,
        minutesSpent,
        date,
        completed,
        status,
        clientId,
        reviewerId,
        taskType,
        billingCategory,
        userId,
      });
      return res.data;
    } catch (error) {
      const message = error.message || error.toString();
      thunkAPI.dispatch(setMessage(message));
      return thunkAPI.rejectWithValue();
    }
  },
);

export const retrieveTasks = createAsyncThunk(
  "tasks/retrieve",
  async (params = {}) => {
    const res = await TaskService.getAll(params);
    return res.data;
  },
);

export const downloadTasks = createAsyncThunk("tasks/download", async () => {
  const res = await TaskService.downloadAllTasks();
  return res.data;
});

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await TaskService.update(id, data);
      return res.data;
    } catch (error) {
      const message = "Something is wrong please check all fields";
      thunkAPI.dispatch(setMessage(message));
      return thunkAPI.rejectWithValue();
    }
  },
);

export const deleteTask = createAsyncThunk("Tasks/delete", async ({ id }) => {
  await TaskService.remove(id);
  return { id };
});

export const deleteAllTasks = createAsyncThunk("Tasks/deleteAll", async () => {
  const res = await TaskService.removeAll();
  return res.data;
});

const TaskSlice = createSlice({
  name: "Task",
  initialState,
  extraReducers: {
    [createTask.fulfilled]: (state, action) => {
      // After create, the list will be re-fetched
    },
    [retrieveTasks.fulfilled]: (state, action) => {
      state.rows = action.payload.rows;
      state.totalItems = action.payload.totalItems;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      if (action.payload.statusCounts) {
        state.statusCounts = action.payload.statusCounts;
      }
    },
    [updateTask.fulfilled]: (state, action) => {
      const index = state.rows.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.rows[index] = { ...state.rows[index], ...action.payload };
      }
    },
    [deleteTask.fulfilled]: (state, action) => {
      state.rows = state.rows.filter((t) => t.id !== action.payload.id);
      state.totalItems = Math.max(0, state.totalItems - 1);
    },
    [deleteAllTasks.fulfilled]: (state) => {
      return { ...initialState };
    },
  },
});

const { reducer } = TaskSlice;
export default reducer;
