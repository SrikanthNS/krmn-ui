import { ErrorMessage, Field, Form, Formik } from "formik";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { clearMessage } from "../../slices/message";
import SearchableSelect from "../SearchableSelect";

const RequiredMark = () => <span className="tf-required">*</span>;

export const TaskForm = ({ saveTask }) => {
  const clients = useSelector((state) => state.client);
  const { reviewers, users } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [taskStatus, setTaskStatus] = useState("in-progress");
  const [taskDate, setTaskDate] = useState(moment().format("YYYY-MM-DD"));
  const [reviewerId, setReviewerId] = useState(null);
  const [assigneeId, setAssigneeId] = useState("");
  const [loading, setLoading] = useState(false);
  const { message } = useSelector((state) => state.message);

  const isAdminOrMod = currentUser?.roles?.some(
    (r) => r === "ROLE_ADMIN" || r === "ROLE_MODERATOR",
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  const initialValues = {
    description: "",
    clientId: "",
    minutesSpent: "",
    taskType: "",
    billingCategory: "",
  };

  const validationSchema = Yup.object().shape({
    clientId: Yup.string().required("Client is required"),
    description: Yup.string().required("Description is required"),
    minutesSpent: Yup.number()
      .typeError("Must be a number")
      .positive("Must be positive")
      .required("Time spent is required"),
    taskType: Yup.string().required("Task type is required"),
    billingCategory: Yup.string().required("Billing category is required"),
  });

  const handleSubmit = (formValues) => {
    setLoading(true);
    const isCompleted = taskStatus === "completed";
    const payload = {
      ...formValues,
      date: taskDate,
      completed: isCompleted,
      status: taskStatus,
      reviewerId: isCompleted ? reviewerId : null,
      ...(isAdminOrMod && assigneeId ? { userId: assigneeId } : {}),
    };
    console.log(
      "[TaskForm] DEBUG: isAdminOrMod =",
      isAdminOrMod,
      "| assigneeId =",
      assigneeId,
      "| payload.userId =",
      payload.userId,
    );
    saveTask(payload)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched }) => (
        <Form className="tf-form">
          {message && (
            <div className="alert alert-danger tf-alert" role="alert">
              {message}
            </div>
          )}

          {/* Row 1: Client + Date */}
          <div className="tf-row">
            <div className="tf-field">
              <label htmlFor="clientId">
                Client <RequiredMark />
              </label>
              <Field name="clientId">
                {({ field, form }) => (
                  <SearchableSelect
                    id="clientId"
                    placeholder="Choose a client…"
                    options={(clients || []).map((c) => ({
                      value: String(c.id),
                      label: c.name,
                    }))}
                    value={field.value}
                    onChange={(val) => form.setFieldValue("clientId", val)}
                    className={
                      errors.clientId && touched.clientId ? "is-invalid" : ""
                    }
                  />
                )}
              </Field>
              <ErrorMessage
                name="clientId"
                component="div"
                className="tf-error"
              />
            </div>

            <div className="tf-field">
              <label htmlFor="taskDate">
                Date <RequiredMark />
              </label>
              <input
                type="date"
                id="taskDate"
                className="form-control"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Task Type + Billing Category */}
          <div className="tf-row">
            <div className="tf-field">
              <label htmlFor="taskType">
                Task Type <RequiredMark />
              </label>
              <Field name="taskType">
                {({ field, form }) => (
                  <SearchableSelect
                    id="taskType"
                    placeholder="Pick a task type…"
                    options={[
                      { value: "Income Tax", label: "Income Tax" },
                      { value: "GST", label: "GST" },
                      { value: "MCA", label: "MCA" },
                      { value: "FEMA", label: "FEMA" },
                      { value: "DGFT", label: "DGFT" },
                      { value: "Others", label: "Others" },
                    ]}
                    value={field.value}
                    onChange={(val) => form.setFieldValue("taskType", val)}
                    className={
                      errors.taskType && touched.taskType ? "is-invalid" : ""
                    }
                  />
                )}
              </Field>
              <ErrorMessage
                name="taskType"
                component="div"
                className="tf-error"
              />
            </div>

            <div className="tf-field">
              <label htmlFor="billingCategory">
                Billing Category <RequiredMark />
              </label>
              <Field name="billingCategory">
                {({ field, form }) => (
                  <SearchableSelect
                    id="billingCategory"
                    placeholder="Pick a billing category…"
                    options={[
                      { value: "Billable", label: "Billable" },
                      { value: "Non-Billable", label: "Non-Billable" },
                      { value: "Retainer", label: "Retainer" },
                    ]}
                    value={field.value}
                    onChange={(val) =>
                      form.setFieldValue("billingCategory", val)
                    }
                    className={
                      errors.billingCategory && touched.billingCategory
                        ? "is-invalid"
                        : ""
                    }
                  />
                )}
              </Field>
              <ErrorMessage
                name="billingCategory"
                component="div"
                className="tf-error"
              />
            </div>
          </div>

          {/* Row 3: Description (full width) */}
          <div className="tf-row tf-row-full">
            <div className="tf-field">
              <label htmlFor="description">
                Description <RequiredMark />
              </label>
              <Field
                as="textarea"
                name="description"
                id="description"
                rows="3"
                placeholder="Briefly describe the work performed…"
                className={`form-control ${errors.description && touched.description ? "is-invalid" : ""}`}
              />
              <ErrorMessage
                name="description"
                component="div"
                className="tf-error"
              />
            </div>
          </div>

          {/* Row 4: Time Spent + Status */}
          <div className="tf-row">
            <div className="tf-field">
              <label htmlFor="minutesSpent">
                Time Spent (minutes) <RequiredMark />
              </label>
              <Field
                type="number"
                name="minutesSpent"
                id="minutesSpent"
                min="1"
                placeholder="e.g. 90 (in minutes)"
                className={`form-control ${errors.minutesSpent && touched.minutesSpent ? "is-invalid" : ""}`}
              />
              <ErrorMessage
                name="minutesSpent"
                component="div"
                className="tf-error"
              />
            </div>

            <div className="tf-field">
              <label>
                Status <RequiredMark />
              </label>
              <div className="tf-status-toggle">
                <button
                  type="button"
                  className={`tf-status-btn ${taskStatus === "todo" ? "active todo" : ""}`}
                  onClick={() => setTaskStatus("todo")}
                >
                  Todo
                </button>
                <button
                  type="button"
                  className={`tf-status-btn ${taskStatus === "in-progress" ? "active in-progress" : ""}`}
                  onClick={() => setTaskStatus("in-progress")}
                >
                  In-Progress
                </button>
                <button
                  type="button"
                  className={`tf-status-btn ${taskStatus === "completed" ? "active completed" : ""}`}
                  onClick={() => setTaskStatus("completed")}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {/* Assign To (admin/mod only) */}
          {isAdminOrMod && (
            <div className="tf-row tf-row-full tf-slide-in">
              <div className="tf-field">
                <label htmlFor="assigneeId">
                  Assign To{" "}
                  <small className="text-muted">(leave empty for self)</small>
                </label>
                <SearchableSelect
                  id="assigneeId"
                  placeholder="Assign to yourself…"
                  options={(users || [])
                    .filter((u) => u.isActive !== false)
                    .map((u) => ({
                    value: String(u.id),
                    label: u.username,
                  }))}
                  value={assigneeId}
                  onChange={(val) => setAssigneeId(val || "")}
                />
              </div>
            </div>
          )}

          {/* Reviewer (conditional) */}
          {taskStatus === "completed" && (
            <div className="tf-row tf-row-full tf-slide-in">
              <div className="tf-field">
                <label htmlFor="reviewerId">
                  Approved By <small className="text-muted">(optional)</small>
                </label>
                <SearchableSelect
                  id="reviewerId"
                  placeholder="Choose an approver…"
                  options={(reviewers || []).map((r) => ({
                    value: String(r.id),
                    label: r.username,
                  }))}
                  value={reviewerId || ""}
                  onChange={(val) => setReviewerId(val || null)}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="tf-submit-row">
            <button
              type="submit"
              className="btn btn-primary tf-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2" />{" "}
                  Saving...
                </>
              ) : (
                "Submit Task"
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
