import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendAgentMessage,
  addUserMessage,
  clearChat,
} from "../../slices/agent";

const QUICK_ACTIONS = [
  { label: "My Tasks", message: "show my tasks" },
  { label: "Task Summary", message: "task summary" },
  { label: "Clients", message: "list clients" },
  { label: "My Profile", message: "my profile" },
];

const AgentChat = () => {
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const { messages, loading } = useSelector((state) => state.agent);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [minimized]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    dispatch(addUserMessage(trimmed));
    dispatch(sendAgentMessage(trimmed));
    setInput("");
  }, [input, loading, dispatch]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (message) => {
    dispatch(addUserMessage(message));
    dispatch(sendAgentMessage(message));
  };

  const renderAgentContent = (content) => {
    if (!content) return null;

    const parts = [];

    // Main message
    if (content.message) {
      parts.push(
        <p key="msg" className="agent-msg-text">
          {content.message}
        </p>,
      );
    }

    // Capabilities (help)
    if (content.capabilities) {
      parts.push(
        <ul key="caps" className="agent-capabilities">
          {content.capabilities.map((c) => (
            <li
              key={c}
              dangerouslySetInnerHTML={{
                __html: c.replaceAll(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          ))}
        </ul>,
      );
    }

    // Task list
    if (content.tasks && content.tasks.length > 0) {
      parts.push(
        <div key="tasks" className="agent-data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Status</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {content.tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td title={t.description}>
                    {t.description && t.description.length > 40
                      ? t.description.substring(0, 40) + "…"
                      : t.description}
                  </td>
                  <td>
                    <span className={`agent-status agent-status-${t.status}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{t.taskType}</td>
                  <td>
                    {t.date ? new Date(t.date).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    }

    // Single task detail
    if (content.task && !content.tasks) {
      const t = content.task;
      parts.push(
        <div key="task-detail" className="agent-task-detail">
          <div>
            <strong>ID:</strong> {t.id}
          </div>
          <div>
            <strong>Description:</strong> {t.description}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span className={`agent-status agent-status-${t.status}`}>
              {t.status}
            </span>
          </div>
          <div>
            <strong>Type:</strong> {t.taskType}
          </div>
          <div>
            <strong>Category:</strong> {t.billingCategory}
          </div>
          {t.minutesSpent != null && (
            <div>
              <strong>Time:</strong> {t.minutesSpent} min
            </div>
          )}
          {t.client && (
            <div>
              <strong>Client:</strong> {t.client}
            </div>
          )}
          {t.owner && (
            <div>
              <strong>Owner:</strong> {t.owner}
            </div>
          )}
          {t.reviewer && (
            <div>
              <strong>Reviewer:</strong> {t.reviewer}
            </div>
          )}
          <div>
            <strong>Date:</strong>{" "}
            {t.date ? new Date(t.date).toLocaleDateString() : "-"}
          </div>
        </div>,
      );
    }

    // Task summary
    if (content.summary) {
      const s = content.summary;
      parts.push(
        <div key="summary" className="agent-summary">
          <div className="agent-summary-grid">
            <div className="agent-summary-item">
              <span className="agent-summary-num">{s.total}</span>
              <span className="agent-summary-label">Total</span>
            </div>
            <div className="agent-summary-item" style={{ color: "#6c757d" }}>
              <span className="agent-summary-num">{s.todo}</span>
              <span className="agent-summary-label">Todo</span>
            </div>
            <div className="agent-summary-item" style={{ color: "#0d6efd" }}>
              <span className="agent-summary-num">{s.inProgress}</span>
              <span className="agent-summary-label">In Progress</span>
            </div>
            <div className="agent-summary-item" style={{ color: "#198754" }}>
              <span className="agent-summary-num">{s.completed}</span>
              <span className="agent-summary-label">Completed</span>
            </div>
          </div>
          <div className="agent-summary-time">Total Time: {s.totalTime}</div>
        </div>,
      );
    }

    // Clients list
    if (content.clients && content.clients.length > 0) {
      parts.push(
        <div key="clients" className="agent-data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {content.clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    }

    // Users list
    if (content.users && content.users.length > 0) {
      parts.push(
        <div key="users" className="agent-data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {content.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.isActive ? "✓" : "✗"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    }

    // Profile
    if (content.profile) {
      const p = content.profile;
      parts.push(
        <div key="profile" className="agent-task-detail">
          <div>
            <strong>Username:</strong> {p.username}
          </div>
          <div>
            <strong>Email:</strong> {p.email}
          </div>
          <div>
            <strong>Roles:</strong> {p.roles.join(", ")}
          </div>
          <div>
            <strong>Active:</strong> {p.isActive ? "Yes" : "No"}
          </div>
          <div>
            <strong>Member since:</strong>{" "}
            {new Date(p.memberSince).toLocaleDateString()}
          </div>
        </div>,
      );
    }

    // Updates applied
    if (content.updates) {
      parts.push(
        <div key="updates" className="agent-task-detail">
          <strong>Fields updated:</strong>{" "}
          {Object.entries(content.updates)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")}
        </div>,
      );
    }

    return parts.length > 0 ? parts : <p>{JSON.stringify(content)}</p>;
  };

  if (minimized) {
    return (
      <button
        className="agent-fab"
        onClick={() => setMinimized(false)}
        title="KAI - KRMN Assistant"
        aria-label="Open KAI Assistant"
      >
        <span className="agent-fab-icon">K</span>
      </button>
    );
  }

  return (
    <div className="agent-panel">
      <div className="agent-header">
        <div className="agent-header-title">
          <span className="agent-header-icon">K</span>
          <span>KAI</span>
        </div>
        <div className="agent-header-actions">
          <button
            className="agent-header-btn"
            onClick={() => dispatch(clearChat())}
            title="Clear chat"
          >
            &#128465;
          </button>
          <button
            className="agent-header-btn"
            onClick={() => setMinimized(true)}
            title="Minimize"
          >
            &#8722;
          </button>
        </div>
      </div>

      <div className="agent-messages">
        {messages.length === 0 && (
          <div className="agent-welcome">
            <p className="agent-welcome-text">
              Hi! I'm KAI, your KRMN assistant. Ask me about tasks, clients, or
              type <strong>help</strong> to see what I can do.
            </p>
            <div className="agent-quick-actions">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  className="agent-quick-btn"
                  onClick={() => handleQuickAction(qa.message)}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={`${msg.role}-${idx}`}
            className={`agent-msg agent-msg-${msg.role}`}
          >
            {msg.role === "user" ? (
              <div className="agent-msg-bubble agent-msg-user-bubble">
                {msg.content}
              </div>
            ) : (
              <div className="agent-msg-bubble agent-msg-agent-bubble">
                {renderAgentContent(msg.content)}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="agent-msg agent-msg-agent">
            <div className="agent-msg-bubble agent-msg-agent-bubble">
              <div className="agent-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="agent-input-area">
        <input
          ref={inputRef}
          type="text"
          className="agent-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask KAI anything..."
          disabled={loading}
          maxLength={500}
        />
        <button
          className="agent-send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          title="Send"
        >
          &#10148;
        </button>
      </div>
    </div>
  );
};

export default AgentChat;
