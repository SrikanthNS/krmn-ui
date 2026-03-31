import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  findUserByName,
  retrieveAllUsers,
  deactivateUser,
  activateUser,
} from "../../slices/users";
import Pagination, { ITEMS_PER_PAGE } from "../Pagination";

const StaffList = () => {
  const [searchName, setSearchName] = useState("");
  const { users } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  const initFetch = useCallback(() => {
    dispatch(retrieveAllUsers());
  }, [dispatch]);

  useEffect(() => {
    initFetch();
  }, [initFetch]);

  const findByName = () => {
    setCurrentPage(1);
    dispatch(findUserByName({ name: searchName }));
  };

  const handleDeactivate = (id) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    dispatch(deactivateUser({ id })).unwrap().catch((e) => console.log(e));
  };

  const handleActivate = (id) => {
    if (!window.confirm("Are you sure you want to reactivate this user?")) return;
    dispatch(activateUser({ id })).unwrap().catch((e) => console.log(e));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h4 className="page-title">&#128100; Staff</h4>
        <div className="page-header-actions">
          <Link to="/register" className="btn btn-sm btn-primary">+ Add Staff</Link>
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
                <td colSpan="4" className="list-empty-row">No users found</td>
              </tr>
            ) : (
              users
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((user, index) => (
                  <tr key={user.id} className={user.isActive === false ? "row-inactive" : ""}>
                    <td data-label="#">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td data-label="Name"><strong>{user.username}</strong></td>
                    <td data-label="Status">
                      <span className={"status-pill " + (user.isActive === false ? "inactive" : "active")}>
                        {user.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td data-label="">
                      <div className="action-btns">
                        <Link to={"/users/" + user.id} className="btn btn-sm btn-warning">
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

      {users && users.length > ITEMS_PER_PAGE && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default StaffList;
