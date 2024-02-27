import { ErrorMessage, Field, Form, Formik } from "formik";
import moment from 'moment';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { clearMessage } from "../../slices/message";

export const TaskForm = (props) => {
    const clients = useSelector(state => state.client);
    const { reviewers } = useSelector(state => state.user);
    const [taskStatus, updateStatus] = useState(false);
    const todaysDate = moment().format('YYYY-MM-DD');
    const initialTaskState = {
        description: "",
        completed: false,
        date: todaysDate,
        clientId: "",
        reviewerId: null,
        minutesSpent: "",
        taskType: "",
        billingCategory: ""
    };
    const [task, setTask] = useState(initialTaskState);
    const [loading, setLoading] = useState(false);
    const { message } = useSelector((state) => state.message);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(clearMessage());
    }, [dispatch]);



    const saveTask = (formValues) => {
        const { description, minutesSpent, clientId, taskType, billingCategory } = formValues
        setLoading(true)
        props.saveTask({ ...task, description, minutesSpent, clientId, taskType, billingCategory}).then(() => {
            setLoading(false);
        })
    }

    const handleInputChange = event => {
        const { name, value } = event.target;
        setTask({ ...task, [name]: value });
    };

    const handleStatus = (e, value) => {
        e.preventDefault();
        updateStatus(value);
        setTask({ ...task, completed: value });
    };

    const validationSchema = Yup.object().shape({
        clientId: Yup.string().required("Please choose the Client"),
        description: Yup.string().required("Please enter the Task Description"),
        minutesSpent: Yup.number().required("Please enter the Time Spent"),
        taskType: Yup.string().required("Please choose Task Type"),
        billingCategory: Yup.string().required("Please choose Billing Category")
    });
    return (

        <Formik
            initialValues={initialTaskState}
            validationSchema={validationSchema}
            onSubmit={saveTask}
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
                        <label htmlFor="clientId">Choose client<sup className="text-center text-danger">
                            *</sup>:</label>

                        <Field as="select" className="form-control" name="clientId" id="clientId">
                            <option value="">Select Client</option>
                            {clients.map(e =>
                                <option key={`client-${e.id}`} value={e.id}>{e.name}</option>
                            )}
                        </Field>
                        <ErrorMessage
                            name="clientId"
                            component="div"
                            className="alert alert-danger"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="taskDate">Date<sup className="text-center text-danger">
                            *</sup>:</label>
                        <input className="form-control" type="date" value={task.date} id="taskDate" name="date" onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="taskType">Choose Task Type<sup className="text-center text-danger">
                            *</sup>:</label>

                        <Field as="select" className="form-control" name="taskType" id="taskType">
                            <option value="">Select Task Type</option>
                            <option key='type-1' value="Income Tax">Income Tax</option>
                            <option key='type-2' value="GST">GST</option>
                            <option key='type-3' value="MCA">MCA</option>
                            <option key='type-4' value="FEMA">FEMA</option>
                            <option key='type-5' value="DGFT">DGFT</option>
                            <option key='type-6' value="Others">Others</option>
                        </Field>
                        <ErrorMessage
                            name="taskType"
                            component="div"
                            className="alert alert-danger"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="billingCategory">Choose Billing Category<sup className="text-center text-danger">
                            *</sup>:</label>

                        <Field as="select" className="form-control" name="billingCategory" id="billingCategory">
                            <option value="">Select Billing Category</option>
                            <option key='billing-cat-1' value="Billable">Billable</option>
                            <option key='billing-cat-2' value="Non-Billable">Non-Billable</option>
                            <option key='billing-cat-3' value="Retainer">Retainer</option>
                        </Field>
                        <ErrorMessage
                            name="billingCategory"
                            component="div"
                            className="alert alert-danger"
                        />
                    </div>


                    <div className="form-group">
                        <label htmlFor="description">Description<sup className="text-center text-danger">
                            *</sup>:</label>
                        <Field
                            type="text"
                            className="form-control"
                            id="description"
                            name="description"
                        />
                        <ErrorMessage
                            name="description"
                            component="div"
                            className="alert alert-danger"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="minutesSpent">Time Spent<sup className="text-center text-danger">
                            *</sup>:</label>
                        <Field type="number" className="form-control" id="minutesSpent"
                            name="minutesSpent" />

                        <ErrorMessage
                            name="minutesSpent"
                            component="div"
                            className="alert alert-danger"
                        />
                    </div>
                    <div className="form-group">
                        <label>Status<sup className="text-center text-danger">
                            *</sup>:</label>
                        <button
                            className="btn btn-md btn-info mr-2"
                            onClick={(e) => handleStatus(e, !taskStatus)}
                        >
                            In-progress {!taskStatus && < input type="checkbox" defaultChecked />}
                        </button>
                        <button
                            className="btn btn-md mr-2 btn-primary"
                            onClick={(e) => handleStatus(e, !taskStatus)}
                        >
                            completed {taskStatus && < input type="checkbox" defaultChecked />}
                        </button>
                    </div>
                    {taskStatus && <div className="form-group">
                        <label htmlFor="reviewers">Reviewer By: <small className="text-center text-muted">
                            (optional)</small>: </label>

                        <select className="form-control" onChange={handleInputChange} name="reviewerId" id="reviewers">
                            <option value={null}>Select Reviewer</option>
                            {reviewers.map(e =>
                                <option key={`reviewer-${e.id}`} value={e.id}>{e.username}</option>
                            )}
                        </select>
                    </div>}


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