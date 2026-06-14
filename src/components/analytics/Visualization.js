import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchCompanyPerformance,
  fetchStaffPerformance,
  fetchClientDelivery,
  fetchMyPerformance,
  fetchMyClientDelivery,
} from "../../slices/analytics";

const COLORS = [
  "#0F172A",
  "#2563EB",
  "#059669",
  "#EF4444",
  "#6366F1",
  "#0D9488",
  "#D97706",
  "#1E293B",
];

const STATUS_COLORS = {
  todo: "#64748B",
  "in-progress": "#2563EB",
  completed: "#059669",
};

function formatMinutes(mins) {
  if (!mins) return "0h";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Default date range: last 30 days
function defaultDates() {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  return { dateFrom: from, dateTo: to };
}

const Visualization = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const {
    company,
    staff,
    clientDelivery,
    myPerformance,
    myClientDelivery,
    loading,
    error,
  } = useSelector((state) => state.analytics);
  const dispatch = useDispatch();

  // Role check
  const isAdminOrAbove =
    currentUser &&
    (currentUser.roles.includes("ROLE_ADMIN") ||
      currentUser.roles.includes("ROLE_SUPERADMIN"));

  // Gate: feature flag must be on
  const flagEnabled = currentUser?.featureFlags?.visualization;

  const [activeTab, setActiveTab] = useState(
    isAdminOrAbove ? "company" : "myPerformance",
  );
  const [dateFrom, setDateFrom] = useState(defaultDates().dateFrom);
  const [dateTo, setDateTo] = useState(defaultDates().dateTo);
  const [groupBy, setGroupBy] = useState("day");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  const loadData = useCallback(() => {
    const params = { dateFrom, dateTo };
    if (activeTab === "company") {
      dispatch(fetchCompanyPerformance({ ...params, groupBy }));
    } else if (activeTab === "staff") {
      dispatch(
        fetchStaffPerformance({
          ...params,
          ...(selectedUserId ? { userId: selectedUserId } : {}),
        }),
      );
    } else if (activeTab === "client") {
      dispatch(
        fetchClientDelivery({
          ...params,
          ...(selectedClientId ? { clientId: selectedClientId } : {}),
        }),
      );
    } else if (activeTab === "myPerformance") {
      dispatch(fetchMyPerformance({ ...params, groupBy }));
    } else if (activeTab === "myClients") {
      dispatch(
        fetchMyClientDelivery({
          ...params,
          ...(selectedClientId ? { clientId: selectedClientId } : {}),
        }),
      );
    }
  }, [
    activeTab,
    dateFrom,
    dateTo,
    groupBy,
    selectedUserId,
    selectedClientId,
    dispatch,
  ]);

  useEffect(() => {
    if (flagEnabled) {
      loadData();
    }
  }, [flagEnabled, loadData]);

  if (!currentUser || !flagEnabled) {
    return <Redirect to="/" />;
  }

  const renderFilters = () => (
    <div className="viz-filters">
      <div className="viz-filter-group">
        <label htmlFor="viz-date-from">From</label>
        <input
          id="viz-date-from"
          type="date"
          className="form-control form-control-sm"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </div>
      <div className="viz-filter-group">
        <label htmlFor="viz-date-to">To</label>
        <input
          id="viz-date-to"
          type="date"
          className="form-control form-control-sm"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
      {(activeTab === "company" || activeTab === "myPerformance") && (
        <div className="viz-filter-group">
          <label htmlFor="viz-group-by">Group by</label>
          <select
            id="viz-group-by"
            className="form-control form-control-sm"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      )}
      {activeTab === "staff" && staff?.staff && (
        <div className="viz-filter-group">
          <label htmlFor="viz-staff">Staff member</label>
          <select
            id="viz-staff"
            className="form-control form-control-sm"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">All Staff</option>
            {staff.staff.map((s) => (
              <option key={s.userId} value={s.userId}>
                {s.username}
              </option>
            ))}
          </select>
        </div>
      )}
      {activeTab === "client" && clientDelivery?.clients && (
        <div className="viz-filter-group">
          <label htmlFor="viz-client">Client</label>
          <select
            id="viz-client"
            className="form-control form-control-sm"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">All Clients</option>
            {clientDelivery.clients.map((c) => (
              <option key={c.clientId} value={c.clientId}>
                {c.clientName}
              </option>
            ))}
          </select>
        </div>
      )}
      {activeTab === "myClients" && myClientDelivery?.clients && (
        <div className="viz-filter-group">
          <label htmlFor="viz-my-client">Client</label>
          <select
            id="viz-my-client"
            className="form-control form-control-sm"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">All Clients</option>
            {myClientDelivery.clients.map((c) => (
              <option key={c.clientId} value={c.clientId}>
                {c.clientName}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        className="btn btn-sm btn-primary viz-apply-btn"
        onClick={loadData}
      >
        Apply
      </button>
    </div>
  );

  const renderCompanyTab = () => {
    if (!company) return null;

    return (
      <div className="viz-charts">
        {/* KPI Cards */}
        <div className="viz-kpi-row">
          <div className="viz-kpi-card">
            <div className="viz-kpi-num">{company.totals.totalTasks}</div>
            <div className="viz-kpi-label">Total Tasks</div>
          </div>
          <div className="viz-kpi-card">
            <div className="viz-kpi-num">
              {formatMinutes(company.totals.totalMinutes)}
            </div>
            <div className="viz-kpi-label">Total Time</div>
          </div>
          <div className="viz-kpi-card">
            <div className="viz-kpi-num">
              {company.statusBreakdown.find((s) => s.status === "completed")
                ?.count || 0}
            </div>
            <div className="viz-kpi-label">Completed</div>
          </div>
          <div className="viz-kpi-card">
            <div className="viz-kpi-num">
              {company.statusBreakdown.find((s) => s.status === "in-progress")
                ?.count || 0}
            </div>
            <div className="viz-kpi-label">In Progress</div>
          </div>
        </div>

        {/* Tasks Over Time (Bar + Line) */}
        <div className="viz-chart-card">
          <h6>Tasks & Hours Over Time</h6>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={company.tasksOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) =>
                  name === "Hours" ? formatMinutes(value * 60) : value
                }
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="taskCount"
                name="Tasks"
                fill="#4a90d9"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalMinutes"
                name="Minutes"
                stroke="#f0883e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="viz-chart-row">
          {/* Status Pie */}
          <div className="viz-chart-card viz-chart-half">
            <h6>Status Distribution</h6>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={company.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {company.statusBreakdown.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || "#ccc"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="viz-chart-card viz-chart-half">
            <h6>Billing Category Breakdown</h6>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={company.categoryBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="billingCategory"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Tasks"
                  fill="#50c878"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderStaffTab = () => {
    if (!staff) return null;

    return (
      <div className="viz-charts">
        {/* Staff Comparison Bar Chart */}
        <div className="viz-chart-card">
          <h6>Staff Performance Comparison</h6>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={staff.staff}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="username" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="completedCount"
                name="Completed"
                stackId="a"
                fill="#50c878"
              />
              <Bar
                dataKey="inProgressCount"
                name="In Progress"
                stackId="a"
                fill="#4a90d9"
              />
              <Bar dataKey="todoCount" name="Todo" stackId="a" fill="#6c757d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Staff Table */}
        <div className="viz-chart-card">
          <h6>Staff Details</h6>
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th className="text-center">Tasks</th>
                  <th className="text-center">Completed</th>
                  <th className="text-center">In Progress</th>
                  <th className="text-center">Todo</th>
                  <th className="text-right">Time Spent</th>
                </tr>
              </thead>
              <tbody>
                {staff.staff.map((s) => (
                  <tr key={s.userId}>
                    <td>
                      <strong>{s.username}</strong>
                    </td>
                    <td className="text-center">{s.taskCount}</td>
                    <td className="text-center text-success">
                      {s.completedCount}
                    </td>
                    <td className="text-center text-primary">
                      {s.inProgressCount}
                    </td>
                    <td className="text-center text-secondary">
                      {s.todoCount}
                    </td>
                    <td className="text-right">
                      {formatMinutes(s.totalMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Trend (if specific user selected) */}
        {staff.dailyTrend && staff.dailyTrend.length > 0 && (
          <div className="viz-chart-card">
            <h6>Daily Trend</h6>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={staff.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="taskCount"
                  name="Tasks"
                  stroke="#4a90d9"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="totalMinutes"
                  name="Minutes"
                  stroke="#f0883e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderClientTab = () => {
    if (!clientDelivery) return null;

    return (
      <div className="viz-charts">
        {/* Client Comparison */}
        <div className="viz-chart-card">
          <h6>Work Delivered Per Client</h6>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientDelivery.clients}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="clientName" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="taskCount"
                name="Tasks"
                fill="#4a90d9"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="completedCount"
                name="Completed"
                fill="#50c878"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalMinutes"
                name="Minutes"
                stroke="#f0883e"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Client Table */}
        <div className="viz-chart-card">
          <h6>Client Summary</h6>
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead>
                <tr>
                  <th>Client</th>
                  <th className="text-center">Total Tasks</th>
                  <th className="text-center">Completed</th>
                  <th className="text-right">Time Spent</th>
                </tr>
              </thead>
              <tbody>
                {clientDelivery.clients.map((c) => (
                  <tr key={c.clientId}>
                    <td>
                      <strong>{c.clientName}</strong>
                    </td>
                    <td className="text-center">{c.taskCount}</td>
                    <td className="text-center text-success">
                      {c.completedCount}
                    </td>
                    <td className="text-right">
                      {formatMinutes(c.totalMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trend (if specific client selected) */}
        {clientDelivery.monthlyTrend &&
          clientDelivery.monthlyTrend.length > 0 && (
            <div className="viz-chart-card">
              <h6>Monthly Trend</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={clientDelivery.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="taskCount"
                    name="Tasks"
                    stroke="#4a90d9"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalMinutes"
                    name="Minutes"
                    stroke="#f0883e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        {/* Task Type Breakdown (if specific client selected) */}
        {clientDelivery.taskTypeBreakdown &&
          clientDelivery.taskTypeBreakdown.length > 0 && (
            <div className="viz-chart-card">
              <h6>Task Type Breakdown</h6>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={clientDelivery.taskTypeBreakdown}
                    dataKey="count"
                    nameKey="taskType"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ taskType, count }) => `${taskType}: ${count}`}
                  >
                    {clientDelivery.taskTypeBreakdown.map((entry, idx) => (
                      <Cell
                        key={entry.taskType}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
      </div>
    );
  };

  const renderMyPerformanceTab = () => {
    if (!myPerformance) return null;

    return (
      <div className="viz-charts">
        {/* KPI Cards */}
        <div className="viz-kpi-row">
          <div className="viz-kpi-card">
            <div className="viz-kpi-num">{myPerformance.totals.totalTasks}</div>
            <div className="viz-kpi-label">My Tasks</div>
          </div>
          <div className="viz-kpi-card">
            <div className="viz-kpi-num">
              {formatMinutes(myPerformance.totals.totalMinutes)}
            </div>
            <div className="viz-kpi-label">Time Logged</div>
          </div>
          <div className="viz-kpi-card">
            <div className="viz-kpi-num">
              {myPerformance.statusBreakdown.find(
                (s) => s.status === "completed",
              )?.count || 0}
            </div>
            <div className="viz-kpi-label">Completed</div>
          </div>
          <div className="viz-kpi-card">
            <div className="viz-kpi-num">
              {myPerformance.statusBreakdown.find(
                (s) => s.status === "in-progress",
              )?.count || 0}
            </div>
            <div className="viz-kpi-label">In Progress</div>
          </div>
        </div>

        {/* Tasks Over Time */}
        <div className="viz-chart-card">
          <h6>My Tasks & Hours Over Time</h6>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={myPerformance.tasksOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) =>
                  name === "Hours" ? formatMinutes(value * 60) : value
                }
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="taskCount"
                name="Tasks"
                fill="#4a90d9"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalMinutes"
                name="Minutes"
                stroke="#f0883e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="viz-chart-row">
          {/* Status Pie */}
          <div className="viz-chart-card viz-chart-half">
            <h6>My Status Distribution</h6>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={myPerformance.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {myPerformance.statusBreakdown.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || "#ccc"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="viz-chart-card viz-chart-half">
            <h6>My Billing Category Breakdown</h6>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={myPerformance.categoryBreakdown}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="billingCategory"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Tasks"
                  fill="#50c878"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderMyClientsTab = () => {
    if (!myClientDelivery) return null;

    return (
      <div className="viz-charts">
        {/* My Client Contribution */}
        <div className="viz-chart-card">
          <h6>My Work Per Client</h6>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={myClientDelivery.clients}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="clientName" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="taskCount"
                name="Tasks"
                fill="#4a90d9"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="completedCount"
                name="Completed"
                fill="#50c878"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalMinutes"
                name="Minutes"
                stroke="#f0883e"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* My Client Table */}
        <div className="viz-chart-card">
          <h6>My Client Summary</h6>
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead>
                <tr>
                  <th>Client</th>
                  <th className="text-center">My Tasks</th>
                  <th className="text-center">Completed</th>
                  <th className="text-right">Time Spent</th>
                </tr>
              </thead>
              <tbody>
                {myClientDelivery.clients.map((c) => (
                  <tr key={c.clientId}>
                    <td>
                      <strong>{c.clientName}</strong>
                    </td>
                    <td className="text-center">{c.taskCount}</td>
                    <td className="text-center text-success">
                      {c.completedCount}
                    </td>
                    <td className="text-right">
                      {formatMinutes(c.totalMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trend (if specific client selected) */}
        {myClientDelivery.monthlyTrend &&
          myClientDelivery.monthlyTrend.length > 0 && (
            <div className="viz-chart-card">
              <h6>Monthly Trend</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={myClientDelivery.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="taskCount"
                    name="Tasks"
                    stroke="#4a90d9"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalMinutes"
                    name="Minutes"
                    stroke="#f0883e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        {/* Task Type Breakdown (if specific client selected) */}
        {myClientDelivery.taskTypeBreakdown &&
          myClientDelivery.taskTypeBreakdown.length > 0 && (
            <div className="viz-chart-card">
              <h6>Task Type Breakdown</h6>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={myClientDelivery.taskTypeBreakdown}
                    dataKey="count"
                    nameKey="taskType"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ taskType, count }) => `${taskType}: ${count}`}
                  >
                    {myClientDelivery.taskTypeBreakdown.map((entry, idx) => (
                      <Cell
                        key={entry.taskType}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="container-fluid px-4">
      <div className="viz-header">
        <h4 className="viz-title">
          <span className="viz-title-icon">&#128200;</span> Performance
          Dashboard
        </h4>
      </div>

      {/* Tab Navigation */}
      <div className="viz-tabs">
        {isAdminOrAbove && (
          <>
            <button
              className={`viz-tab ${activeTab === "company" ? "viz-tab-active" : ""}`}
              onClick={() => setActiveTab("company")}
            >
              &#127970; Company
            </button>
            <button
              className={`viz-tab ${activeTab === "staff" ? "viz-tab-active" : ""}`}
              onClick={() => setActiveTab("staff")}
            >
              &#128101; Staff
            </button>
            <button
              className={`viz-tab ${activeTab === "client" ? "viz-tab-active" : ""}`}
              onClick={() => setActiveTab("client")}
            >
              &#128188; Clients
            </button>
          </>
        )}
        <button
          className={`viz-tab ${activeTab === "myPerformance" ? "viz-tab-active" : ""}`}
          onClick={() => setActiveTab("myPerformance")}
        >
          &#128200; My Performance
        </button>
        <button
          className={`viz-tab ${activeTab === "myClients" ? "viz-tab-active" : ""}`}
          onClick={() => setActiveTab("myClients")}
        >
          &#128188; My Clients
        </button>
      </div>

      {renderFilters()}

      {loading && (
        <div className="text-center py-4">
          <span className="spinner-border spinner-border-sm" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 mt-2">
          {typeof error === "string" ? error : "Error loading analytics data."}
        </div>
      )}

      {!loading && activeTab === "company" && renderCompanyTab()}
      {!loading && activeTab === "staff" && renderStaffTab()}
      {!loading && activeTab === "client" && renderClientTab()}
      {!loading && activeTab === "myPerformance" && renderMyPerformanceTab()}
      {!loading && activeTab === "myClients" && renderMyClientsTab()}
    </div>
  );
};

export default Visualization;
