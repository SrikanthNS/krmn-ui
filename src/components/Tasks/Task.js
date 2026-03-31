import React, { useCallback, useEffect, useState } from "react";
import moment from 'moment';
import { useDispatch, useSelector } from "react-redux";
import TaskDataService from "../../services/task.service";
import { deleteTask, updateTask } from "../../slices/tasks";
import { retrieveAllUsers } from "../../slices/users";
import SearchableSelect from "../SearchableSelect";

const Task = (props) => {
    const initialTaskState = {
        id: null,
        clientId: null,
        date: null,
        description: "",
        minutesSpent: null,
        completed: false,
        status: "in-progress",
        reviewerId: null,
        taskType: "",
        billingCategory: ""
    };

    const clients = useSelector(state => state.client);
    const { reviewers, users } = useSelector(state => state.user);
    const { user: currentUser } = useSelector(state => state.auth);
    const [currentTask, setCurrentTask] = useState(initialTaskState);
    const [message, setMessage] = useState("");

    const isAdminOrMod = currentUser?.roles?.some(
        (r) => r === "ROLE_ADMIN" || r === "ROLE_MODERATOR",
    );

    const dispatch = useDispatch();

    const initFetch = useCallback(() => {
        dispatch(retrieveAllUsers());
    }, [dispatch]);

    useEffect(() => {
        initFetch();
    }, [initFetch]);

    const getTask = id => {
        TaskDataService.get(id)
            .then(response => {
                setCurrentTask(
                    { ...response.data, ...((response.data?.taskType === undefined || null) && { taskType: '' }) });
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

    const updateStatus = (newStatus) => {
        const isCompleted = newStatus === "completed";
        const data = {
            id: currentTask.id,
            clientId: currentTask.clientId,
            reviewerId: isCompleted ? currentTask.reviewerId : null,
            description: currentTask.description,
            completed: isCompleted,
            status: newStatus,
            minutesSpent: currentTask.minutesSpent,
            date: currentTask.date,
            userId: currentTask.userId,
            taskType: currentTask.taskType,
            billingCategory: currentTask.billingCategory
        };

        dispatch(updateTask({ id: currentTask.id, data }))
            .unwrap()
            .then(response => {
                console.log(response);
                setCurrentTask({ ...currentTask, completed: isCompleted, status: newStatus, ...(!isCompleted && { reviewerId: null }) });
                setMessage("The status was updated successfully!");
            })
            .catch(e => {
                setMessage(e.message);
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
                setMessage(e.message);
                console.log(e.message);
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
                            <label htmlFor="taskType">Choose Task Type<sup className="text-center text-danger">
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
                            <label htmlFor="billingCategory">Choose Billing Category<sup className="text-center text-danger">
                                *</sup>:</label>

                            <select className="form-control" onChange={handleInputChange} name="billingCategory" id="billingCategory">
                                <option selected={!currentTask?.billingCategory} value="">Select Billing Category</option>
                                <option selected={currentTask?.billingCategory === "Billable"}     key='billing-cat-1' value="Billable">Billable</option>
                                <option selected={currentTask?.billingCategory === "Non-Billable"} key='billing-cat-2' value="Non-Billable">Non-Billable</option>
                                <option selected={currentTask?.billingCategory === "Retainer"}     key='billing-cat-3' value="Retainer">Retainer</option>
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
                            {" "}{(currentTask.status || (currentTask.completed ? "completed" : "in-progress")).replace(/^\w/, c => c.toUpperCase()).replace("-", " ")}
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

                        {isAdminOrMod && (
                            <div className="form-group">
                                <label htmlFor="assigneeId">
                                    Assigned To
                                </label>
                                <SearchableSelect
                                    id="assigneeId"
                                    placeholder="Select user…"
                                    options={(users || [])
                                        .filter((u) => u.isActive !== false)
                                        .map((u) => ({
                                            value: String(u.id),
                                            label: u.username,
                                        }))}
                                    value={String(currentTask.userId || "")}
                                    onChange={(val) =>
                                        setCurrentTask({ ...currentTask, userId: val ? parseInt(val, 10) : currentTask.userId })
                                    }
                                />
                            </div>
                        )}
                    </form>

                    <div className="mb-2">
                        {(currentTask.status || (currentTask.completed ? "completed" : "in-progress")) !== "todo" && (
                            <button
                                className="btn btn-md btn-secondary mr-2"
                                onClick={() => updateStatus("todo")}
                            >
                                Todo
                            </button>
                        )}
                        {(currentTask.status || (currentTask.completed ? "completed" : "in-progress")) !== "in-progress" && (
                            <button
                                className="btn btn-md btn-primary mr-2"
                                onClick={() => updateStatus("in-progress")}
                            >
                                In-Progress
                            </button>
                        )}
                        {(currentTask.status || (currentTask.completed ? "completed" : "in-progress")) !== "completed" && (
                            <button
                                className="btn btn-md btn-info mr-2"
                                onClick={() => updateStatus("completed")}
                            >
                                Completed
                            </button>
                        )}
                    </div>

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