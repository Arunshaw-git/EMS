// EmpProvider.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import EmpContext from "./EmpContext";

const EmpProvider = ({ children }) => {
  const [adminTotal, setAdminTotal] = useState(0);
  const [employeeTotal, setemployeeTotal] = useState(0);
  const [salaryTotal, setSalaryTotal] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [category, setCategory] = useState([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  useEffect(() => {
    // Check if token exists (i.e., if the user is logged in)
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (token) {
      setIsAuthenticated(true); // Set user as authenticated if token exists
    } else {
      setIsAuthenticated(false); // If no token, set user as not authenticated
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      adminCount();
      employeeCount();
      salaryCount();
      AdminRecords();
      employeeRecord();
      getCategory();
    }
  }, [isAuthenticated]);

  const AdminRecords = () => {
    axios
      .get("http://localhost:3000/admin/admin_records", {
        withCredentials: true,
      })
      .then((result) => {
        if (result.data.Status) {
          setAdmins(result.data.Result);
        } else {
          console.log(result.data.Error);
        }
      });
  };

  const adminCount = () => {
    axios
      .get("http://localhost:3000/admin/admin_count", { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          setAdminTotal(result.data.Result[0].admin);
        }
      });
  };

  const employeeCount = () => {
    axios
      .get("http://localhost:3000/admin/employee_count", {
        withCredentials: true,
      })
      .then((result) => {
        if (result.data.Status) {
          setemployeeTotal(result.data.Result[0].employee);
        }
      });
  };

  const employeeRecord = () => {
    axios
      .get("http://localhost:3000/admin/employee", { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          setEmployee(result.data.Result);
        } else {
          console.log(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };
  const salaryCount = () => {
    axios
      .get("http://localhost:3000/admin/salary_count", {
        withCredentials: true,
      })
      .then((result) => {
        if (result.data.Status) {
          setSalaryTotal(result.data.Result[0].salaryOFEmp);
        } else {
          console.log(result.data.Error);
        }
      });
  };
  const getCategory = () => {
    axios
      .get("http://localhost:3000/admin/category", { withCredentials: true })
      .then((result) => {
        if (result.data.Status) {
          setCategory(result.data.Result);
        } else {
          console.log(result.data.Error);
        }
      })
      .catch((err) => console.log("Error during fetching category: ", err));
  };

  const values = {
    adminTotal,
    employeeTotal,
    salaryTotal,
    admins,
    setAdmins,
    employee,
    setEmployee,
    category,
    setCategory,
  };

  return <EmpContext.Provider value={values}>{children}</EmpContext.Provider>;
};

export default EmpProvider;
