import React from "react";
import { useEffect,useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {

  const [verified, setverified] = useState(null);
  useEffect(() => {
    fetch("http://localhost:3000/verify", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.Status) {
          setverified(true);
        }
      });
  }, []);
    if (verified === null) return null; 
  return verified ? children : <Navigate to="/" />;
};

export default PrivateRoute;
