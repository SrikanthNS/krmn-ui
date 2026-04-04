import http from "../http-common";
import authHeader from "./auth-header";

const getAll = () => {
  return http.get("/feature-flags", { headers: authHeader() });
};

const toggle = (key, enabled) => {
  return http.put(
    `/feature-flags/${encodeURIComponent(key)}`,
    { enabled },
    { headers: authHeader() },
  );
};

const FeatureFlagService = {
  getAll,
  toggle,
};

export default FeatureFlagService;
