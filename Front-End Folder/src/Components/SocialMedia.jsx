import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import EmpContext from './context/EmpContext';

const SocialMedia = () => {
  const { employee, category } = useContext(EmpContext);
  const navigate = useNavigate();

  return (
    <div className="mt-5 px-4">
      <h4 className="mb-4">Social Media Access Logs</h4>
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle shadow-sm rounded overflow-hidden">
          <thead className="table-white">
            <tr>
              <th className="ps-4">Name</th>
              <th className="ps-4">Email</th>
              <th className="ps-4">Category</th>
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
                    {category.find(cat => cat.id === parseInt(e.category_id))?.name || "Unknown"}
                  </td>
                  <td className="ps-4">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => navigate(`socialMedia_logs/${e.id}`)}
                    >
                      Show Logs
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
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

export default SocialMedia;
