import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { retrieveClients } from "../../slices/clients";
import { createTask } from "../../slices/tasks";
import { retrieveReviewers } from "../../slices/users";
import { TaskForm } from "./TaskForm";

const AddTask = () => {
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();

  const initFetch = useCallback(() => {
    dispatch(retrieveClients());
    dispatch(retrieveReviewers());
  }, [dispatch]);

  useEffect(() => {
    initFetch();
  }, [initFetch]);

  const saveTask = (task) => {
    const {
      description,
      completed,
      date,
      minutesSpent,
      reviewerId,
      clientId,
      taskType,
      billingCategory,
    } = task;
    return dispatch(
      createTask({
        description,
        date,
        completed,
        minutesSpent,
        reviewerId,
        clientId,
        taskType,
        billingCategory,
      }),
    )
      .unwrap()
      .then(() => {
        setSubmitted(true);
      });
  };

  const addAnother = () => {
    setSubmitted(false);
  };

  return (
    <div className="add-task-page">
      <div className="add-task-card">
        <div className="add-task-card-header">
          <h4>
            <span role="img" aria-label="task">
              &#128221;
            </span>{" "}
            New Task
          </h4>
          <p className="add-task-subtitle">
            Fill in the details below to log a new task
          </p>
        </div>

        <div className="add-task-card-body">
          {submitted ? (
            <div className="success-state">
              <div className="success-icon">&#10004;</div>
              <h5>Task Submitted Successfully!</h5>
              <p className="text-muted">Your task has been logged and saved.</p>
              <div className="success-actions">
                <button className="btn btn-primary" onClick={addAnother}>
                  + Add Another Task
                </button>
                <a href="/tasks" className="btn btn-outline-secondary">
                  View All Tasks
                </a>
              </div>
            </div>
          ) : (
            <TaskForm saveTask={saveTask} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTask;
