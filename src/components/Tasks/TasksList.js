import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { retrieveClients } from "../../slices/clients";
import {
  deleteAllTasks,
  deleteTask,
  retrieveTasks,
  downloadTasks,
} from "../../slices/tasks";
import { retrieveReviewers, retrieveAllUsers } from "../../slices/users";
import Pagination, { ITEMS_PER_PAGE } from "../Pagination";
import MultiSelectDropdown from "../MultiSelectDropdown";

const truncate = (text, max = 80) =>
  text && text.length > max ? text.slice(0, max) + "…" : text;

const StatusBadge = ({ completed }) => (
  <span
    className={completed ? "status-dot completed" : "status-dot pending"}
    title={completed ? "Completed" : "In-Progress"}
  >
    {completed ? "✓" : "●"}
  </span>
);

const TasksList = () => {
  const allTasks = useSelector((state) => state.tasks);
  const clients = useSelector((state) => state.client);
  const { reviewers, users } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [showUserCol, setShowUserCol] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Filter state
  const [filterDesc, setFilterDesc] = useState("");
  const [filterClient, setFilterClient] = useState([]);
  const [filterUser, setFilterUser] = useState([]);
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterType, setFilterType] = useState([]);
  const [filterReviewer, setFilterReviewer] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Build lookup maps for O(1) name resolution
  const clientMap = useMemo(() => {
    const map = {};
    if (clients)
      clients.forEach((c) => {
        map[c.id] = c.name;
      });
    return map;
  }, [clients]);

  const reviewerMap = useMemo(() => {
    const map = {};
    if (reviewers)
      reviewers.forEach((r) => {
        map[r.id] = r.username;
      });
    return map;
  }, [reviewers]);

  const userMap = useMemo(() => {
    const map = {};
    if (users)
      users.forEach((u) => {
        map[u.id] = u.username;
      });
    return map;
  }, [users]);

  // Derived: active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterDesc) count++;
    if (filterClient.length) count++;
    if (filterUser.length) count++;
    if (filterCategory.length) count++;
    if (filterType.length) count++;
    if (filterReviewer.length) count++;
    if (filterStatus.length) count++;
    if (filterDateFrom) count++;
    if (filterDateTo) count++;
    return count;
  }, [
    filterDesc,
    filterClient,
    filterUser,
    filterCategory,
    filterType,
    filterReviewer,
    filterStatus,
    filterDateFrom,
    filterDateTo,
  ]);

  // Filtered tasks
  const tasks = useMemo(() => {
    if (!allTasks) return [];
    return allTasks.filter((t) => {
      if (
        filterDesc &&
        !t.description?.toLowerCase().includes(filterDesc.toLowerCase())
      )
        return false;
      if (filterClient.length && !filterClient.includes(String(t.clientId)))
        return false;
      if (filterUser.length && !filterUser.includes(String(t.userId)))
        return false;
      if (filterCategory.length && !filterCategory.includes(t.billingCategory))
        return false;
      if (filterType.length && !filterType.includes(t.taskType)) return false;
      if (
        filterReviewer.length &&
        !filterReviewer.includes(String(t.reviewerId))
      )
        return false;
      if (filterStatus.length) {
        const status = t.completed ? "completed" : "in-progress";
        if (!filterStatus.includes(status)) return false;
      }
      if (filterDateFrom && moment(t.date).isBefore(filterDateFrom, "day"))
        return false;
      if (filterDateTo && moment(t.date).isAfter(filterDateTo, "day"))
        return false;
      return true;
    });
  }, [
    allTasks,
    filterDesc,
    filterClient,
    filterUser,
    filterCategory,
    filterType,
    filterReviewer,
    filterStatus,
    filterDateFrom,
    filterDateTo,
  ]);

  // Sorted tasks
  const sortedTasks = useMemo(() => {
    if (!sortColumn) return tasks;
    const sorted = [...tasks].sort((a, b) => {
      let valA, valB;
      switch (sortColumn) {
        case "date":
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
          break;
        case "time":
          valA = a.minutesSpent || 0;
          valB = b.minutesSpent || 0;
          break;
        case "client":
          valA = (clientMap[a.clientId] || "").toLowerCase();
          valB = (clientMap[b.clientId] || "").toLowerCase();
          break;
        case "type":
          valA = (a.taskType || "").toLowerCase();
          valB = (b.taskType || "").toLowerCase();
          break;
        default:
          return 0;
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [tasks, sortColumn, sortDirection, clientMap]);

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const SortArrow = ({ col }) => {
    if (sortColumn !== col) return <span className="sort-icon">⇅</span>;
    return (
      <span className="sort-icon active">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  // Unique task types from data
  const taskTypes = useMemo(() => {
    if (!allTasks) return [];
    const types = new Set(allTasks.map((t) => t.taskType).filter(Boolean));
    return [...types].sort();
  }, [allTasks]);

  // Unique billing categories from data
  const billingCategories = useMemo(() => {
    if (!allTasks) return [];
    const cats = new Set(
      allTasks.map((t) => t.billingCategory).filter(Boolean),
    );
    return [...cats].sort();
  }, [allTasks]);

  const initFetch = useCallback(() => {
    dispatch(retrieveClients());
    dispatch(retrieveReviewers());
    dispatch(retrieveAllUsers());
    dispatch(retrieveTasks());
  }, [dispatch]);

  useEffect(() => {
    setShowUserCol(currentUser && currentUser.roles.includes("ROLE_ADMIN"));
  }, [currentUser]);

  useEffect(() => {
    initFetch();
  }, [initFetch]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterDesc,
    filterClient,
    filterUser,
    filterCategory,
    filterType,
    filterReviewer,
    filterStatus,
    filterDateFrom,
    filterDateTo,
  ]);

  const clearAllFilters = () => {
    setFilterDesc("");
    setFilterClient([]);
    setFilterUser([]);
    setFilterCategory([]);
    setFilterType([]);
    setFilterReviewer([]);
    setFilterStatus([]);
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const removeTask = (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    dispatch(deleteTask({ id }))
      .unwrap()
      .catch((e) => console.log(e));
  };

  const removeAllTasks = () => {
    if (!window.confirm("Are you sure you want to delete all tasks?")) return;
    dispatch(deleteAllTasks()).catch((e) => console.log(e));
  };

  const download = () => {
    const dataToExport = sortedTasks.length > 0 ? sortedTasks : tasks;
    if (!dataToExport || dataToExport.length === 0) return;

    const escCsv = (val) => {
      const str = String(val ?? "");
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const headers = [
      "Date",
      "Client",
      "Type",
      "Category",
      "Description",
      "Time (min)",
      "Status",
      "Approver",
      ...(showUserCol ? ["User"] : []),
    ];

    const rows = dataToExport.map((t) => [
      moment(t.date).format("YYYY-MM-DD"),
      escCsv(clientMap[t.clientId] || ""),
      escCsv(t.taskType || ""),
      escCsv(t.billingCategory || ""),
      escCsv(t.description || ""),
      t.minutesSpent || 0,
      t.completed ? "Completed" : "In-Progress",
      escCsv(reviewerMap[t.reviewerId] || "NA"),
      ...(showUserCol ? [escCsv(userMap[t.userId] || "")] : []),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tasks_export_${moment().format("YYYYMMDD_HHmmss")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tasks-container">
      {/* Header */}
      <div className="tasks-header">
        <h4 className="tasks-title">Tasks</h4>
        <div className="tasks-actions">
          <button
            className={`btn btn-sm ${showFilters ? "btn-secondary" : "btn-outline-secondary"}`}
            type="button"
            onClick={() => setShowFilters(!showFilters)}
          >
            &#9776; Filters
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            type="button"
            onClick={download}
          >
            &#128229; Export
          </button>
          {allTasks && allTasks.length > 0 && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={removeAllTasks}
            >
              Remove All
            </button>
          )}
        </div>
      </div>

      {/* Active filters bar (visible when panel closed) */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="active-filters-bar">
          <span className="filter-result-count">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            &middot; {tasks.length} of {allTasks?.length || 0} tasks
          </span>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={clearAllFilters}
          >
            ✕ Clear All
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            {/* Description */}
            <div className="filter-field">
              <label>Description</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search description..."
                value={filterDesc}
                onChange={(e) => setFilterDesc(e.target.value)}
              />
            </div>

            {/* Client */}
            <div className="filter-field">
              <MultiSelectDropdown
                label="Client"
                placeholder="All Clients"
                options={(clients || []).map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                selected={filterClient}
                onChange={setFilterClient}
              />
            </div>

            {/* User (admin only) */}
            {showUserCol && (
              <div className="filter-field">
                <MultiSelectDropdown
                  label="User"
                  placeholder="All Users"
                  options={(users || []).map((u) => ({
                    value: u.id,
                    label: u.username,
                  }))}
                  selected={filterUser}
                  onChange={setFilterUser}
                />
              </div>
            )}

            {/* Task Type */}
            <div className="filter-field">
              <MultiSelectDropdown
                label="Task Type"
                placeholder="All Types"
                options={taskTypes.map((t) => ({ value: t, label: t }))}
                selected={filterType}
                onChange={setFilterType}
              />
            </div>

            {/* Billing Category */}
            <div className="filter-field">
              <MultiSelectDropdown
                label="Category"
                placeholder="All Categories"
                options={billingCategories.map((c) => ({ value: c, label: c }))}
                selected={filterCategory}
                onChange={setFilterCategory}
              />
            </div>

            {/* Reviewer */}
            <div className="filter-field">
              <MultiSelectDropdown
                label="Approver"
                placeholder="All Approvers"
                options={(reviewers || []).map((r) => ({
                  value: r.id,
                  label: r.username,
                }))}
                selected={filterReviewer}
                onChange={setFilterReviewer}
              />
            </div>

            {/* Status */}
            <div className="filter-field">
              <MultiSelectDropdown
                label="Status"
                placeholder="All Statuses"
                options={[
                  { value: "completed", label: "Completed" },
                  { value: "in-progress", label: "In-Progress" },
                ]}
                selected={filterStatus}
                onChange={setFilterStatus}
              />
            </div>

            {/* Date From */}
            <div className="filter-field">
              <label>Date From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="filter-field">
              <label>Date To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="filter-actions">
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
              <span className="filter-result-count">
                {tasks.length} of {allTasks?.length || 0} tasks match
              </span>
            </div>
          )}
        </div>
      )}

      {/* Top Pagination */}
      {sortedTasks && sortedTasks.length > 0 && (
        <div className="tasks-footer tasks-footer-top">
          <div className="tasks-summary">
            <span>
              Showing{" "}
              <strong>
                {Math.min(
                  (currentPage - 1) * ITEMS_PER_PAGE + 1,
                  sortedTasks.length,
                )}
                –{Math.min(currentPage * ITEMS_PER_PAGE, sortedTasks.length)}
              </strong>{" "}
              of <strong>{sortedTasks.length}</strong> task
              {sortedTasks.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={sortedTasks.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Table */}
      <div className="tasks-table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th className="th-num">#</th>
                {showUserCol && <th className="th-user">User</th>}
                <th
                  className="th-client sortable"
                  onClick={() => handleSort("client")}
                >
                  Client <SortArrow col="client" />
                </th>
                <th
                  className="th-type sortable"
                  onClick={() => handleSort("type")}
                >
                  Type <SortArrow col="type" />
                </th>
                <th className="th-category">Category</th>
                <th className="th-desc">Description</th>
                <th
                  className="th-date sortable"
                  onClick={() => handleSort("date")}
                >
                  Date <SortArrow col="date" />
                </th>
                <th
                  className="th-time sortable"
                  onClick={() => handleSort("time")}
                >
                  Time <SortArrow col="time" />
                </th>
                <th className="th-status">Status</th>
                <th className="th-reviewer">Approver</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks
                .slice(
                  (currentPage - 1) * ITEMS_PER_PAGE,
                  currentPage * ITEMS_PER_PAGE,
                )
                .map((task, index) => (
                  <tr
                    key={task.id || index}
                    className={task.completed ? "row-completed" : "row-pending"}
                  >
                    <td className="td-num" data-label="#">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    {showUserCol && (
                      <td
                        className="td-user"
                        data-label="User"
                      >
                        <span className="td-user-text" title={userMap[task.userId] || ""}>
                          {userMap[task.userId] || "—"}
                        </span>
                      </td>
                    )}
                    <td className="td-client" data-label="Client">
                      <span className="td-client-text" title={clientMap[task.clientId] || ""}>
                        {clientMap[task.clientId] || "—"}
                      </span>
                    </td>
                    <td
                      className="td-type"
                      data-label="Type"
                      title={task.taskType || ""}
                    >
                      {task.taskType || "—"}
                    </td>
                    <td
                      className="td-category"
                      data-label="Category"
                      title={task.billingCategory || ""}
                    >
                      {task.billingCategory || "—"}
                    </td>
                    <td className="td-desc" data-label="Description">
                      <span className="td-desc-text" title={task.description || ""}>
                        {task.description}
                      </span>
                    </td>
                    <td
                      className="td-date"
                      data-label="Date"
                      title={moment(task.date).format("DD MMM YYYY")}
                    >
                      {moment(task.date).format("DD MMM YYYY")}
                    </td>
                    <td
                      className="td-time"
                      data-label="Time"
                      title={`${task.minutesSpent} min`}
                    >
                      {task.minutesSpent} min
                    </td>
                    <td className="td-status" data-label="Status">
                      <StatusBadge completed={task.completed} />
                    </td>
                    <td
                      className="td-reviewer"
                      data-label="Approver"
                      title={reviewerMap[task.reviewerId] || "NA"}
                    >
                      {reviewerMap[task.reviewerId] || (
                        <span
                          className="text-muted"
                          style={{ fontStyle: "italic", fontSize: "0.8rem" }}
                        >
                          NA
                        </span>
                      )}
                    </td>
                    <td className="td-actions" data-label="Actions">
                      <Link
                        to={"/tasks/" + task.id}
                        className="btn btn-sm btn-warning mr-1"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => removeTask(task.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

      {/* Empty-state message inside table */}
      {sortedTasks.length === 0 && (
        <div className="tasks-empty">
          {activeFilterCount > 0 ? (
            <>
              <p>No tasks match your filters.</p>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={clearAllFilters}
              >
                Clear Filters
              </button>
            </>
          ) : (
            <p>No tasks yet. Start by adding a new task.</p>
          )}
        </div>
      )}

      {/* Summary & Pagination */}
      {sortedTasks && sortedTasks.length > 0 && (
        <div className="tasks-footer">
          <div className="tasks-summary">
            <span>
              Showing{" "}
              <strong>
                {Math.min(
                  (currentPage - 1) * ITEMS_PER_PAGE + 1,
                  sortedTasks.length,
                )}
                –{Math.min(currentPage * ITEMS_PER_PAGE, sortedTasks.length)}
              </strong>{" "}
              of <strong>{sortedTasks.length}</strong> task
              {sortedTasks.length !== 1 ? "s" : ""}
            </span>
            <span
              title={`${sortedTasks.reduce((sum, t) => sum + (t.minutesSpent || 0), 0)} minutes total`}
            >
              Total:{" "}
              <strong>
                {(() => {
                  const totalMin = sortedTasks.reduce(
                    (sum, t) => sum + (t.minutesSpent || 0),
                    0,
                  );
                  const h = Math.floor(totalMin / 60);
                  const m = totalMin % 60;
                  if (h === 0) return `${m}m`;
                  if (m === 0) return `${h}h`;
                  return `${h}h ${m}m`;
                })()}
              </strong>
            </span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={sortedTasks.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default TasksList;
