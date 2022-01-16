import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { clearMessage } from "../../slices/message";


export const ClientForm = (props) => {
    const initialClientState = {
        name: "",
    };
    const [client, setClient] = useState(initialClientState);
    const [loading, setLoading] = useState(false);
    const { message } = useSelector((state) => state.message);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(clearMessage());
    }, [dispatch]);

    const saveClient = (formValues) => {
        const { name } = formValues
        setLoading(true)
        props.saveClient({ name }).then(() => {
            setLoading(false);
        })
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("This field is required!"),
    });
    return (

        <Formik
            initialValues={initialClientState}
            validationSchema={validationSchema}
            onSubmit={saveClient}
        >
            <Form>
                <div>
                    {message && (
                        <div className="form-group">
                            <div className="alert alert-danger" role="alert">
                                {message}
                            </div>
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="name">Name<sup className="text-center text-danger">
                            *</sup>:</label>
                        <Field
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                        />
                        <ErrorMessage
                            name="name"
                            component="div"
                            className="alert alert-danger"
                        />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block">
                            {loading && !message && (
                                <span className="spinner-border spinner-border-sm"></span>
                            )}
                            <span>Submit</span>
                        </button>
                    </div>
                </div ></Form></Formik>)
}