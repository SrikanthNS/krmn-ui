import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  //   deleteAllusers,
  //   deleteuser,
  //   finduserByName,
  findUserByName,
  retrieveAllUsers,
} from "../../slices/users";

const StaffList = () => {
  const [searchName, setSearchName] = useState("");
  const { reviewers, users } = useSelector((state) => state.user);
  console.log("🚀 ~ file: StaffList.js:15 ~ StaffList ~ users:", users);
  const dispatch = useDispatch();

  const onChangeSearchName = (e) => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const onSearchSubmit = (e) => {
    if (e.code === "Enter") {
      findByName();
    }
  };

  const initFetch = useCallback(() => {
    dispatch(retrieveAllUsers());
  }, [dispatch]);

  useEffect(() => {
    initFetch();
  }, [initFetch]);

  //   const removeuser = (id) => {
  //     if (!window.confirm("Are you sure you want to delete the user ?")) {
  //       return;
  //     }
  //     dispatch(deleteuser({ id }))
  //       .unwrap()
  //       .catch((e) => {
  //         console.log(e);
  //       });
  //   };

  //   const removeAllusers = () => {
  //     if (!window.confirm("Are you sure you want to delete all users ?")) {
  //       return;
  //     }
  //     dispatch(deleteAllusers()).catch((e) => {
  //       console.log(e);
  //     });
  //   };

  const findByName = () => {
    dispatch(findUserByName({ name: searchName }));
  };

  return (
    <div className=" row">
      <div className="col-md-12">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by description"
            value={searchName}
            onChange={onChangeSearchName}
            onKeyPress={onSearchSubmit}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByName}
            >
              Search
            </button>
          </div>
        </div>
      </div>
      <div className="col-md-12">
        <h4>user List</h4>
      </div>
      {/* user list table start */}
      <div className="col-md-2 table-responsive-md"></div>
      <div className="col-md-8 tableFixHead">
        {users && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">user</th>
                <th scope="col" colSpan="2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                return (
                  <tr key={`user-row-${index}`}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>

                    <td colSpan="2">
                      <div style={{ display: "inline-flex" }}>
                        <Link
                          to={"/users/" + user.id}
                          className="btn btn-sm btn-warning mr-2 mt-0"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-sm btn-danger mr-2 mt-0"
                          onClick
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="col-md-2 table-responsive-md"></div>
      {/* user list table end */}
      <div className="col-md-10">
        {users.length === 0 && (
          <div className="d-flex justify-content-center">
            <h5 className="text-center text-info">No Users Found</h5>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;
