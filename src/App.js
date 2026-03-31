import "bootstrap/dist/css/bootstrap.min.css";
import AddTask from "components/Tasks/AddTask";
import Task from "components/Tasks/Task";
import TasksList from "components/Tasks/TasksList";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import "./App.css";
import EventBus from "./common/EventBus";
import BoardAdmin from "./components/BoardAdmin";
import BoardModerator from "./components/BoardModerator";
import Home from "./components/Home";
import Loader from "./components/Loader";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Register from "./components/Register";
import { history } from "./helpers/history";
import { logout } from "./slices/auth";
import { clearMessage } from "./slices/message";
import AuthVerify from "./common/AuthVerify";
import ClientList from "components/clients/ClientList";
import AddClient from "components/clients/AddClient";
import Client from "components/clients/Client";
import User from "components/users/User";
import StaffList from "components/users/StaffList";
import { capitalize } from "lodash";

const App = () => {
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const closeNav = () => setNavOpen(false);

  useEffect(() => {
    history.listen(() => {
      dispatch(clearMessage());
    });
  }, [dispatch]);

  const logOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setShowAdminBoard(currentUser.roles.includes("ROLE_ADMIN"));
    } else {
      setShowAdminBoard(false);
    }
    EventBus.on("logout", () => logOut());
    return () => EventBus.remove("logout");
  }, [currentUser, logOut]);

  return (
    <Router history={history}>
      <Loader />
      <div className="app-shell">
        {/* ── Sidebar / Top Nav ── */}
        <nav className="app-navbar">
          <div className="app-navbar-inner">
            <Link to="/" className="app-brand">
              <span className="brand-icon">K</span>
              <span className="brand-text">KRMN & Associates</span>
            </Link>

            <button
              className="navbar-toggler d-lg-none"
              type="button"
              onClick={() => setNavOpen(!navOpen)}
              aria-label="Toggle navigation"
            >
              <span className="toggler-bar"></span>
              <span className="toggler-bar"></span>
              <span className="toggler-bar"></span>
            </button>

            <div className={`navbar-collapse${navOpen ? " show" : " collapse"}`} id="mainNav">
              {currentUser && (
                <ul className="nav-links">
                  <li className="nav-section">
                    <span className="nav-section-label">Tasks</span>
                    <Link to="/taskList" className="nav-menu-item" onClick={closeNav}>
                      <span className="nav-icon">&#128203;</span> Task List
                    </Link>
                    <Link to="/addTask" className="nav-menu-item" onClick={closeNav}>
                      <span className="nav-icon">&#10133;</span> Add Task
                    </Link>
                  </li>

                  {showAdminBoard && (
                    <>
                      <li className="nav-section">
                        <span className="nav-section-label">Clients</span>
                        <Link to="/clientList" className="nav-menu-item" onClick={closeNav}>
                          <span className="nav-icon">&#128101;</span> Client List
                        </Link>
                        <Link to="/addClient" className="nav-menu-item" onClick={closeNav}>
                          <span className="nav-icon">&#10133;</span> Add Client
                        </Link>
                      </li>
                      <li className="nav-section">
                        <span className="nav-section-label">Staff</span>
                        <Link to="/staffList" className="nav-menu-item" onClick={closeNav}>
                          <span className="nav-icon">&#128100;</span> Staff List
                        </Link>
                        <Link to="/register" className="nav-menu-item" onClick={closeNav}>
                          <span className="nav-icon">&#10133;</span> Add Staff
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              )}

              <div className="nav-user-area">
                {currentUser ? (
                  <div className="nav-user-dropdown">
                    <div className="nav-user-avatar">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="nav-user-info">
                      <span className="nav-user-name">
                        {capitalize(currentUser.username)}
                      </span>
                      <div className="nav-user-actions">
                        <Link to="/profile" className="nav-user-link" onClick={closeNav}>Profile</Link>
                        <span className="nav-user-divider">|</span>
                        <a href="/login" className="nav-user-link" onClick={() => { closeNav(); logOut(); }}>
                          Logout
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" className="btn-nav-login" onClick={closeNav}>
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="app-main">
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
            <Route path="/clientList" component={ClientList} />
            <Route path="/addClient" component={AddClient} />
            <Route path="/clients/:id" component={Client} />
            <Route path="/staffList" component={StaffList} />
            <Route path="/users/:id" component={User} />
          </Switch>
        </main>

        <AuthVerify logOut={logOut} />
      </div>
    </Router>
  );
};

export default App;
