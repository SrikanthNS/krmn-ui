import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";
import authService from "../services/auth.service";
import UserService from "../services/user.service";
import {
  updateItemsPerPage,
  updateDarkModeSettings,
  updateRecentTaskLimit,
} from "../slices/auth";

const ALLOWED_PAGE_SIZES = [10, 20, 50, 100];
const ALLOWED_RECENT_LIMITS = [3, 5, 10, 15, 20];

// Dark mode schedule modes (similar to macOS)
const DARK_MODE_OPTIONS = {
  OFF: "off",
  ON: "on",
  SUNSET_SUNRISE: "sunset_sunrise",
  CUSTOM: "custom",
};

/**
 * Approximate sunrise/sunset using day-of-year.
 * Returns { sunrise, sunset } in 24 h decimal (e.g. 6.5 = 06:30).
 * Good-enough for a UI toggle — no geolocation needed.
 */
const getSunTimes = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  // Simple sinusoidal model: sunrise ~5:30–7:00, sunset ~17:30–20:30
  const sunriseHour =
    6.25 - 0.75 * Math.cos((2 * Math.PI * (dayOfYear - 172)) / 365);
  const sunsetHour =
    19.0 + 1.5 * Math.cos((2 * Math.PI * (dayOfYear - 172)) / 365);
  return { sunrise: sunriseHour, sunset: sunsetHour };
};

const decimalToTime = (decimal) => {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const timeToDecimal = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
};

const shouldBeDark = (settings) => {
  if (!settings) return false;
  const { mode, customFrom, customTo } = settings;
  if (mode === DARK_MODE_OPTIONS.ON) return true;
  if (mode === DARK_MODE_OPTIONS.OFF) return false;

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  if (mode === DARK_MODE_OPTIONS.SUNSET_SUNRISE) {
    const { sunrise, sunset } = getSunTimes();
    return currentHour >= sunset || currentHour < sunrise;
  }

  if (mode === DARK_MODE_OPTIONS.CUSTOM) {
    const from = timeToDecimal(customFrom || "20:00");
    const to = timeToDecimal(customTo || "06:00");
    if (from > to) {
      // Overnight: e.g. 20:00 → 06:00
      return currentHour >= from || currentHour < to;
    }
    return currentHour >= from && currentHour < to;
  }
  return false;
};

const Profile = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const DEFAULT_DARK_SETTINGS = {
    mode: "off",
    customFrom: "20:00",
    customTo: "06:00",
  };

  // Load dark-mode settings from user profile (DB-backed)
  const [darkSettings, setDarkSettings] = useState(
    () => currentUser?.darkModeSettings || DEFAULT_DARK_SETTINGS,
  );

  const [theme, setTheme] = useState(() =>
    shouldBeDark(darkSettings) ? "dark" : "light",
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [prefMessage, setPrefMessage] = useState("");

  const applyTheme = useCallback((isDark) => {
    const next = isDark ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  const updateDarkSettings = (updates) => {
    const next = { ...darkSettings, ...updates };
    setDarkSettings(next);
    applyTheme(shouldBeDark(next));
    // Persist to DB (same endpoint as itemsPerPage)
    UserService.updatePreferences({ darkModeSettings: next })
      .then(() => {
        dispatch(updateDarkModeSettings(next));
      })
      .catch((err) => {
        console.error(
          "Failed to save dark mode settings:",
          err.response?.data || err.message,
        );
      });
  };

  // Re-evaluate schedule every 60 s for sunset/sunrise & custom modes
  useEffect(() => {
    if (
      darkSettings.mode === DARK_MODE_OPTIONS.SUNSET_SUNRISE ||
      darkSettings.mode === DARK_MODE_OPTIONS.CUSTOM
    ) {
      const interval = setInterval(() => {
        applyTheme(shouldBeDark(darkSettings));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [darkSettings, applyTheme]);

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  const handleChangePassword = (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters.");
      setIsError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setIsError(true);
      return;
    }

    setLoading(true);
    authService
      .changePassword(currentPassword, newPassword)
      .then(() => {
        setMessage("Password changed successfully!");
        setIsError(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowForm(false), 2000);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          "Failed to change password. Please try again.";
        setMessage(msg);
        setIsError(true);
      })
      .finally(() => setLoading(false));
  };

  const handleItemsPerPageChange = (newValue) => {
    setSavingPreference(true);
    setPrefMessage("");
    UserService.updatePreferences({ itemsPerPage: newValue })
      .then(() => {
        dispatch(updateItemsPerPage(newValue));
        setPrefMessage("Saved!");
        setTimeout(() => setPrefMessage(""), 2000);
      })
      .catch((err) => {
        setPrefMessage(err.response?.data?.message || "Failed to save.");
      })
      .finally(() => setSavingPreference(false));
  };

  const handleRecentTaskLimitChange = (newValue) => {
    setSavingPreference(true);
    setPrefMessage("");
    UserService.updatePreferences({ recentTaskLimit: newValue })
      .then(() => {
        dispatch(updateRecentTaskLimit(newValue));
        setPrefMessage("Saved!");
        setTimeout(() => setPrefMessage(""), 2000);
      })
      .catch((err) => {
        setPrefMessage(err.response?.data?.message || "Failed to save.");
      })
      .finally(() => setSavingPreference(false));
  };

  const initials = currentUser.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : "U";

  const roleLabels = currentUser.roles
    ? currentUser.roles.map((r) => r.replace("ROLE_", ""))
    : [];

  const hasPreferences =
    currentUser.featureFlags?.user_preferences ||
    currentUser.featureFlags?.dark_mode ||
    currentUser.featureFlags?.task_prefill;

  return (
    <div className="profile-page">
      {/* ── Hero Banner ── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-hero-content">
          <div className="profile-avatar">{initials}</div>
          <h4 className="profile-name">{currentUser.username}</h4>
          <p className="profile-email">{currentUser.email}</p>
          <div className="profile-roles">
            {roleLabels.map((r) => (
              <span key={r} className="profile-role-badge">
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="profile-cards">
        {/* ── Security Card ── */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-card-icon security">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h6 className="profile-card-title">Security</h6>
              <p className="profile-card-subtitle">Manage your password</p>
            </div>
            <button
              className={`btn btn-sm profile-card-action ${showForm ? "btn-outline-secondary" : "btn-outline-primary"}`}
              onClick={() => {
                setShowForm(!showForm);
                setMessage("");
              }}
            >
              {showForm ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showForm && (
            <div className="profile-card-body">
              {message && (
                <div
                  className={`alert ${isError ? "alert-danger" : "alert-success"} py-2 mb-3`}
                  role="alert"
                >
                  {message}
                </div>
              )}
              <form onSubmit={handleChangePassword}>
                <div className="form-group mb-3">
                  <label htmlFor="currentPassword" className="profile-label">
                    Current Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      id="currentPassword"
                      className="form-control"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      tabIndex={-1}
                    >
                      {showCurrentPw ? (
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
                </div>
                <div className="profile-pw-row">
                  <div className="form-group mb-3 flex-fill">
                    <label htmlFor="newPassword" className="profile-label">
                      New Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showNewPw ? "text" : "password"}
                        id="newPassword"
                        className="form-control"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPw(!showNewPw)}
                        tabIndex={-1}
                      >
                        {showNewPw ? (
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
                  </div>
                  <div className="form-group mb-3 flex-fill">
                    <label htmlFor="confirmPassword" className="profile-label">
                      Confirm Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        id="confirmPassword"
                        className="form-control"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        tabIndex={-1}
                      >
                        {showConfirmPw ? (
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
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    loading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2" />{" "}
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Preferences Card ── */}
        {hasPreferences && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-icon preferences">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div>
                <h6 className="profile-card-title">Preferences</h6>
                <p className="profile-card-subtitle">
                  Customize your experience
                </p>
              </div>
              {prefMessage && (
                <span
                  className={`profile-save-indicator ${prefMessage === "Saved!" ? "success" : "error"}`}
                >
                  {prefMessage === "Saved!" ? "\u2713" : "\u2717"} {prefMessage}
                </span>
              )}
            </div>
            <div className="profile-card-body">
              {/* Items per page */}
              {currentUser.featureFlags?.user_preferences && (
                <div className="profile-pref-row">
                  <div className="profile-pref-info">
                    <span className="profile-pref-label">Items per page</span>
                    <span className="profile-pref-desc">
                      Number of rows shown in tables
                    </span>
                  </div>
                  <select
                    id="itemsPerPage"
                    className="form-control profile-pref-select"
                    value={currentUser.itemsPerPage || 20}
                    disabled={savingPreference}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                  >
                    {ALLOWED_PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Recent tasks prefill limit */}
              {currentUser.featureFlags?.task_prefill && (
                <div className="profile-pref-row">
                  <div className="profile-pref-info">
                    <span className="profile-pref-label">
                      Recent tasks in prefill
                    </span>
                    <span className="profile-pref-desc">
                      Quick-fill options when creating tasks
                    </span>
                  </div>
                  <select
                    id="recentTaskLimit"
                    className="form-control profile-pref-select"
                    value={currentUser.recentTaskLimit || 5}
                    disabled={savingPreference}
                    onChange={(e) =>
                      handleRecentTaskLimitChange(Number(e.target.value))
                    }
                  >
                    {ALLOWED_RECENT_LIMITS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Appearance / Dark mode */}
              {currentUser.featureFlags?.dark_mode && (
                <div className="profile-pref-row profile-pref-row-block">
                  <div className="profile-pref-info">
                    <span className="profile-pref-label">
                      {theme === "dark" ? "\u{1F319}" : "\u{2600}\u{FE0F}"}{" "}
                      Appearance
                    </span>
                    <span className="profile-pref-desc">
                      Currently{" "}
                      <span className={`profile-theme-badge ${theme}`}>
                        {theme === "dark" ? "Dark" : "Light"}
                      </span>
                    </span>
                  </div>

                  <div className="dark-mode-options">
                    <label className="dark-mode-option">
                      <input
                        type="radio"
                        name="darkMode"
                        checked={darkSettings.mode === DARK_MODE_OPTIONS.OFF}
                        onChange={() =>
                          updateDarkSettings({ mode: DARK_MODE_OPTIONS.OFF })
                        }
                      />
                      <div className="option-content">
                        <span className="option-label">Off</span>
                        <span className="option-desc">
                          Always use light mode
                        </span>
                      </div>
                    </label>

                    <label className="dark-mode-option">
                      <input
                        type="radio"
                        name="darkMode"
                        checked={darkSettings.mode === DARK_MODE_OPTIONS.ON}
                        onChange={() =>
                          updateDarkSettings({ mode: DARK_MODE_OPTIONS.ON })
                        }
                      />
                      <div className="option-content">
                        <span className="option-label">On</span>
                        <span className="option-desc">
                          Always use dark mode
                        </span>
                      </div>
                    </label>

                    <label className="dark-mode-option">
                      <input
                        type="radio"
                        name="darkMode"
                        checked={
                          darkSettings.mode === DARK_MODE_OPTIONS.SUNSET_SUNRISE
                        }
                        onChange={() =>
                          updateDarkSettings({
                            mode: DARK_MODE_OPTIONS.SUNSET_SUNRISE,
                          })
                        }
                      />
                      <div className="option-content">
                        <span className="option-label">Sunset to Sunrise</span>
                        <span className="option-desc">
                          Dark from ~{decimalToTime(getSunTimes().sunset)} to ~
                          {decimalToTime(getSunTimes().sunrise)}
                        </span>
                      </div>
                    </label>

                    <label className="dark-mode-option">
                      <input
                        type="radio"
                        name="darkMode"
                        checked={darkSettings.mode === DARK_MODE_OPTIONS.CUSTOM}
                        onChange={() =>
                          updateDarkSettings({ mode: DARK_MODE_OPTIONS.CUSTOM })
                        }
                      />
                      <div className="option-content">
                        <span className="option-label">Custom Schedule</span>
                        <span className="option-desc">Set your own times</span>
                      </div>
                    </label>
                  </div>

                  {darkSettings.mode === DARK_MODE_OPTIONS.CUSTOM && (
                    <div className="custom-schedule mt-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-fill">
                          <label
                            htmlFor="darkFrom"
                            className="small text-muted mb-1 d-block"
                          >
                            Dark mode from
                          </label>
                          <input
                            id="darkFrom"
                            type="time"
                            className="form-control form-control-sm"
                            value={darkSettings.customFrom}
                            onChange={(e) =>
                              updateDarkSettings({ customFrom: e.target.value })
                            }
                          />
                        </div>
                        <span className="mt-3 px-2">&rarr;</span>
                        <div className="flex-fill">
                          <label
                            htmlFor="darkTo"
                            className="small text-muted mb-1 d-block"
                          >
                            Light mode from
                          </label>
                          <input
                            id="darkTo"
                            type="time"
                            className="form-control form-control-sm"
                            value={darkSettings.customTo}
                            onChange={(e) =>
                              updateDarkSettings({ customTo: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
