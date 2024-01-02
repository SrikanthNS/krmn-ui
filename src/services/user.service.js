import http from "../http-common";
import authHeader from "./auth-header";

const getPublicContent = () => {
  return http.get("/all");
};

const getUserBoard = () => {
  return http.get("/user", { headers: authHeader() });
};

const getModeratorBoard = () => {
  return http.get("/mod", { headers: authHeader() });
};

const getAdminBoard = () => {
  return http.get("/admin", { headers: authHeader() });
};

const retrieveReviewers = () => {
  return http.get("/reviewer");
};

const retrieveAllUsers = () => {
  return http.get("/userList", { headers: authHeader() });
};

const findByName = (name) => {
  return http.get(`/users?name=${name}`, { headers: authHeader() });
};

const update = (id, data) => {
  return http.put(`/users/${id}`, data, { headers: authHeader() });
};

const get = (id) => {
  console.log("🚀 ~ file: user.service.js:37 ~ get ~ id:", id);
  return http.get(`/users/${id}`, { headers: authHeader() });
};

const UserService = {
  get,
  getPublicContent,
  getUserBoard,
  getModeratorBoard,
  getAdminBoard,
  retrieveReviewers,
  retrieveAllUsers,
  findByName,
  update,
};

export default UserService;
