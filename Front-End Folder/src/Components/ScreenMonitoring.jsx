import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import EmpContext from './context/EmpContext';

const ScreenMonitoring = () => {
  const { employee, category } = useContext(EmpContext);
  const navigate = useNavigate();

  const handleEmployeeLogs = (empId) => {
    navigate(`screenshot_logs/${empId}`);
  };

  return (
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
              <th className="ps-4">Action</th>
            </tr>
          </thead>
          <tbody style={{ color: "white" }}>
            {employee.length > 0 ? (
              employee.map((e, index) => (
                <tr key={index}>
                  <td className="ps-4">{e.name}</td>
                  <td className="ps-4">{e.email}</td>
                  <td className="ps-4">
                    {category.find((cat) => cat.id === e.category_id)?.name || "Unknown"}
                  </td>
                  <td className="ps-4">${e.salary}</td>
                  <td className="ps-4">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleEmployeeLogs(e.id)}
                    >
                      SS Logs
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScreenMonitoring;
