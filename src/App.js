import "bootstrap/dist/css/bootstrap.min.css";
import Task from "components/Task";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import "./App.css";
import EventBus from "./common/EventBus";
import AddTask from './components/AddTask';
import BoardAdmin from "./components/BoardAdmin";
import BoardModerator from "./components/BoardModerator";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Register from "./components/Register";
import TasksList from "./components/TasksList";
import { history } from "./helpers/history";
import { logout } from "./slices/auth";
import { clearMessage } from "./slices/message";
import { capitalize } from 'lodash';
// import AuthVerify from "./common/AuthVerify";

const App = () => {
  // const [showModeratorBoard, setShowModeratorBoard] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);

  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    history.listen((location) => {
      dispatch(clearMessage()); // clear message when changing location
    });
  }, [dispatch]);

  const logOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      // setShowModeratorBoard(currentUser.roles.includes("ROLE_MODERATOR"));
      setShowAdminBoard(currentUser.roles.includes("ROLE_ADMIN"));
    } else {
      // setShowModeratorBoard(false);
      setShowAdminBoard(false);
    }

    EventBus.on("logout", () => {
      logOut();
    });

    return () => {
      EventBus.remove("logout");
    };
  }, [currentUser, logOut]);

  return (
    <Router history={history}>
      <div>
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
          <div className="container-fluid">
            <Link to={"/"} className="navbar-brand">
              KRMN & Associates
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                {currentUser && (<React.Fragment>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Tasks
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown1">
                      <li><Link to={"/taskList"} className="dropdown-item" href="#">Task List</Link></li>
                      <li><Link to={"/addTask"} className="dropdown-item" href="#">Add Task</Link></li>
                    </ul>
                  </li>

                  {showAdminBoard && <React.Fragment>
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Staff
                      </a>
                      <ul className="dropdown-menu" aria-labelledby="navbarDropdown2">
                        <li><Link to={"/register"} className="dropdown-item" href="#">Add Staff</Link></li>
                      </ul>
                    </li>
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Clients
                      </a>
                      <ul className="dropdown-menu" aria-labelledby="navbarDropdown2">
                        <li><Link to={"/taskList"} className="dropdown-item" href="#">Client List</Link></li>
                        <li><Link to={"/addTask"} className="dropdown-item" href="#">Add Client</Link></li>
                      </ul>
                    </li>
                  </React.Fragment>
                  }
                </React.Fragment>
                )}
              </ul>
              <ul className="navbar-nav mr">
                {currentUser ? (
                  <React.Fragment>
                    <li className="nav-item mr-auto">
                      <Link to={"/profile"} className="nav-link">
                        My Profile{/* {capitalize(currentUser.username)} */}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <a href="/login" className="nav-link" onClick={logOut}>
                        LogOut
                      </a>
                    </li>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <li className="nav-item">
                      <Link to={"/login"} className="nav-link">
                        Login
                      </Link>
                    </li>
                  </React.Fragment>
                )}

              </ul>
            </div>
          </div>
        </nav>

        <div className="container mt-3">
          <Switch>
            <Route exact path={["/", "/home"]} component={Home} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/profile" component={Profile} />
            <Route path="/taskList" component={TasksList} />
            <Route path="/addTask" component={AddTask} />
            <Route path="/mod" component={BoardModerator} />
            <Route path="/admin" component={BoardAdmin} />
            <Route path="/tasks/:id" component={Task} />
          </Switch>
        </div>
        {/* <AuthVerify logOut={logOut}/> */}
      </div >
    </Router >
  );
};

export default App;