import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import TaskDataService from "../../services/task.service";
import { retrieveClients } from "../../slices/clients";
import { deleteTask, retrieveTasks } from "../../slices/tasks";
import { retrieveReviewers, retrieveAllUsers } from "../../slices/users";
import Pagination, {
  DEFAULT_ITEMS_PER_PAGE,
  PageSizeSelect,
} from "../Pagination";
import MultiSelectDropdown from "../MultiSelectDropdown";

const StatusBadge = React.memo(({ task }) => {
  const status = task.status || (task.completed ? "completed" : "in-progress");
  const map = {
    todo: { cls: "status-badge todo", label: "Todo", icon: "○" },
    "in-progress": {
      cls: "status-badge in-progress",
      label: "In-Progress",
      icon: "●",
    },
    completed: { cls: "status-badge completed", label: "Completed", icon: "✓" },
  };
  const s = map[status] || map["in-progress"];
  return (
    <span className={s.cls}>
      <span className="status-badge-icon">{s.icon}</span>
      <span className="status-badge-label">{s.label}</span>
    </span>
  );
});

const TasksList = () => {
  const {
    rows: tasks = [],
    totalItems = 0,
    totalPages = 0,
    statusCounts = {},
  } = useSelector((state) => state.tasks);
  const { rows: clientRows = [] } = useSelector((state) => state.client);
  const { reviewers = [], users = [] } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const prefEnabled = currentUser?.featureFlags?.user_preferences;
  const userItemsPerPage = prefEnabled
    ? currentUser?.itemsPerPage || DEFAULT_ITEMS_PER_PAGE
    : DEFAULT_ITEMS_PER_PAGE;
  const [sessionPageSize, setSessionPageSize] = useState(null);
  const itemsPerPage = prefEnabled
    ? sessionPageSize || userItemsPerPage
    : DEFAULT_ITEMS_PER_PAGE;
  const [showUserCol, setShowUserCol] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

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
    if (clientRows)
      clientRows.forEach((c) => {
        map[c.id] = c.name;
      });
    return map;
  }, [clientRows]);

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

  // Build server params and fetch
  const fetchTasks = useCallback(
    (page) => {
      const params = {
        page: page || currentPage,
        size: itemsPerPage,
        sortField: sortColumn,
        sortDir: sortDirection,
      };
      if (filterDesc) params.description = filterDesc;
      if (filterClient.length) params.clientId = filterClient.join(",");
      if (filterUser.length) params.userId = filterUser.join(",");
      if (filterCategory.length)
        params.billingCategory = filterCategory.join(",");
      if (filterType.length) params.taskType = filterType.join(",");
      if (filterReviewer.length) params.reviewerId = filterReviewer.join(",");
      if (filterStatus.length) params.status = filterStatus.join(",");
      if (filterDateFrom) params.dateFrom = filterDateFrom;
      if (filterDateTo) params.dateTo = filterDateTo;
      dispatch(retrieveTasks(params));
    },
    [
      dispatch,
      currentPage,
      itemsPerPage,
      sortColumn,
      sortDirection,
      filterDesc,
      filterClient,
      filterUser,
      filterCategory,
      filterType,
      filterReviewer,
      filterStatus,
      filterDateFrom,
      filterDateTo,
    ],
  );

  // Fetch dropdown data (full lists for filters)
  useEffect(() => {
    dispatch(retrieveClients({ size: 0 }));
    dispatch(retrieveReviewers());
    dispatch(retrieveAllUsers({ size: 0 }));
  }, [dispatch]);

  useEffect(() => {
    setShowUserCol(currentUser && currentUser.roles.includes("ROLE_ADMIN"));
  }, [currentUser]);

  // Fetch tasks whenever page, filters, sort, or pageSize changes
  useEffect(() => {
    fetchTasks(currentPage);
  }, [fetchTasks, currentPage]);

  // Reset to page 1 when any filter, sort, or pageSize changes
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
    sortColumn,
    sortDirection,
    itemsPerPage,
  ]);

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

  // Unique task types & categories from current page data + full list needs
  // These come from our loaded dropdown data — we use full client list
  const taskTypes = useMemo(() => {
    // We'll derive these from the visible rows for now
    // For a perfect solution you'd have a separate endpoint
    if (!tasks) return [];
    const types = new Set(tasks.map((t) => t.taskType).filter(Boolean));
    return [...types].sort();
  }, [tasks]);

  const billingCategories = useMemo(() => {
    if (!tasks) return [];
    const cats = new Set(tasks.map((t) => t.billingCategory).filter(Boolean));
    return [...cats].sort();
  }, [tasks]);

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
      .then(() => {
        fetchTasks(currentPage);
      })
      .catch(() => {});
  };

  const download = () => {
    const params = {
      sortField: sortColumn,
      sortDir: sortDirection,
    };
    if (filterDesc) params.description = filterDesc;
    if (filterClient.length) params.clientId = filterClient.join(",");
    if (filterUser.length) params.userId = filterUser.join(",");
    if (filterCategory.length)
      params.billingCategory = filterCategory.join(",");
    if (filterType.length) params.taskType = filterType.join(",");
    if (filterReviewer.length) params.reviewerId = filterReviewer.join(",");
    if (filterStatus.length) params.status = filterStatus.join(",");
    if (filterDateFrom) params.dateFrom = filterDateFrom;
    if (filterDateTo) params.dateTo = filterDateTo;
    TaskDataService.downloadAllTasks(params);
  };

  return (
    <div className="tasks-container">
      {/* Header */}
      <div className="tasks-header">
        <h4 className="tasks-title">Tasks</h4>
        <div className="d-flex align-items-center gap-2 mr-auto ml-3">
          <span
            className={`status-badge todo${filterStatus.length === 1 && filterStatus[0] === "todo" ? " status-badge-active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() =>
              setFilterStatus((prev) =>
                prev.length === 1 && prev[0] === "todo" ? [] : ["todo"],
              )
            }
          >
            <span className="status-badge-icon">○</span>
            <span className="status-badge-label">
              Todo {statusCounts.todo || 0}
            </span>
          </span>
          <span
            className={`status-badge in-progress${filterStatus.length === 1 && filterStatus[0] === "in-progress" ? " status-badge-active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() =>
              setFilterStatus((prev) =>
                prev.length === 1 && prev[0] === "in-progress"
                  ? []
                  : ["in-progress"],
              )
            }
          >
            <span className="status-badge-icon">●</span>
            <span className="status-badge-label">
              In-Progress {statusCounts["in-progress"] || 0}
            </span>
          </span>
          <span
            className={`status-badge completed${filterStatus.length === 1 && filterStatus[0] === "completed" ? " status-badge-active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() =>
              setFilterStatus((prev) =>
                prev.length === 1 && prev[0] === "completed"
                  ? []
                  : ["completed"],
              )
            }
          >
            <span className="status-badge-icon">✓</span>
            <span className="status-badge-label">
              Completed {statusCounts.completed || 0}
            </span>
          </span>
        </div>
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
        </div>
      </div>

      {/* Active filters bar (visible when panel closed) */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="active-filters-bar">
          <span className="filter-result-count">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            &middot; {totalItems} tasks
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
                options={(clientRows || []).map((c) => ({
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
                  { value: "todo", label: "Todo" },
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
                {totalItems} tasks match
              </span>
            </div>
          )}
        </div>
      )}

      {/* Top Pagination */}
      {tasks && tasks.length > 0 && (
        <div
          className="tasks-footer tasks-footer-top"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.85rem" }}>
            Showing{" "}
            <strong>
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </strong>{" "}
            of <strong>{totalItems}</strong> task
            {totalItems !== 1 ? "s" : ""}
          </span>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
          {prefEnabled && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.85rem",
              }}
            >
              Show{" "}
              <PageSizeSelect
                value={itemsPerPage}
                onChange={(v) => {
                  setSessionPageSize(v);
                  setCurrentPage(1);
                }}
              />{" "}
              / page
            </span>
          )}
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
                onClick={() => handleSort("clientId")}
              >
                Client <SortArrow col="clientId" />
              </th>
              <th
                className="th-type sortable"
                onClick={() => handleSort("taskType")}
              >
                Type <SortArrow col="taskType" />
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
                onClick={() => handleSort("minutesSpent")}
              >
                Time <SortArrow col="minutesSpent" />
              </th>
              <th className="th-status">Status</th>
              <th className="th-reviewer">Approver</th>
              {showUserCol && <th className="th-user">Assigned By</th>}
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr
                key={task.id || index}
                className={
                  (task.status ||
                    (task.completed ? "completed" : "in-progress")) ===
                  "completed"
                    ? "row-completed"
                    : task.status === "todo"
                      ? "row-todo"
                      : "row-pending"
                }
              >
                <td className="td-num" data-label="#">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                {showUserCol && (
                  <td className="td-user" data-label="User">
                    <span
                      className="td-user-text"
                      title={userMap[task.userId] || ""}
                    >
                      {userMap[task.userId] || "—"}
                    </span>
                  </td>
                )}
                <td className="td-client" data-label="Client">
                  <span
                    className="td-client-text"
                    title={clientMap[task.clientId] || ""}
                  >
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
                  <StatusBadge task={task} />
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
                {showUserCol && (
                  <td className="td-user" data-label="Assigned By">
                    <span
                      className="td-user-text"
                      title={
                        task.assigner
                          ? task.assigner.username
                          : task.assignedBy
                            ? userMap[task.assignedBy] || ""
                            : "Self"
                      }
                    >
                      {task.assigner
                        ? task.assigner.username
                        : task.assignedBy
                          ? userMap[task.assignedBy] || "—"
                          : "Self"}
                    </span>
                  </td>
                )}
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
      {tasks.length === 0 && (
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
      {tasks && tasks.length > 0 && (
        <div
          className="tasks-footer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.85rem" }}>
            Showing{" "}
            <strong>
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </strong>{" "}
            of <strong>{totalItems}</strong> task
            {totalItems !== 1 ? "s" : ""}
            {" | "}
            <span
              title={`${tasks.reduce((sum, t) => sum + (t.minutesSpent || 0), 0)} minutes on this page`}
            >
              Page Total:{" "}
              <strong>
                {(() => {
                  const totalMin = tasks.reduce(
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
          </span>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
          {prefEnabled && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.85rem",
              }}
            >
              Show{" "}
              <PageSizeSelect
                value={itemsPerPage}
                onChange={(v) => {
                  setSessionPageSize(v);
                  setCurrentPage(1);
                }}
              />{" "}
              / page
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksList;
