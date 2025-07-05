import React, { useContext, useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import EmpContext from './context/EmpContext';

const SocialMediaLogs = () => {
  const {employee} = useContext(EmpContext)
  const { id } = useParams(); // employee ID from route
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`http://localhost:3000/auth/social_media_logs/${id}`);
        const data = await res.json();
        if (data.Status) {
          setLogs(data.data);
          setLoading(false);
        } else {
          console.error("Error fetching social media logs:", data.message || data.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchLogs();
  }, [id]);

  return (
    <div className="container mt-5">
      <h4 className="mb-4">🌐 Social Media Logs for Employee ID: {employee.find(e => e.id === parseInt(id))?.name || "Unknown"}</h4>
      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No social media logs found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Domain</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>      </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const start = new Date(log.start_time);
                const end = new Date(log.end_time);

                return (
                  <tr key={log.id || index}>
                    <td>{index + 1}</td>
                    <td>{log.domain}</td>
                    <td>{start.toLocaleString()}</td>
                    <td>{end.toLocaleString()}</td>
                    <td>
                      <button className="btn btn-sm btn-info" 
                      onClick={() => navigate(`socialMediaSS`,{state:{start_time: log.start_time}})}
                      >Screenshots</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SocialMediaLogs;
