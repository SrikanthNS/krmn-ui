import http from "../http-common";
import authHeader from "./auth-header";

const getCompanyPerformance = (params = {}) => {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.groupBy) query.set("groupBy", params.groupBy);
  return http.get(`/analytics/company?${query.toString()}`, {
    headers: authHeader(),
  });
};

const getStaffPerformance = (params = {}) => {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.userId) query.set("userId", params.userId);
  return http.get(`/analytics/staff?${query.toString()}`, {
    headers: authHeader(),
  });
};

const getClientDelivery = (params = {}) => {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.clientId) query.set("clientId", params.clientId);
  return http.get(`/analytics/client?${query.toString()}`, {
    headers: authHeader(),
  });
};

const getMyPerformance = (params = {}) => {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.groupBy) query.set("groupBy", params.groupBy);
  return http.get(`/analytics/my/performance?${query.toString()}`, {
    headers: authHeader(),
  });
};

const getMyClientDelivery = (params = {}) => {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.clientId) query.set("clientId", params.clientId);
  return http.get(`/analytics/my/clients?${query.toString()}`, {
    headers: authHeader(),
  });
};

const AnalyticsService = {
  getCompanyPerformance,
  getStaffPerformance,
  getClientDelivery,
  getMyPerformance,
  getMyClientDelivery,
};

export default AnalyticsService;
