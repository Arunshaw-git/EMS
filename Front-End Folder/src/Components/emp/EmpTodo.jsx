import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const EmpTodo = () => {
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const { id } = useParams();

   useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:3000/employee/tasks/${id}`, {
          method: "GET",
          credentials:"include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.Status) {
          setTasks(data.Result);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();
  }, [id]);
  
  const handleAddTask = async () => {
     if (taskInput.trim() !== "") {
      const newTask = { text: taskInput, completed: 0 };
      try {
        const res = await fetch(`http://localhost:3000/employee/add_task`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_id: id,
            text: newTask.text,
            completed: newTask.completed,
          }),
        });

        const data = await res.json();
        if (data.Status) {
          setTasks((prev) => [...prev, newTask]);
          setTaskInput("");
        } else {
          alert("Error saving task");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  const handleToggle = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = updatedTasks[index].completed ? 0 : 1;
    setTasks(updatedTasks);
  };

  return (
    <div>
      <h2>Employee To-Do List</h2>
      <input
        type="text"
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        placeholder="Enter a task"
      />
      <button type="button" className=" btn btn-success " onClick={handleAddTask}>Add</button>

      <ul>
        {tasks.map((task, idx) => (
          <li key={idx}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(idx)}
            />
            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.text}
            </span>{" "}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmpTodo;
