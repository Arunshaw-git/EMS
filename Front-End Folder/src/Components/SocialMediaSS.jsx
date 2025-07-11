import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import EmpContext from './context/EmpContext';

const SocialMediaSS = () => {
  const {id}= useParams()
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { employee } = useContext(EmpContext);
  const { state } = useLocation();
  const startTime = state?.start_time;


  useEffect(() => {
    
    const fetchSSLogs = async () => {
      try {
        const res = await fetch(`http://localhost:3000/auth/${id}/socialMediaSS`, {
          method: "POST",
          credentials:"include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ start_time: startTime })
        });
        const data = await res.json();
        if (data.Status) {
          setLogs(data.data);
          console.log(logs)
        } else {
          console.error("Error fetching logs:", data.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSSLogs();
  }, []);

  return (
    <div className="container mt-5">
      <h4 className="mb-4">🖼️ Screenshots from Session starting at {startTime}</h4>
      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No screenshots found.</p>
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
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{log.filename}</td>
                  <td><a href={log.url} target="_blank" rel="noreferrer">View</a></td>
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

export default SocialMediaSS;
