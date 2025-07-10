import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState([]);
  const [category, setCategory] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getCategory();
    axios
      .get("http://localhost:3000/employee/detail/" + id)
      .then((result) => {
        console.log(result);
        setEmployee(result.data[0]);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleLogout = () => {
    axios
      .get("http://localhost:3000/employee/logout", { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          localStorage.removeItem("valid");
          navigate("/");
        }
      })
      .catch((err) => console.log(err));
  };

  const getCategory = () => {
    axios
      .get("http://localhost:3000/admin/category", { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          setCategory(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };
  return (
    // <div>
    //   <div className="p-2 d-flex justify-content-center shadow">
    //     <h4>Employee Management System</h4>
    //   </div>
    //   <div className="d-flex justify-content-center         flex-column align-items-center mt-3">
    //     <img
    //       src={`http://localhost:3000/Images/` + employee.image}
    //       className="emp_det_image"
    //     />
    //     <div className="d-flex align-items-center flex-column mt-5">
    //       <table className="table table-striped table-hover align-middle shadow-sm rounded overflow-hidden">
    //         <thead className="table-white">
    //           <tr>
    //             <th>NAME</th>
    //             <th>Email</th>
    //             <th>Salary</th>
    //             <th>Category</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           <tr>
    //             <td>{employee.name}</td>
    //             <td>{employee.email}</td>
    //             <td>${employee.salary}</td>
    //             <td>
    //               {category.find((cat) => cat.id === employee.category_id)
    //                 ?.name || "Unknown"}
    //             </td>
    //           </tr>
    //         </tbody>
    //       </table>
    //     </div>
    //     <div>
    //       <button className="btn btn-primary me-2">Edit</button>
    //       <button className="btn btn-danger" onClick={handleLogout}>
    //         Logout
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 navbar">
          <div className="d-flex flex-column  align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <Link
              to=""
              className=" pt-1 d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
            >
              <span
                className=" fw-bold "
                style={{
                  fontFamily: "'Poppins', serif",
                  fontSize: "24px",
                  color: "#E0E0E0", 
                  letterSpacing:"1.5px",// gold
                  marginTop: " -22px",
                  textTransform: "uppercase"
                }}
              >
                Employee MS
              </span>
            </Link>
            <ul
              className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
              id="menu"
            >
              <li className="w-100">
                <Link to="." className="nav-link text-white px-0 align-middle">
                  <i className="fs-4 bi-speedometer2 ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Dashboard</span>
                </Link>
              </li>

              <li className="w-100">
                <Link to={`/employee_detail/${id}/todolist`} className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-people ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">To Do List</span>
                </Link>
              </li>
              
              <li className="w-100">
                <Link
                  to={`/employee_detail/${id}/assigntasks`}
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-columns ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Assign Tasks</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/profile"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-person ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Profile</span>
                </Link>
              </li>
              <li className="w-100" onClick={handleLogout}>
                <Link className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-power ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Logout</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="col p-0 m-0">
          <div
            className="px-4 py-3 shadow-sm d-flex justify-content-center align-items-center  header"
            style={{
              fontFamily:
                " Rockwell, 'Courier Bold', Courier, Georgia, Times, 'Times New Roman', serif",
            }}
          >
            <h4>Welcome {employee.name}</h4>
          </div>
          <div
            className="p-4 h-100"
            style={{
              background:
                "url('https://i.ibb.co/Qjt7TJn/milad-fakurian-E8-Ufcyxz514-unsplash-1.jpg')",

              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
