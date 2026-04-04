import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteAllClients,
  deleteClient,
  findClientByName,
  retrieveClients,
} from "../../slices/clients";
import Pagination, {
  DEFAULT_ITEMS_PER_PAGE,
  PageSizeSelect,
} from "../Pagination";

const ClientList = () => {
  const [searchName, setSearchName] = useState("");
  const clients = useSelector((state) => state.client);
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

  const initFetch = useCallback(() => {
    dispatch(retrieveClients());
  }, [dispatch]);

  useEffect(() => {
    initFetch();
  }, [initFetch]);

  const removeClient = (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    dispatch(deleteClient({ id }))
      .unwrap()
      .catch(() => {});
  };

  const removeAllClients = () => {
    if (!window.confirm("Are you sure you want to delete all clients?")) return;
    dispatch(deleteAllClients()).catch(() => {});
  };

  const findByName = () => {
    setCurrentPage(1);
    dispatch(findClientByName({ name: searchName }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h4 className="page-title">&#128101; Clients</h4>
        <div className="page-header-actions">
          {clients.length > 0 && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={removeAllClients}
            >
              Remove All
            </button>
          )}
          <Link to="/addClient" className="btn btn-sm btn-primary">
            + Add Client
          </Link>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="form-control"
          placeholder="Search by client name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyPress={(e) => e.code === "Enter" && findByName()}
        />
        <button className="btn btn-outline-secondary" onClick={findByName}>
          Search
        </button>
      </div>

      {/* Top Pagination */}
      {clients && clients.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-2">
          <span style={{ fontSize: "0.85rem" }}>
            Showing{" "}
            <strong>
              {Math.min((currentPage - 1) * itemsPerPage + 1, clients.length)}–
              {Math.min(currentPage * itemsPerPage, clients.length)}
            </strong>{" "}
            of <strong>{clients.length}</strong> client
            {clients.length !== 1 ? "s" : ""}
          </span>
          <Pagination
            currentPage={currentPage}
            totalItems={clients.length}
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

      <div className="list-table-wrapper">
        <table className="list-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>Client Name</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan="3" className="list-empty-row">
                  No clients found
                </td>
              </tr>
            ) : (
              clients
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((client, index) => (
                  <tr key={client.id}>
                    <td data-label="#">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td data-label="Name">
                      <strong>{client.name}</strong>
                    </td>
                    <td data-label="">
                      <div className="action-btns">
                        <Link
                          to={"/clients/" + client.id}
                          className="btn btn-sm btn-warning"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeClient(client.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination */}
      {clients && clients.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span style={{ fontSize: "0.85rem" }}>
            Showing{" "}
            <strong>
              {Math.min((currentPage - 1) * itemsPerPage + 1, clients.length)}–
              {Math.min(currentPage * itemsPerPage, clients.length)}
            </strong>{" "}
            of <strong>{clients.length}</strong> client
            {clients.length !== 1 ? "s" : ""}
          </span>
          <Pagination
            currentPage={currentPage}
            totalItems={clients.length}
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

export default ClientList;
