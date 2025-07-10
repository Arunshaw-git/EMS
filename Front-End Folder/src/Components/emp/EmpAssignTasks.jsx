import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EmpAssignTasks = () => {
  const [employees, setEmployees] = useState([]);
  const [category, setCategory] = useState([]);
  const navigate = useNavigate(); 
  const { id: hrId } = useParams();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:3000/admin/employee", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.Status) {
          setEmployees(data.Result);
        } else {
          alert(data.Error);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchEmployees();

    const getCategory = async () => {
      const res = await fetch("http://localhost:3000/admin/category", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.Status) {
        setCategory(data.Result);
      } else {
        console.log(data.Error);
      }
    };
    getCategory();
  }, []);

  const handleAssignee = (emp) => {
    navigate(`/employee_detail/${hrId}/assign`, {
      state: { assignee: emp },
    });
  };

  return (
    <div className="d-flex align-content-center row">
      <h3 className="">Assign tasks to Subordinents</h3>
      <table className="table">
        <thead>
          <tr className="">
            <th scope="col">Name</th>
            <th scope="col">Department</th>
            <th scope="col">Designation</th>
            <th scope="col">Action</th> {/* Add this line */}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => (
            <tr key={idx}>
              <td>{emp.name}</td>
              <td>
                {category.find((cat) => cat.id === emp.category_id)?.name ||
                  "Unknown"}
              </td>
              <td>{emp.designation}</td>
              <td>
                {emp.category_id !== 1 && (
                  <button onClick={() => handleAssignee(emp)}>Assign</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmpAssignTasks;
