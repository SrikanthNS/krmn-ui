import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import {
  retrieveFeatureFlags,
  toggleFeatureFlag,
} from "../../slices/featureFlags";

const FLAG_META = {
  user_preferences: {
    description:
      "Allow users to customize display preferences (items per page)",
    category: "Personalization",
  },
  dark_mode: {
    description: "Allow users to switch between light and dark themes",
    category: "Personalization",
  },
  ai_agent: {
    description:
      "Enable KAI — KRMN AI assistant for natural language task and client management",
    category: "AI & Automation",
  },
  visualization: {
    description:
      "Enable performance dashboards and analytics (Admin & above only)",
    category: "Analytics",
  },
  task_prefill: {
    description:
      "Let users prefill new task forms from their recent task history",
    category: "Productivity",
  },
};

const CATEGORY_ICONS = {
  Personalization: "\u{1F3A8}",
  "AI & Automation": "\u{1F916}",
  Analytics: "\u{1F4CA}",
  Productivity: "\u26A1",
};

const CATEGORY_COLORS = {
  Personalization: "#9b59b6",
  "AI & Automation": "#e74c3c",
  Analytics: "#4a90d9",
  Productivity: "#50c878",
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

  // Group flags by category
  const grouped = {};
  flagEntries.forEach(([key, enabled]) => {
    const category = FLAG_META[key]?.category || "Other";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ key, enabled });
  });

  // Sort categories in a stable order
  const categoryOrder = [
    "Personalization",
    "Productivity",
    "Analytics",
    "AI & Automation",
    "Other",
  ];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) =>
      (categoryOrder.indexOf(a) === -1 ? 99 : categoryOrder.indexOf(a)) -
      (categoryOrder.indexOf(b) === -1 ? 99 : categoryOrder.indexOf(b)),
  );

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="card shadow-sm mb-4">
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

          {error && (
            <div className="alert alert-danger py-2">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </div>
          )}

          {!loading && flagEntries.length === 0 && (
            <p className="text-muted mb-0">No feature flags configured.</p>
          )}

          {!loading &&
            sortedCategories.map((category) => {
              const categoryFlags = grouped[category];
              const enabledCount = categoryFlags.filter(
                (f) => f.enabled,
              ).length;
              const color = CATEGORY_COLORS[category] || "#6c757d";
              const icon = CATEGORY_ICONS[category] || "\u2699\uFE0F";

              return (
                <div key={category} className="mb-3">
                  <div
                    className="d-flex align-items-center justify-content-between px-2 py-2"
                    style={{
                      borderLeft: `3px solid ${color}`,
                      background: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                      {icon} {category}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: color,
                        color: "#fff",
                        fontSize: "0.75rem",
                      }}
                    >
                      {enabledCount}/{categoryFlags.length} active
                    </span>
                  </div>

                  {categoryFlags.map(({ key, enabled }) => (
                    <div
                      key={key}
                      className="d-flex align-items-center justify-content-between py-2 px-3"
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <div>
                        <strong style={{ fontSize: "0.9rem" }}>
                          {key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </strong>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {FLAG_META[key]?.description || key}
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
                        <label
                          className="custom-control-label"
                          htmlFor={`flag-${key}`}
                        >
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
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default FeatureFlags;
