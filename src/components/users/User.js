import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import UserService from "../../services/user.service";
import { updateUser } from "../../slices/users";

const User = (props) => {
  const [currentUser, setCurrentUser] = useState({ id: null, username: "", email: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    UserService.get(props.match.params.id)
      .then((response) => setCurrentUser(response.data))
      .catch((e) => console.log(e));
  }, [props.match.params.id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

  const updateContent = () => {
    dispatch(updateUser({ id: currentUser.id, data: currentUser }))
      .unwrap()
      .then(() => {
        setMessage("User updated successfully!");
        setIsError(false);
      })
      .catch(() => {
        setMessage("Failed to update user.");
        setIsError(true);
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-card-header">
          <div className="auth-avatar">&#9998;</div>
          <h2>Edit User</h2>
        </div>
        <div className="auth-card-body">
          {currentUser && (
            <form onSubmit={(e) => { e.preventDefault(); updateContent(); }}>
              <div className="auth-field">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={currentUser.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={currentUser.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary flex-fill">Update</button>
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => props.history.push("/staffList")}
                >
                  &larr; Back
                </button>
              </div>
              {message && (
                <div className={"auth-message " + (isError ? "error" : "success")} style={{ marginTop: 12 }}>
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

export default User;
