import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PrintScreenLogs = () => {
  const { id } = useParams(); // Employee ID from the route
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`http://localhost:3000/auth/printScreen_logs/${id}`);
        const data = await res.json();
        if (data.Status) {
          setLogs(data.data);
        } else {
          console.error("Failed to fetch logs:", data.error);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [id]);

  if (loading) return <p>Loading logs...</p>;

  return (
    <div>
      <h2>Print Screen Logs for Employee #{id}</h2>
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Screenshot Link</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>
                  <a href={log.url} target="_blank" rel="noopener noreferrer">
                    View Screenshot
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PrintScreenLogs;
