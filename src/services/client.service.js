import http from "../http-common";

const getAll = () => {
    return http.get("/clients");
};

const ClientService = {
    getAll,
};

export default ClientService;