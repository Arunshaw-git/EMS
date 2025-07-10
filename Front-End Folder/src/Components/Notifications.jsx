import React, { useEffect, useState } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    markAllAsSeen();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/notifications", {
        withCredentials: true,
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAllAsSeen = async () => {
    try {
      await axios.patch("http://localhost:3000/admin/notifications/mark-seen", {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Error marking notifications as seen:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">🔔 Notification History</h3>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="list-group">
          {notifications.map((note) => (
            <li
              key={note.id}
              className={`list-group-item d-flex justify-content-between align-items-center ${
                note.seen ? "text-muted" : "fw-bold"
              }`}
            >
              <span>
                <strong>{note.employee_name}</strong> - {note.event}
              </span>
              <span>{new Date(note.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
