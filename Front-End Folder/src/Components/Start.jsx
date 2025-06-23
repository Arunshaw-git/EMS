import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Start = () => {
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios
      .get("http://localhost:3000/verify")
      .then((result) => {
        if (result.data.Status) {
          if (result.data.role === "admin") {
            navigate("/dashboard");
          } else {
            navigate("/employee_detail/" + result.data.id);
          }
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <div className="background-lines">
        {/* Horizontal lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div className="line" key={`h-${i}`} style={{ top: `${i * 10}%` }} />
        ))}

        {/* Animated Vertical Lines: duplicated for infinite loop */}
        <div className="vLineScroller">
          {/* First set */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              className="vLine"
              key={`v1-${i}`}
              style={{ left: `${i * 5}%` }}
            />
          ))}
          {/* Duplicate set */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              className="vLine"
              key={`v2-${i}`}
              style={{ left: `${i * 5}%` }}
            />
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
        <div className="p-5  loginForm">
          <h2 className="text-center mb-4">Login As</h2>
          <div className="d-flex justify-content-between mt-5 mb-2">
            <button
              type="button"
              className="btn btn-primary w-100 mb-3 me-3 rounded-3 animate-fly-in-left "
              onClick={() => {
                navigate("/employee_login");
              }}
            >
              Employee
            </button>
            <button
              type="button"
              className="btn btn-success w-100 mb-3 rounded-3 animate-fly-in-right "
              onClick={() => {
                navigate("/adminlogin");
              }}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Start;
