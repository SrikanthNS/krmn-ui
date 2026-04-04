import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ClientService from "../../services/client.service";
import { updateClient } from "../../slices/clients";

const Client = (props) => {
  const [currentClient, setCurrentClient] = useState({ id: null, name: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    ClientService.get(props.match.params.id)
      .then((response) => setCurrentClient(response.data))
      .catch(() => {});
  }, [props.match.params.id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentClient({ ...currentClient, [name]: value });
  };

  const updateContent = () => {
    dispatch(updateClient({ id: currentClient.id, data: currentClient }))
      .unwrap()
      .then(() => {
        setMessage("Client updated successfully!");
        setIsError(false);
      })
      .catch(() => {
        setMessage("Failed to update client.");
        setIsError(true);
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-card-header">
          <div className="auth-avatar">&#9998;</div>
          <h2>Edit Client</h2>
        </div>
        <div className="auth-card-body">
          {currentClient && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateContent();
              }}
            >
              <div className="auth-field">
                <label htmlFor="name">Client Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={currentClient.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary flex-fill">
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => props.history.push("/clientList")}
                >
                  &larr; Back
                </button>
              </div>
              {message && (
                <div
                  className={"auth-message " + (isError ? "error" : "success")}
                  style={{ marginTop: 12 }}
                >
                  {message}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Client;
