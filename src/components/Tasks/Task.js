import React, { useEffect, useState } from "react";
import moment from 'moment';
import { useDispatch, useSelector } from "react-redux";
import TaskDataService from "../../services/task.service";
import { deleteTask, updateTask } from "../../slices/tasks";

const Task = (props) => {
    const initialTaskState = {
        id: null,
        clientId: null,
        date: null,
        description: "",
        minutesSpent: null,
        completed: false,
        reviewerId: null,
        taskType: ""
    };

    const clients = useSelector(state => state.client);
    const { reviewers } = useSelector(state => state.user);
    const [currentTask, setCurrentTask] = useState(initialTaskState);
    const [message, setMessage] = useState("");

    const dispatch = useDispatch();

    const getTask = id => {
        TaskDataService.get(id)
            .then(response => {
                setCurrentTask(
                    { ...response.data, ...(response.data?.taskType === undefined || null && { taskType: '' }) });
            })
            .catch(e => {
                console.log(e);
            });
    };

    useEffect(() => {
        getTask(props.match.params.id);
    }, [props.match.params.id]);

    const handleInputChange = event => {
        const { name, value } = event.target;
        setCurrentTask({ ...currentTask, [name]: value });
    };

    const updateStatus = status => {

        const data = {
            id: currentTask.id,
            clientId: currentTask.clientId,
            reviewerId: currentTask.reviewerId,
            description: currentTask.description,
            completed: status,
            minutesSpent: currentTask.minutesSpent,
            date: currentTask.date,
            taskType: currentTask.taskType,
        };

        dispatch(updateTask({ id: currentTask.id, data }))
            .unwrap()
            .then(response => {
                console.log(response);
                setCurrentTask({ ...currentTask, completed: status, ...(!status && { reviewerId: null }) });
                setMessage("The status was updated successfully!");
            })
            .catch(e => {
                console.log(e);
            });
    };

    const updateContent = () => {
        dispatch(updateTask({ id: currentTask.id, data: currentTask }))
            .unwrap()
            .then(response => {
                console.log(response);
                setMessage("The task was updated successfully!");
            })
            .catch(e => {
                console.log(e);
            });
    };

    const removeTask = () => {
        dispatch(deleteTask({ id: currentTask.id }))
            .unwrap()
            .then(() => {
                props.history.push("/tasks");
            })
            .catch(e => {
                console.log(e);
            });
    };

    return (
        <div className="col-md-12 table-responsive-md">
            <h4>Edit Task</h4>
            <hr></hr>
            {currentTask ? (
                < div className="edit-form">

                    <form>
                        <div className="form-group">
                            <label htmlFor="client">Choose client:</label>

                            <select className="form-control" onChange={handleInputChange} name="clientId" id="clients">
                                <option value="">Select Client</option>
                                {clients.map(e =>
                                    <option key={`client-${e.id}`} selected={currentTask.clientId === e.id} value={e.id}>{e.name}</option>
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="taskDate">Date:</label>
                            <input className="form-control" type="date" value={moment(currentTask.date).format(('YYYY-MM-DD'))} id="taskDate" name="date" onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="taskType">Choose task type<sup className="text-center text-danger">
                                *</sup>:</label>

                            <select className="form-control" onChange={handleInputChange} name="taskType" id="taskType">
                                <option selected={currentTask.taskType === ""} value="">Select Task Type</option>
                                <option selected={currentTask.taskType === "Income Tax"} key='type-1' value="Income Tax">Income Tax</option>
                                <option selected={currentTask.taskType === "GST"} key='type-2' value="GST">GST</option>
                                <option selected={currentTask.taskType === "MCA"} key='type-3' value="MCA">MCA</option>
                                <option selected={currentTask.taskType === "FEMA"} key='type-4' value="FEMA">FEMA</option>
                                <option selected={currentTask.taskType === "DGFT"} key='type-5' value="DGFT">DGFT</option>
                                <option selected={currentTask.taskType === "Others"} key='type-6' value="Others">Others</option>
                            </select>

                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                className="form-control"
                                id="description"
                                name="description"
                                value={currentTask.description}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="minutesSpent">Time Spent:</label>
                            <input
                                type="number"
                                className="form-control"
                                id="minutesSpent"
                                required
                                value={currentTask.minutesSpent || ''}
                                onChange={handleInputChange}
                                name="minutesSpent"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <strong>Status:</strong>
                            </label>
                            {currentTask.completed ? "Completed" : "In-progress"}
                        </div>
                        {currentTask.completed && <div className="form-group">
                            <label htmlFor="reviewers">Reviewer:</label>

                            <select className="form-control" onChange={handleInputChange} name="reviewerId" id="reviewers">
                                <option value={null}>Select Reviewer</option>
                                {reviewers.map(e =>
                                    <option selected={currentTask.reviewerId === e.id} key={`reviewer-${e.id}`} value={e.id}>{e.username}</option>
                                )}
                            </select>
                        </div>}
                    </form>

                    {currentTask.completed ? (
                        <button
                            className="btn btn-md btn-primary mr-2"
                            onClick={() => updateStatus(false)}
                        >
                            In-Progress
                        </button>
                    ) : (
                        <button
                            className="btn btn-md btn-info mr-2"
                            onClick={() => updateStatus(true)}
                        >
                            Completed
                        </button>
                    )}

                    <button className="btn btn-md btn-danger mr-2" onClick={removeTask}>
                        Delete
                    </button>

                    <button
                        type="submit"
                        className="btn btn-md mr-2 btn-success"
                        onClick={updateContent}
                    >
                        Update
                    </button>
                    <p>{message}</p>
                </div>
            ) : (
                <div>
                    <br />
                    <p>Please click on a Task to view...</p>
                </div>
            )
            }
        </div >
    );
};

export default Task;