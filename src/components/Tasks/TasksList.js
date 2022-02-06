import moment from 'moment';
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { retrieveClients } from '../../slices/clients';
import {
    deleteAllTasks, deleteTask, findTasksByTitle, retrieveTasks, downloadTasks
} from "../../slices/tasks";
import { retrieveReviewers, retrieveAllUsers } from '../../slices/users';


const TasksList = () => {
    const [searchTitle, setSearchTitle] = useState("");
    const tasks = useSelector(state => state.tasks);
    const clients = useSelector(state => state.client);
    const { reviewers, users } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const [showUserCol, setShowUserCol] = useState(false);

    const onChangeSearchTitle = e => {
        const searchTitle = e.target.value;
        setSearchTitle(searchTitle);
    };

    const initFetch = useCallback(() => {
        dispatch(retrieveClients());
        dispatch(retrieveReviewers());
        dispatch(retrieveAllUsers());
        dispatch(retrieveTasks());
    }, [dispatch])

    useEffect(() => {
        if (currentUser && currentUser.roles.includes("ROLE_ADMIN")) {
            setShowUserCol(true);
        } else {
            setShowUserCol(false);
        }
    }, [currentUser]);

    useEffect(() => {
        initFetch()
    }, [initFetch])

    const removeTask = (id) => {
        if (!window.confirm("Are you sure you want to delete the task ?")) {
            return
        }
        dispatch(deleteTask({ id }))
            .unwrap()
            .catch(e => {
                console.log(e);
            });
    };

    const removeAllTasks = () => {
        if (!window.confirm("Are you sure you want to delete all tasks ?")) {
            return
        }
        dispatch(deleteAllTasks())
            .catch(e => {
                console.log(e);
            });
    };

    const findByTitle = () => {
        dispatch(findTasksByTitle({ description: searchTitle }));
    };

    const download = () => {
        dispatch(downloadTasks());
    };


    const onSearchSubmit = e => {
        if (e.code === 'Enter') {
            findByTitle();
        }
    };

    return (
        <div className=" row">
            <div className="col-md-12">
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by description"
                        value={searchTitle}
                        onChange={onChangeSearchTitle}
                        onKeyPress={onSearchSubmit}
                    />
                    <div className="input-group-append">
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={findByTitle}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
            <div className="col-md-12 table-responsive-md">
                <h4>Task List</h4>
                {tasks &&
                    <>

                        <div className="d-flex justify-content-end">
                            <button
                                className="m-3 btn btn-sm btn-primary"
                                type="button"
                                onClick={download}
                            >
                                Download
                            </button>
                        </div>

                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        #
                                    </th>
                                    {showUserCol && <th scope="col">
                                        User
                                    </th>}
                                    <th scope="col">
                                        Client
                                    </th>
                                    <th scope="col">
                                        Type
                                    </th>
                                    <th scope="col">
                                        Desc
                                    </th>
                                    <th scope="col">
                                        Date
                                    </th>
                                    <th scope="col">
                                        Time Spent
                                    </th>
                                    <th scope="col">
                                        Status
                                    </th>
                                    <th scope="col">
                                        Reviewer
                                    </th>
                                    <th scope="col" colSpan="2">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody >
                                {tasks.map((task, index) => {
                                    let clientName = "";
                                    clients.map(client => {
                                        if (client.id === task.clientId) {
                                            clientName = client.name;
                                        }
                                        return true
                                    });
                                    let reviewerName = "";
                                    let userName = "";
                                    reviewers.map(reviewer => {
                                        if (reviewer.id === task.reviewerId) {
                                            reviewerName = reviewer.username;
                                        }
                                        return true
                                    });

                                    showUserCol && users.map(user => {
                                        if (user.id === task.userId) {
                                            userName = user.username;
                                        }
                                        return true
                                    })

                                    return (
                                        <tr key={`task-row-${index}`} className={
                                            (task.completed ? "table-success" : "table-warning")
                                        }>
                                            <td>
                                                {index + 1}
                                            </td>
                                            {showUserCol && <td>
                                                {userName}
                                            </td>}
                                            <td>
                                                {clientName}
                                            </td>
                                            <td>
                                                {task?.taskType ? task.taskType : ''}
                                            </td>
                                            <td>
                                                {task.description}
                                            </td>
                                            <td>
                                                {moment(task.date).format('DD/MM/yyyy')}
                                            </td>
                                            <td>
                                                {task.minutesSpent} mins
                                            </td>
                                            <td>
                                                {task.completed ? "Completed" : "In-Progress"}
                                            </td>
                                            <td>
                                                {reviewerName}
                                            </td>
                                            <td colSpan="2">
                                                <div style={{ display: 'inline-flex' }}>
                                                    <Link
                                                        to={"/tasks/" + task.id}
                                                        className="btn btn-sm btn-warning mr-2 mt-0"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button className="btn btn-sm btn-danger mr-2 mt-0" onClick={() => removeTask(task.id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </>

                }
            </div >
            <div className="col-md-12 table-responsive-md">
                {
                    tasks.length === 0 ?

                        <div className="d-flex justify-content-center">
                            <h5 className="text-center text-info">
                                No Records Found
                            </h5>
                        </div>
                        :
                        <div className="d-flex justify-content-end">

                            <button
                                className="m-3 btn btn-sm btn-danger"
                                onClick={removeAllTasks}
                            >
                                Remove All
                            </button>
                        </div>

                }
            </div >
        </div>
    );
};

export default TasksList;