import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { clearMessage } from "../../slices/message";

export const ClientForm = (props) => {
    const [loading, setLoading] = useState(false);
    const { message } = useSelector((state) => state.message);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(clearMessage());
    }, [dispatch]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Client name is required"),
    });

    const saveClient = (formValues) => {
        setLoading(true);
        props.saveClient({ name: formValues.name }).then(() => setLoading(false));
    };

    return (
        <Formik
            initialValues={{ name: "" }}
            validationSchema={validationSchema}
            onSubmit={saveClient}
        >
            {({ errors, touched }) => (
                <Form>
                    {message && (
                        <div className="auth-message error">{message}</div>
                    )}
                    <div className="auth-field">
                        <label htmlFor="name">Client Name <span className="text-danger">*</span></label>
                        <Field
                            type="text"
                            className={`form-control ${errors.name && touched.name ? "is-invalid" : ""}`}
                            id="name"
                            name="name"
                            placeholder="Enter client name"
                        />
                        <ErrorMessage name="name" component="div" className="auth-error" />
                    </div>
                    <button type="submit" className="btn-auth-submit" disabled={loading}>
                        {loading ? (
                            <span className="spinner-border spinner-border-sm mr-2" />
                        ) : null}
                        {loading ? "Saving..." : "Create Client"}
                    </button>
                </Form>
            )}
        </Formik>
    );
};