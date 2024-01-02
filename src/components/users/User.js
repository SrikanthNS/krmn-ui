import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import UserService from "../../services/user.service";
import { updateUser } from "../../slices/users";

const User = (props) => {
  const initialClientState = {
    id: null,
    name: "",
  };
  const [currentUser, setCurrentUser] = useState(initialClientState);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const getUser = (id) => {
    UserService.get(id)
      .then((response) => {
        console.log("🚀 ~ file: User.js:18 ~ .then ~ response:", response);
        setCurrentUser(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getUser(props.match.params.id);
  }, [props.match.params.id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

  const updateContent = () => {
    dispatch(updateUser({ id: currentUser.id, data: currentUser }))
      .unwrap()
      .then((response) => {
        console.log("🚀 ~ file: User.js:38 ~ .then ~ response:", response);
        setMessage("The User was updated successfully!");
      })
      .catch((e) => {
        console.log(e);
      });
  };
  console.log("🚀 ~ file: User.js:86 ~ User ~ currentUser:", currentUser);
  return (
    <div className="col-md-12 table-responsive-md">
      <h4>Edit User</h4>
      <hr></hr>
      {currentUser && (
        <div className="edit-form">
          <form>
            <div className="form-group">
              <label htmlFor="username">Name</label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={currentUser.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                className="form-control"
                id="email"
                name="email"
                value={currentUser.email}
                onChange={handleInputChange}
              />
            </div>
          </form>

          <button
            type="submit"
            className="btn btn-md mr-2 btn-success"
            onClick={updateContent}
          >
            Update
          </button>
          <button
            className="btn btn-md btn-primary mr-2"
            onClick={() => props.history.push("/staffList")}
          >
            {`< Go Back`}
          </button>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default User;
