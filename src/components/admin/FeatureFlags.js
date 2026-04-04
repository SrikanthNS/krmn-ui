import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import {
  retrieveFeatureFlags,
  toggleFeatureFlag,
} from "../../slices/featureFlags";

const FLAG_DESCRIPTIONS = {
  user_preferences:
    "Allow users to customize display preferences (items per page)",
  dark_mode: "Allow users to switch between light and dark themes",
};

const FeatureFlags = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { flags, loading, error } = useSelector((state) => state.featureFlags);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(retrieveFeatureFlags());
  }, [dispatch]);

  if (!currentUser || !currentUser.roles.includes("ROLE_SUPERADMIN")) {
    return <Redirect to="/" />;
  }

  const handleToggle = (key, currentValue) => {
    dispatch(toggleFeatureFlag({ key, enabled: !currentValue }));
  };

  const flagEntries = Object.entries(flags);

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="card shadow-sm">
        <div
          className="card-header text-white"
          style={{
            background: "linear-gradient(135deg, #4a90d9, #357abd)",
          }}
        >
          <h5 className="mb-0">
            <span role="img" aria-label="flags">
              &#9873;
            </span>{" "}
            Feature Flags
          </h5>
        </div>
        <div className="card-body">
          {loading && (
            <div className="text-center py-3">
              <span className="spinner-border spinner-border-sm" />
              <span className="ml-2">Loading...</span>
            </div>
          )}

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {!loading && flagEntries.length === 0 && (
            <p className="text-muted mb-0">No feature flags configured.</p>
          )}

          {flagEntries.map(([key, enabled]) => (
            <div
              key={key}
              className="d-flex align-items-center justify-content-between py-3"
              style={{
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong style={{ fontSize: "0.95rem" }}>
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </strong>
                <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                  {FLAG_DESCRIPTIONS[key] || key}
                </div>
              </div>
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id={`flag-${key}`}
                  checked={!!enabled}
                  onChange={() => handleToggle(key, enabled)}
                />
                <label className="custom-control-label" htmlFor={`flag-${key}`}>
                  {enabled ? (
                    <span className="badge badge-success">ON</span>
                  ) : (
                    <span className="badge badge-secondary">OFF</span>
                  )}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureFlags;
