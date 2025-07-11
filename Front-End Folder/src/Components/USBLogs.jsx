import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

const USBLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const { id } = useParams(); // Employee ID from the route
  useEffect(() => {
    fetch(`http://localhost:3000/admin/usb_logs/${id}`,{credentials:"include",})  // Ensure this is the correct route from your backend
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch logs");
        return res.json();
      })
      .then((data) => {
        setLogs(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mt-5 px-4">
      <h4 className="mb-4">USB Insertion/Removal Logs</h4>

      {loading && <p>Loading logs...</p>}
      {error && <p className="text-danger">Error: {error}</p>}

      {!loading && logs.length === 0 && <p>No logs available.</p>}

      {!loading && logs.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle shadow-sm rounded overflow-hidden">
            <thead className="table-white">
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Event</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.employee_id}</td>
                  <td>{log.event}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default USBLogs;
