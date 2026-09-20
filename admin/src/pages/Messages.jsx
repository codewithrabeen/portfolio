import React, { useEffect, useState } from "react";
import api from "../services/api";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/messages");

      setMessages(response.data.messages || []);
    } catch (error) {
      console.error(
        "Fetch messages error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load messages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenMessage = async (message) => {
    setSelectedMessage(message);

    if (!message.read) {
      try {
        const response = await api.patch(
          `/messages/${message._id}/read`
        );

        const updatedMessage = response.data.data;

        setMessages((current) =>
          current.map((item) =>
            item._id === updatedMessage._id
              ? updatedMessage
              : item
          )
        );

        setSelectedMessage(updatedMessage);
      } catch (error) {
        console.error(
          "Mark message read error:",
          error.response?.data || error
        );
      }
    }
  };

  const handleToggleRead = async (message) => {
    try {
      setActionLoading(true);

      const response = await api.patch(
        `/messages/${message._id}/read`
      );

      const updatedMessage = response.data.data;

      setMessages((current) =>
        current.map((item) =>
          item._id === updatedMessage._id
            ? updatedMessage
            : item
        )
      );

      if (
        selectedMessage?._id === updatedMessage._id
      ) {
        setSelectedMessage(updatedMessage);
      }
    } catch (error) {
      console.error(
        "Toggle message error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update message."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (message) => {
    const confirmed = window.confirm(
      `Delete the message from ${message.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await api.delete(
        `/messages/${message._id}`
      );

      setMessages((current) =>
        current.filter(
          (item) => item._id !== message._id
        )
      );

      if (
        selectedMessage?._id === message._id
      ) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error(
        "Delete message error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete message."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  const unreadCount = messages.filter(
    (message) => !message.read
  ).length;

  if (loading) {
    return (
      <div className="messages-page">

        <div className="page-header">
          <div>
            <p className="page-eyebrow">
              Inbox
            </p>

            <h1>Messages</h1>
          </div>
        </div>

        <div className="messages-loading">
          <div className="messages-spinner" />
          <p>Loading messages...</p>
        </div>

      </div>
    );
  }

  return (
    <div className="messages-page">

      {/* HEADER */}

      <div className="messages-page-header">

        <div>
          <p className="page-eyebrow">
            Portfolio Inbox
          </p>

          <h1>Messages</h1>

          <p className="page-description">
            Manage messages received from your
            portfolio contact form.
          </p>
        </div>


        <button
          className="messages-refresh-button"
          onClick={fetchMessages}
          disabled={loading}
        >
          ↻ Refresh
        </button>

      </div>


      {/* STATS */}

      <div className="messages-stats">

        <div className="message-stat-card">

          <div className="message-stat-icon">
            ✉
          </div>

          <div>
            <span>Total Messages</span>
            <strong>
              {messages.length}
            </strong>
          </div>

        </div>


        <div className="message-stat-card">

          <div className="message-stat-icon unread">
            ●
          </div>

          <div>
            <span>Unread</span>
            <strong>
              {unreadCount}
            </strong>
          </div>

        </div>


        <div className="message-stat-card">

          <div className="message-stat-icon">
            ✓
          </div>

          <div>
            <span>Read</span>
            <strong>
              {messages.length - unreadCount}
            </strong>
          </div>

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="messages-error">
          {error}
        </div>
      )}


      {/* CONTENT */}

      <div className="messages-layout">

        {/* MESSAGE LIST */}

        <div className="messages-list-card">

          <div className="messages-list-header">

            <div>
              <h2>Inbox</h2>

              <span>
                {messages.length}{" "}
                {messages.length === 1
                  ? "message"
                  : "messages"}
              </span>
            </div>

          </div>


          {messages.length === 0 ? (
            <div className="messages-empty">

              <div className="messages-empty-icon">
                ✉
              </div>

              <h3>
                No messages yet
              </h3>

              <p>
                Messages submitted through your
                portfolio contact form will appear
                here.
              </p>

            </div>
          ) : (
            <div className="messages-list">

              {messages.map((message) => (
                <button
                  className={`message-list-item ${
                    selectedMessage?._id ===
                    message._id
                      ? "active"
                      : ""
                  } ${
                    !message.read
                      ? "unread"
                      : ""
                  }`}
                  key={message._id}
                  onClick={() =>
                    handleOpenMessage(message)
                  }
                >

                  <div className="message-avatar">
                    {message.name
                      ?.charAt(0)
                      ?.toUpperCase() || "?"}
                  </div>


                  <div className="message-preview">

                    <div className="message-preview-top">

                      <strong>
                        {message.name}
                      </strong>

                      <time>
                        {formatDate(
                          message.createdAt
                        )}
                      </time>

                    </div>


                    <div className="message-preview-email">
                      {message.email}
                    </div>


                    <div className="message-preview-subject">

                      {message.subject ||
                        "No subject"}

                    </div>


                    <p>
                      {message.message}
                    </p>

                  </div>


                  {!message.read && (
                    <span className="unread-dot" />
                  )}

                </button>
              ))}

            </div>
          )}

        </div>


        {/* MESSAGE DETAILS */}

        <div className="message-details-card">

          {selectedMessage ? (
            <>

              <div className="message-details-header">

                <div>

                  <div className="message-details-person">

                    <div className="message-large-avatar">
                      {selectedMessage.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div>

                      <h2>
                        {selectedMessage.name}
                      </h2>

                      <a
                        href={`mailto:${selectedMessage.email}`}
                      >
                        {selectedMessage.email}
                      </a>

                    </div>

                  </div>

                </div>


                <button
                  className="message-close-button"
                  onClick={() =>
                    setSelectedMessage(null)
                  }
                >
                  ×
                </button>

              </div>


              <div className="message-details-meta">

                <span
                  className={
                    selectedMessage.read
                      ? "read-badge"
                      : "unread-badge"
                  }
                >
                  {selectedMessage.read
                    ? "Read"
                    : "Unread"}
                </span>

                <span>
                  {formatDate(
                    selectedMessage.createdAt
                  )}
                </span>

              </div>


              <div className="message-subject">

                <span>
                  Subject
                </span>

                <h3>
                  {selectedMessage.subject ||
                    "No subject"}
                </h3>

              </div>


              <div className="message-body">

                <span>
                  Message
                </span>

                <p>
                  {selectedMessage.message}
                </p>

              </div>


              <div className="message-actions">

                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${
                    selectedMessage.subject ||
                    "Your message"
                  }`}
                  className="message-reply-button"
                >
                  Reply ↗
                </a>


                <button
                  className="message-read-button"
                  onClick={() =>
                    handleToggleRead(
                      selectedMessage
                    )
                  }
                  disabled={actionLoading}
                >
                  {selectedMessage.read
                    ? "Mark Unread"
                    : "Mark Read"}
                </button>


                <button
                  className="message-delete-button"
                  onClick={() =>
                    handleDelete(
                      selectedMessage
                    )
                  }
                  disabled={actionLoading}
                >
                  Delete
                </button>

              </div>

            </>
          ) : (
            <div className="message-no-selection">

              <div className="message-no-selection-icon">
                ✦
              </div>

              <h2>
                Select a message
              </h2>

              <p>
                Choose a message from your inbox
                to read the full conversation.
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Messages;