import http from "../http-common";
import authHeader from "./auth-header";
// import fs from 'fs';

const getAll = () => {
    return http.get("/tasks", { headers: authHeader() });
};

const downloadAllTasks = async () => {
    return http.get("/tasks/download", {
        responseType: 'blob',
        headers: {
            ...authHeader(), headers:
            {
                'Content-Disposition': "attachment; filename=template.xlsx",
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            responseType: 'arraybuffer',
        }
    })
        .then(async (response) => {
            try {
                const outputFilename = `taskList_${new Date().toJSON().slice(0, 10)}.xlsx`;
                // If you want to download file automatically using link attribute.
                const url = URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', outputFilename);
                document.body.appendChild(link);
                link.click();
            } catch (e) {
                console.log("🚀 ~ file: task.service.js ~ line 38 ~ .then ~ e", e.message);
            }
            return
        }).catch((error) => console.log(error));

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
    getCurrentUserTasks,
    downloadAllTasks
};

export default TaskService;