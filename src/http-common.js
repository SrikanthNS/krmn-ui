import axios from "axios";

const instance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-type": "application/json",
  },
});

export const setupInterceptors = (store) => {
  instance.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalConfig = err.config;

      // Skip interceptor for auth endpoints
      if (
        originalConfig.url === "auth/signin" ||
        originalConfig.url === "auth/signup" ||
        originalConfig.url === "auth/refreshtoken"
      ) {
        return Promise.reject(err);
      }

      // If 401 and we haven't retried yet
      if (err.response?.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        const user = JSON.parse(localStorage.getItem("user"));

        if (user?.refreshToken) {
          try {
            const rs = await instance.post("auth/refreshtoken", {
              refreshToken: user.refreshToken,
            });

            const { accessToken } = rs.data;
            user.accessToken = accessToken;
            localStorage.setItem("user", JSON.stringify(user));

            // Update the auth header and retry
            originalConfig.headers["Authorization"] = "Bearer " + accessToken;
            if (originalConfig.headers["x-access-token"]) {
              originalConfig.headers["x-access-token"] = accessToken;
            }
            return instance(originalConfig);
          } catch (_error) {
            // Refresh token also expired — force logout
            localStorage.removeItem("user");
            store.dispatch({ type: "auth/sessionExpired" });
            return Promise.reject(_error);
          }
        } else {
          // No refresh token
          localStorage.removeItem("user");
          store.dispatch({ type: "auth/sessionExpired" });
        }
      }

      // 403 "No token provided" also means session gone
      if (
        err.response?.status === 403 &&
        err.response?.data?.message === "No token provided!"
      ) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          localStorage.removeItem("user");
          store.dispatch({ type: "auth/sessionExpired" });
        }
      }

      return Promise.reject(err);
    },
  );
};

export default instance;
