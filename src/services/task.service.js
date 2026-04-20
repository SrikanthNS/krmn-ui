import http from "../http-common";
import authHeader from "./auth-header";
// import fs from 'fs';

const getAll = (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.size) query.set("size", params.size);
  if (params.sortField) query.set("sortField", params.sortField);
  if (params.sortDir) query.set("sortDir", params.sortDir);
  if (params.description) query.set("description", params.description);
  if (params.status) query.set("status", params.status);
  if (params.clientId) query.set("clientId", params.clientId);
  if (params.userId) query.set("userId", params.userId);
  if (params.reviewerId) query.set("reviewerId", params.reviewerId);
  if (params.taskType) query.set("taskType", params.taskType);
  if (params.billingCategory)
    query.set("billingCategory", params.billingCategory);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  return http.get(`/tasks?${query.toString()}`, { headers: authHeader() });
};

const downloadAllTasks = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.sortField) query.set("sortField", params.sortField);
  if (params.sortDir) query.set("sortDir", params.sortDir);
  if (params.description) query.set("description", params.description);
  if (params.status) query.set("status", params.status);
  if (params.clientId) query.set("clientId", params.clientId);
  if (params.userId) query.set("userId", params.userId);
  if (params.reviewerId) query.set("reviewerId", params.reviewerId);
  if (params.taskType) query.set("taskType", params.taskType);
  if (params.billingCategory)
    query.set("billingCategory", params.billingCategory);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  return http
    .get(`/tasks/download?${query.toString()}`, {
      responseType: "blob",
      headers: {
        ...authHeader(),
        headers: {
          "Content-Disposition": "attachment; filename=template.xlsx",
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        responseType: "arraybuffer",
      },
    })
    .then(async (response) => {
      try {
        const outputFilename = `taskList_${new Date().toJSON().slice(0, 10)}.xlsx`;
        // If you want to download file automatically using link attribute.
        const url = URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", outputFilename);
        document.body.appendChild(link);
        link.click();
      } catch (e) {
        // download error
      }
      return;
    })
    .catch(() => {});
};

const getCurrentUserTasks = () =>
  http.get("/user/tasks", { headers: authHeader() });

const getRecentTasks = (limit) => {
  const url = limit
    ? `/tasks/user/recent?limit=${limit}`
    : "/tasks/user/recent";
  return http.get(url, { headers: authHeader() });
};

const get = (id) => http.get(`/tasks/${id}`, { headers: authHeader() });

const create = (data) => http.post("/tasks", data, { headers: authHeader() });

const update = (id, data) =>
  http.put(`/tasks/${id}`, data, { headers: authHeader() });

const remove = (id) => http.delete(`/tasks/${id}`, { headers: authHeader() });

const removeAll = () => http.delete(`/tasks`, { headers: authHeader() });

const findByDesc = (desc) =>
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
  getRecentTasks,
  downloadAllTasks,
};

export default TaskService;
