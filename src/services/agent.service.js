import http from "../http-common";
import authHeader from "./auth-header";

const chat = (message, context) => {
  const body = { message };
  if (context) body.context = context;
  return http.post("/agent/chat", body, { headers: authHeader() });
};

const getTools = () => {
  return http.get("/agent/tools", { headers: authHeader() });
};

const AgentService = {
  chat,
  getTools,
};

export default AgentService;
