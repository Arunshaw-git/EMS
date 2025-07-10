import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/admin/employee", { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          setEmployee(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);
  const handleDelete = (id) => {
    axios
      .delete("http://localhost:3000/admin/delete_employee/" + id, { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          window.location.reload();
        } else {
          console.log(JSON.stringify(result.data.Error));
        }
      });
  };
  
  return (
    <div className="px-5 d-flex flex-column  mt-3 justify-content-center align-items-center">
      <h3 style={{fontFamily: "san-serif", fontSize: "36px"}}>Employee List</h3>

      <Link to="/dashboard/add_employee" className="btn btn-success">
        Add Employee
      </Link>
      <div className="mt-3">
        <table className="table table-striped table-hover align-middle shadow-sm rounded overflow-hidden">
          <thead>
            <tr>
              <th className="ps-4">Name</th>
              <th className="ps-4">Email</th>
              <th className="ps-4">Address</th>
              <th className="ps-4">Salary</th>
              <th className="ps-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {employee.map((e) => (
              <tr>
                <td className="ps-4">{e.name}</td>

                <td className="ps-4">{e.email}</td>
                <td className="ps-4">{e.address}</td>
                <td className="ps-4">{e.salary}</td>
                <td className="ps-4">
                  <Link
                    to={`/dashboard/edit_employee/` + e.id}
                    className="btn pe-4  btn-info btn-sm me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn  btn-warning btn-sm"
                    onClick={() => handleDelete(e.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employee;
