import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  retrieveAllUsers,
  deactivateUser,
  activateUser,
} from "../../slices/users";
import Pagination, {
  DEFAULT_ITEMS_PER_PAGE,
  PageSizeSelect,
} from "../Pagination";

const StaffList = () => {
  const [searchName, setSearchName] = useState("");
  const { users = [], totalItems = 0 } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);
  const prefEnabled = currentUser?.featureFlags?.user_preferences;
  const userItemsPerPage = prefEnabled
    ? currentUser?.itemsPerPage || DEFAULT_ITEMS_PER_PAGE
    : DEFAULT_ITEMS_PER_PAGE;
  const [sessionPageSize, setSessionPageSize] = useState(null);
  const itemsPerPage = prefEnabled
    ? sessionPageSize || userItemsPerPage
    : DEFAULT_ITEMS_PER_PAGE;
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(
    (page) => {
      const params = {
        page: page || currentPage,
        size: itemsPerPage,
      };
      if (searchName) params.name = searchName;
      dispatch(retrieveAllUsers(params));
    },
    [dispatch, currentPage, itemsPerPage, searchName],
  );

  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  // Reset to page 1 when search or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, itemsPerPage]);

  const findByName = () => {
    setCurrentPage(1);
  };

  const handleDeactivate = (id) => {
    if (!window.confirm("Are you sure you want to deactivate this user?"))
      return;
    dispatch(deactivateUser({ id }))
      .unwrap()
      .then(() => {
        fetchUsers(currentPage);
      })
      .catch(() => {});
  };

  const handleActivate = (id) => {
    if (!window.confirm("Are you sure you want to reactivate this user?"))
      return;
    dispatch(activateUser({ id }))
      .unwrap()
      .then(() => {
        fetchUsers(currentPage);
      })
      .catch(() => {});
  };

  const PaginationBar = () => (
    <div className="d-flex justify-content-between align-items-center">
      <span style={{ fontSize: "0.85rem" }}>
        Showing{" "}
        <strong>
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </strong>{" "}
        of <strong>{totalItems}</strong> user
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
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h4 className="page-title">&#128100; Staff</h4>
        <div className="page-header-actions">
          <Link to="/register" className="btn btn-sm btn-primary">
            + Add Staff
          </Link>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyPress={(e) => e.code === "Enter" && findByName()}
        />
        <button className="btn btn-outline-secondary" onClick={findByName}>
          Search
        </button>
      </div>

      {/* Top Pagination */}
      {users && users.length > 0 && (
        <div className="mt-2 mb-2">
          <PaginationBar />
        </div>
      )}

      <div className="list-table-wrapper">
        <table className="list-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>Username</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="list-empty-row">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className={user.isActive === false ? "row-inactive" : ""}
                >
                  <td data-label="#">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td data-label="Name">
                    <strong>{user.username}</strong>
                  </td>
                  <td data-label="Status">
                    <span
                      className={
                        "status-pill " +
                        (user.isActive === false ? "inactive" : "active")
                      }
                    >
                      {user.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td data-label="">
                    <div className="action-btns">
                      <Link
                        to={"/users/" + user.id}
                        className="btn btn-sm btn-warning"
                      >
                        Edit
                      </Link>
                      {user.isActive === false ? (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleActivate(user.id)}
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeactivate(user.id)}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination */}
      {users && users.length > 0 && (
        <div className="mt-3">
          <PaginationBar />
        </div>
      )}
    </div>
  );
};

export default StaffList;
