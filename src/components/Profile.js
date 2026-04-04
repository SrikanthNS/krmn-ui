import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";
import authService from "../services/auth.service";
import UserService from "../services/user.service";
import { updateItemsPerPage, updateDarkModeSettings } from "../slices/auth";

const ALLOWED_PAGE_SIZES = [10, 20, 50, 100];

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

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm mb-4">
        <div
          className="card-header text-white"
          style={{
            background: "linear-gradient(135deg, #4a90d9, #357abd)",
          }}
        >
          <h5 className="mb-0">
            <span role="img" aria-label="profile">
              👤
            </span>{" "}
            {currentUser.username}'s Profile
          </h5>
        </div>
        <div className="card-body">
          <p className="mb-2">
            <strong>Email:</strong> {currentUser.email}
          </p>
          <p className="mb-0">
            <strong>Roles:</strong>{" "}
            {currentUser.roles &&
              currentUser.roles.map((r) => r.replace("ROLE_", "")).join(", ")}
          </p>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <span role="img" aria-label="lock">
              🔒
            </span>{" "}
            Change Password
          </h6>
          <button
            className={`btn btn-sm ${showForm ? "btn-outline-secondary" : "btn-outline-primary"}`}
            onClick={() => {
              setShowForm(!showForm);
              setMessage("");
            }}
          >
            {showForm ? "Cancel" : "Change"}
          </button>
        </div>

        {showForm && (
          <div className="card-body">
            {message && (
              <div
                className={`alert ${isError ? "alert-danger" : "alert-success"} py-2`}
                role="alert"
              >
                {message}
              </div>
            )}
            <form onSubmit={handleChangePassword}>
              <div className="form-group mb-3">
                <label htmlFor="currentPassword">Current Password</label>
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
              <div className="form-group mb-3">
                <label htmlFor="newPassword">New Password</label>
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
              <div className="form-group mb-3">
                <label htmlFor="confirmPassword">Confirm New Password</label>
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

      {/* Preferences */}
      {(currentUser.featureFlags?.user_preferences ||
        currentUser.featureFlags?.dark_mode) && (
        <div className="card shadow-sm mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <span role="img" aria-label="settings">
                &#9881;&#65039;
              </span>{" "}
              Preferences
            </h6>
            {prefMessage && (
              <small
                className={
                  prefMessage === "Saved!" ? "text-success" : "text-danger"
                }
              >
                {prefMessage}
              </small>
            )}
          </div>
          <div className="card-body">
            {currentUser.featureFlags?.user_preferences && (
              <div className="d-flex align-items-center justify-content-between">
                <label htmlFor="itemsPerPage" className="mb-0">
                  Items per page
                </label>
                <select
                  id="itemsPerPage"
                  className="form-control"
                  style={{ width: 100 }}
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
            {currentUser.featureFlags?.dark_mode && (
              <div
                className={`dark-mode-settings${
                  currentUser.featureFlags?.user_preferences
                    ? " mt-3 pt-3 border-top"
                    : ""
                }`}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span>
                    {theme === "dark" ? "\u{1F319}" : "\u{2600}\u{FE0F}"}{" "}
                    Appearance
                  </span>
                  <span
                    className={`badge badge-${theme === "dark" ? "dark" : "light"} border`}
                  >
                    {theme === "dark" ? "Dark" : "Light"}
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
                      <span className="option-desc">Always use light mode</span>
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
                      <span className="option-desc">Always use dark mode</span>
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
                      <span className="mt-3 px-2">→</span>
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
  );
};

export default Profile;
