import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { retrieveClients } from '../../slices/clients';
import { createTask } from "../../slices/tasks";
import { retrieveReviewers } from '../../slices/users';
// import AddIcon from '@mui/icons-material/Add';
import { TaskForm } from "./TaskForm";

const AddTask = () => {
    const [submitted, setSubmitted] = useState(false);
    const [taskList, setTaskList] = useState([]);
    const dispatch = useDispatch();

    const saveTask = (task) => {
        const { description, completed, date, minutesSpent, reviewerId, clientId } = task;
        dispatch(createTask({ description, date, completed, minutesSpent, reviewerId, clientId }))
            .unwrap()
            .then(() => {
                setTaskList([]);
                setSubmitted(true);
            })
            .catch(e => {
                console.log("🚀 ~ file: AddTask.js ~ line 34 ~ saveTask ~ e", e.message)
            });
    };

    const initFetch = useCallback(async () => {
        dispatch(retrieveClients());
        dispatch(retrieveReviewers());
        setTaskList([<TaskForm key="task-1" saveTask={saveTask} />]);
    }, [dispatch])

    useEffect(() => {
        initFetch();
    }, [initFetch])


    const newTask = () => {
        setTaskList([...taskList, <TaskForm key="task1" saveTask={saveTask} />]);
        setSubmitted(false);
    };



    return (
        <div className="col-md-12 table-responsive-md">
            <h4>New Task</h4>
            <hr></hr>
            <div className="submit-form" >
                {submitted ? (
                    <div>
                        <h4>You submitted successfully!</h4>
                        <button className="btn btn-success" onClick={(clients, reviewers) => newTask()}>
                            Add
                        </button>
                    </div>
                ) :
                    (<div className="row">
                        {/* <div >
                        <button className="btn btn-success" onClick={newTask}>
                            Add <AddIcon />
                        </button>
                    </div> */}
                        <div className="col-md-12" style={{ display: 'flex', flexDirection: 'column' }} >
                            {taskList.map(eachTask => eachTask)}
                        </div>
                    </div >)
                }

            </div >
        </div>

    );
};

export default AddTask;