import "bootstrap/dist/css/bootstrap.min.css";
import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import "./App.css";
import EventBus from "./common/EventBus";
import Loader from "./components/Loader";
import Login from "./components/Login";
import { history } from "./helpers/history";
import { logout } from "./slices/auth";
import { clearMessage } from "./slices/message";
import AuthVerify from "./common/AuthVerify";
import { capitalize } from "lodash";

// Lazy-loaded route components
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const Register = lazy(() => import("./components/Register"));
const TasksList = lazy(() => import("components/Tasks/TasksList"));
const AddTask = lazy(() => import("components/Tasks/AddTask"));
const Task = lazy(() => import("components/Tasks/Task"));
const BoardModerator = lazy(() => import("./components/BoardModerator"));
const BoardAdmin = lazy(() => import("./components/BoardAdmin"));
const ClientList = lazy(() => import("components/clients/ClientList"));
const AddClient = lazy(() => import("components/clients/AddClient"));
const Client = lazy(() => import("components/clients/Client"));
const StaffList = lazy(() => import("components/users/StaffList"));
const User = lazy(() => import("components/users/User"));
const FeatureFlags = lazy(() => import("components/admin/FeatureFlags"));

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

            <div
              className={`navbar-collapse${navOpen ? " show" : " collapse"}`}
              id="mainNav"
            >
              {currentUser && (
                <ul className="nav-links">
                  <li className="nav-section">
                    <span className="nav-section-label">Tasks</span>
                    <Link
                      to="/taskList"
                      className="nav-menu-item"
                      onClick={closeNav}
                    >
                      <span className="nav-icon">&#128203;</span> Task List
                    </Link>
                    <Link
                      to="/addTask"
                      className="nav-menu-item"
                      onClick={closeNav}
                    >
                      <span className="nav-icon">&#10133;</span> Add Task
                    </Link>
                  </li>

                  {showAdminBoard && (
                    <>
                      <li className="nav-section">
                        <span className="nav-section-label">Clients</span>
                        <Link
                          to="/clientList"
                          className="nav-menu-item"
                          onClick={closeNav}
                        >
                          <span className="nav-icon">&#128101;</span> Client
                          List
                        </Link>
                        <Link
                          to="/addClient"
                          className="nav-menu-item"
                          onClick={closeNav}
                        >
                          <span className="nav-icon">&#10133;</span> Add Client
                        </Link>
                      </li>
                      <li className="nav-section">
                        <span className="nav-section-label">Staff</span>
                        <Link
                          to="/staffList"
                          className="nav-menu-item"
                          onClick={closeNav}
                        >
                          <span className="nav-icon">&#128100;</span> Staff List
                        </Link>
                        <Link
                          to="/register"
                          className="nav-menu-item"
                          onClick={closeNav}
                        >
                          <span className="nav-icon">&#10133;</span> Add Staff
                        </Link>
                      </li>
                      <li className="nav-section">
                        <span className="nav-section-label">Admin</span>
                        <Link
                          to="/feature-flags"
                          className="nav-menu-item"
                          onClick={closeNav}
                        >
                          <span className="nav-icon">&#9873;</span> Feature
                          Flags
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
                        <Link
                          to="/profile"
                          className="nav-user-link"
                          onClick={closeNav}
                        >
                          Profile
                        </Link>
                        <span className="nav-user-divider">|</span>
                        <Link
                          to="/login"
                          className="nav-user-link"
                          onClick={() => {
                            closeNav();
                            logOut();
                          }}
                        >
                          Logout
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="btn-nav-login"
                    onClick={closeNav}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="app-main">
          <Suspense
            fallback={
              <div className="text-center mt-5">
                <span className="spinner-border" />
              </div>
            }
          >
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
              <Route path="/feature-flags" component={FeatureFlags} />
            </Switch>
          </Suspense>
        </main>

        <AuthVerify logOut={logOut} />
      </div>
    </Router>
  );
};

export default App;
