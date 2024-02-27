import http from "../http-common";
import authHeader from "./auth-header";

const getAll = () => {
    return http.get("/clients", { headers: authHeader() });
};

const get = id => {
    return http.get(`/clients/${id}`, { headers: authHeader() });
};

const create = data => {
    return http.post("/clients", data, { headers: authHeader() });
};

const update = (id, data) => {
    return http.put(`/clients/${id}`, data, { headers: authHeader() });
};


const remove = id => {
    return http.delete(`/clients/${id}`, { headers: authHeader() });
};

const removeAll = () => {
    return http.delete(`/clients`, { headers: authHeader() });
};

const findByName = name => {
    return http.get(`/clients?name=${name}`, { headers: authHeader() });
};

const ClientService = {
    getAll,
    get,
    create,
    update,
    remove,
    removeAll,
    findByName,
};

export default ClientService;