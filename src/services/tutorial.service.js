import http from "../http-common";
import authHeader from "./auth-header";

const getAll = () => {
    return http.get("/tutorials");
};

const getCurrentUserTasks = () => {
    return http.get("/currentUserTasks", { headers: authHeader() });
};

const get = id => {
    return http.get(`/tutorials/${id}`);
};

const create = data => {
    return http.post("/tasks", data, { headers: authHeader() });
};

const update = (id, data) => {
    return http.put(`/tutorials/${id}`, data);
};

const remove = id => {
    return http.delete(`/tutorials/${id}`);
};

const removeAll = () => {
    return http.delete(`/tutorials`);
};

const findByTitle = title => {
    return http.get(`/tutorials?title=${title}`);
};

const TutorialService = {
    getAll,
    get,
    create,
    update,
    remove,
    removeAll,
    findByTitle,
    getCurrentUserTasks
};

export default TutorialService;