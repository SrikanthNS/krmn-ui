import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AgentService from "../services/agent.service";

export const sendAgentMessage = createAsyncThunk(
  "agent/chat",
  async (message, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const context = state.agent.pendingContext || null;
      const res = await AgentService.chat(message, context);
      return res.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const fetchAgentTools = createAsyncThunk(
  "agent/tools",
  async (_, thunkAPI) => {
    try {
      const res = await AgentService.getTools();
      return res.data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

const agentSlice = createSlice({
  name: "agent",
  initialState: {
    messages: [],
    tools: [],
    loading: false,
    error: null,
    pendingContext: null,
  },
  reducers: {
    clearChat: (state) => {
      state.messages = [];
      state.error = null;
      state.pendingContext = null;
    },
    addUserMessage: (state, action) => {
      state.messages.push({ role: "user", content: action.payload });
    },
  },
  extraReducers: {
    [sendAgentMessage.pending]: (state) => {
      state.loading = true;
      state.error = null;
    },
    [sendAgentMessage.fulfilled]: (state, action) => {
      state.loading = false;
      state.messages.push({ role: "agent", content: action.payload });
      // Track pending context for multi-turn conversations
      state.pendingContext = action.payload.pendingContext || null;
    },
    [sendAgentMessage.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.pendingContext = null;
      state.messages.push({
        role: "agent",
        content: { message: action.payload || "Something went wrong." },
      });
    },
    [fetchAgentTools.fulfilled]: (state, action) => {
      state.tools = action.payload.tools || [];
    },
  },
});

export const { clearChat, addUserMessage } = agentSlice.actions;
export default agentSlice.reducer;
