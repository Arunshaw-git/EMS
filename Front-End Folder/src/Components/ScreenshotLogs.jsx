import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ScreenshotLogs = () => {
  const { id } = useParams(); // employee ID from route
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchLogs = async () => {
    try {
      const res = await fetch(`http://localhost:3000/admin/screenshot_logs/${id}`,{
      method: "GET",
      credentials: "include",
    });
      const data = await res.json();
      if (data.Status) {
        setLogs(data.data);
        setLoading(false)
      } else {
        console.error("Error fetching logs:", data.message || data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  fetchLogs();
}, [id]);

  return (
    <div className="container mt-5">
      <h4 className="mb-4">📸 Screenshot Logs for Employee ID: {id}</h4>
      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No screenshot logs found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Filename</th>
                <th>URL</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id || index}>
                  <td>{index + 1}</td>
                  <td>{log.filename}</td>
                  <td>
                    <a href={log.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </td>
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

export default ScreenshotLogs;
