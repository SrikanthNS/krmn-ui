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
        <nav className="navbar navbar-expand-md bg-dark navbar-dark">
          <Link to={"/"} className="navbar-brand">
            KRMN & Associates
          </Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" aria-expanded="false" data-target="#collapsibleNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="collapsibleNavbar">
            <ul className="navbar-nav mr-auto">
              {currentUser && (
                <React.Fragment>
                  <li className="nav-item">
                    <Link to={"/taskList"} className="nav-link">
                      Task List
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={"/addTask"} className="nav-link">
                      Add Task
                    </Link>
                  </li>
                  {showAdminBoard && <li className="nav-item">
                    <Link to={"/register"} className="nav-link">
                      Add Staff
                    </Link>
                  </li>}
                </React.Fragment>
              )}
            </ul>
            <ul className="navbar-nav mr">
              {currentUser ? (
                <React.Fragment>
                  <li className="nav-item mr-auto">
                    <Link to={"/profile"} className="nav-link">
                      {capitalize(currentUser.username)}
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
            {/* <li className="nav-item">
              <Link to={"/home"} className="nav-link">
                Home
              </Link>
            </li> */}

            {/* {showModeratorBoard && (
              <li className="nav-item">
                <Link to={"/mod"} className="nav-link">
                  Moderator Board
                </Link>
              </li>
            )} */}

            {/* {showAdminBoard && (
              <li className="nav-item">
                <Link to={"/admin"} className="nav-link">
                  Admin Board
                </Link>
              </li>
            )} */}


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