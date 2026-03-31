import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Redirect } from 'react-router-dom';
import authService from "../services/auth.service";

const Profile = () => {
    const { user: currentUser } = useSelector((state) => state.auth);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

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
                        <span role="img" aria-label="profile">👤</span>{" "}
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
                            currentUser.roles
                                .map((r) => r.replace("ROLE_", ""))
                                .join(", ")}
                    </p>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                        <span role="img" aria-label="lock">🔒</span> Change Password
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
                                <input
                                    type="password"
                                    id="currentPassword"
                                    className="form-control"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="form-control"
                                    placeholder="At least 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="form-control"
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
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
        </div>
    );
};

export default Profile;