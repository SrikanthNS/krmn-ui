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

const UserService = {
    getPublicContent,
    getUserBoard,
    getModeratorBoard,
    getAdminBoard,
    retrieveReviewers,
};

export default UserService