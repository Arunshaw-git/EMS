import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const EmpAssign = ( ) => {
  const [tasks, setTasks] = useState([]);
  const location = useLocation();
  const { assignee } = location.state || {};


  useEffect(() => {
    if (assignee) {
      fetch(`http://localhost:3000/employee/tasks/${assignee.id}`, {
        method: "GET",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.Status) {
            setTasks(data.Result);
          } else {
            console.error("Failed to fetch tasks");
          }
        })
        .catch((err) => console.error(err));
    }
  }, [assignee]);

  console.log("Tasks:", tasks);
  console.log("Employee:", assignee);
  return (
    <div>
      <h2>Assign Tasks to {assignee.name}</h2>
      <ul>
        {tasks.map((t, i) => (
          <li key={i}>{t.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default EmpAssign;
