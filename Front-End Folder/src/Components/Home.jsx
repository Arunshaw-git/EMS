import axios from "axios";
import React, { useContext } from "react";
import EmpContext from "./context/EmpContext";

const Home = () => {
  const { adminTotal, employeeTotal, salaryTotal, employee, category } =
    useContext(EmpContext);

  return (
    <div>
      <div className="row g-4 mt-3 px-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary text-center mb-3">
                Admins
              </h5>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-6 fw-semibold">Total</span>
                <span className="fs-5 fw-bold">{adminTotal}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-success text-center mb-3">
                Employees
              </h5>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-6 fw-semibold">Total</span>
                <span className="fs-5 fw-bold">{employeeTotal}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-warning text-center mb-3">
                Salaries
              </h5>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-6 fw-semibold">Total</span>
                <span className="fs-5 fw-bold">${salaryTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="mt-5 px-4">
        <h4 className="mb-4">List of Employees</h4>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle shadow-sm rounded overflow-hidden">
            <thead className="table-white">
              <tr>
                <th className="ps-4">Name</th>
                <th className="ps-4">Email</th>
                <th className="ps-4">Dept.</th>
                <th className="ps-4">Salary</th>
              </tr>
            </thead>
            <tbody style={{ color: "white" }}>
              {employee.length > 0 ? (
                employee.map((e, index) => (
                  <tr key={index}>
                    <td className="ps-4">{e.name}</td>
                    <td className="ps-4">{e.email}</td>
                    <td className="ps-4">
                      {category.find((cat) => cat.id === e.category_id)?.name ||
                        "Unknown"}
                    </td>
                    <td className="ps-4">${e.salary}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-muted py-4">
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
