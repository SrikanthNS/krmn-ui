import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { register } from "../slices/auth";
import { clearMessage } from "../slices/message";

const Register = () => {
  const [successful, setSuccessful] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(["user"]);
  const [showPassword, setShowPassword] = useState(false);
  const { message } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  const initialValues = { username: "", email: "", password: "" };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, "Must be at least 3 characters")
      .max(20, "Must be 20 characters or less")
      .required("Username is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Must be at least 6 characters")
      .max(40, "Must be 40 characters or less")
      .required("Password is required"),
  });

  const handleRegister = (formValue) => {
    const { username, email, password } = formValue;
    setSuccessful(false);
    dispatch(register({ username, email, password, roles: selectedRoles }))
      .unwrap()
      .then(() => {
        setSuccessful(true);
        setSelectedRoles(["user"]);
      })
      .catch(() => setSuccessful(false));
  };

  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-card-header">
          <div className="auth-avatar">&#128100;</div>
          <h2>Add Staff</h2>
          <p>Create a new staff account</p>
        </div>
        <div className="auth-card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
          >
            {({ errors, touched }) => (
              <Form>
                {!successful && (
                  <>
                    <div className="auth-field">
                      <label htmlFor="username">Username</label>
                      <Field
                        name="username"
                        type="text"
                        placeholder="Enter username"
                        className={`form-control ${errors.username && touched.username ? "is-invalid" : ""}`}
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="auth-error"
                      />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="email">Email</label>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`}
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="auth-error"
                      />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="password">Set Password</label>
                      <div className="password-wrapper">
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 6 characters"
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
                    <div className="auth-field">
                      <label>Roles</label>
                      <div className="d-flex gap-3">
                        {["user", "moderator", "admin"].map((role) => (
                          <div key={role} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`role-${role}`}
                              checked={selectedRoles.includes(role)}
                              onChange={() => toggleRole(role)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`role-${role}`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn-auth-submit">
                      Create Staff Account
                    </button>
                  </>
                )}
              </Form>
            )}
          </Formik>
        </div>
        {message && (
          <div className={`auth-message ${successful ? "success" : "error"}`}>
            {message}
          </div>
        )}
        {successful && (
          <div className="auth-card-body" style={{ paddingTop: 0 }}>
            <button
              className="btn-auth-submit"
              onClick={() => {
                setSuccessful(false);
                dispatch(clearMessage());
              }}
            >
              + Add Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
