import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import * as Yup from "yup";
import { login } from "../slices/auth";
import { clearMessage } from "../slices/message";

const Login = (props) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { message } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  const initialValues = { username: "", password: "" };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = (formValue) => {
    const { username, password } = formValue;
    setLoading(true);
    dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        props.history.push("/taskList");
      })
      .catch(() => setLoading(false));
  };

  if (isLoggedIn) return <Redirect to="/profile" />;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-avatar">&#128274;</div>
          <h2>Sign In</h2>
          <p>Enter your credentials to access your account</p>
        </div>
        <div className="auth-card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ errors, touched }) => (
              <Form>
                <div className="auth-field">
                  <label htmlFor="username">Username</label>
                  <Field
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className={`form-control ${errors.username && touched.username ? "is-invalid" : ""}`}
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="auth-error"
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="password">Password</label>
                  <div className="password-wrapper">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`form-control ${errors.password && touched.password ? "is-invalid" : ""}`}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" />
                          <circle cx="8" cy="8" r="2" />
                          <line x1="2.5" y1="2.5" x2="13.5" y2="13.5" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" />
                          <circle cx="8" cy="8" r="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="auth-error"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm mr-2" />
                  ) : null}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
        {message && <div className="auth-message error">{message}</div>}
      </div>
    </div>
  );
};

export default Login;
