import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import  EmpContext  from "./context/EmpContext";

const UsbAndPrintScreenMonitoring = () => {
  const { employee, category } = useContext(EmpContext);
  const navigate = useNavigate();
  const [selectedLogType, setSelectedLogType] = useState("usb"); // 'usb' or 'printscreen'

  const handleViewLogs = (empId) => {
    if (selectedLogType === "usb") {
      navigate(`usb_logs/${empId}`);
    } else {
      navigate(`printScreen_logs/${empId}`);
    }
  };

  return (
    <div className="mt-5 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>USB & Print Screen Monitoring</h4>
        <div>
          <button
            className={`btn btn-sm me-2 ${selectedLogType === "usb" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setSelectedLogType("usb")}
          >
            USB Logs
          </button>
          <button
            className={`btn btn-sm ${selectedLogType === "printscreen" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setSelectedLogType("printscreen")}
          >
            PrintScreen Logs
          </button>
        </div>
      </div>

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
                      onClick={() => handleViewLogs(e.id)}
                    >
                      View {selectedLogType === "usb" ? "USB" : "PrintScreen"} Logs
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

export default UsbAndPrintScreenMonitoring;
