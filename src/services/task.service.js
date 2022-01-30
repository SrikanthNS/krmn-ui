import http from "../http-common";
import authHeader from "./auth-header";

const getAll = () => {
    return http.get("/tasks", { headers: authHeader() });
};

const getCurrentUserTasks = () => http.get("/user/tasks", { headers: authHeader() });

const get = id => http.get(`/tasks/${id}`, { headers: authHeader() });


const create = data => http.post("/tasks", data, { headers: authHeader() });

const update = (id, data) =>
    http.put(`/tasks/${id}`, data, { headers: authHeader() });


const remove = id =>
    http.delete(`/tasks/${id}`, { headers: authHeader() });


const removeAll = () =>
    http.delete(`/tasks`, { headers: authHeader() });


const findByDesc = desc =>
    http.get(`/tasks?description=${desc}`, { headers: authHeader() });


const TaskService = {
    getAll,
    get,
    create,
    update,
    remove,
    removeAll,
    findByDesc,
    getCurrentUserTasks
};

export default TaskService;