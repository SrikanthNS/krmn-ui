import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createClient } from "../../slices/clients";
import { ClientForm } from "./ClientForm";

const AddClient = () => {
    const [submitted, setSubmitted] = useState(false);
    const dispatch = useDispatch();

    const saveClient = (client) => {
        const { name } = client;
        return dispatch(createClient({ name }))
            .unwrap()
            .then(() => setSubmitted(true))
            .catch((e) => console.log(e.message));
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 480 }}>
                <div className="auth-card-header">
                    <div className="auth-avatar">&#128101;</div>
                    <h2>Add Client</h2>
                    <p>Register a new client for task tracking</p>
                </div>
                <div className="auth-card-body">
                    {submitted ? (
                        <div className="success-state">
                            <div className="success-icon">&#10004;</div>
                            <h5>Client Created Successfully!</h5>
                            <div className="success-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setSubmitted(false)}
                                >
                                    + Add Another
                                </button>
                                <a href="/clientList" className="btn btn-outline-secondary">
                                    View All Clients
                                </a>
                            </div>
                        </div>
                    ) : (
                        <ClientForm saveClient={saveClient} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddClient;