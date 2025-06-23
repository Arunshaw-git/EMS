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

  useEffect(() => {
    adminCount();
    employeeCount();
    salaryCount();
    AdminRecords();
    employeeRecord();
    getCategory();
  }, []);

  const AdminRecords = () => {
    axios.get("http://localhost:3000/auth/admin_records").then((result) => {
      if (result.data.Status) {
        setAdmins(result.data.Result);
      } else {
        alert(result.data.Error);
      }
    });
  };

  const adminCount = () => {
    axios.get("http://localhost:3000/auth/admin_count").then((result) => {
      if (result.data.Status) {
        setAdminTotal(result.data.Result[0].admin);
      }
    });
  };

  const employeeCount = () => {
    axios.get("http://localhost:3000/auth/employee_count").then((result) => {
      if (result.data.Status) {
        setemployeeTotal(result.data.Result[0].employee);
      }
    });
  };
  
  const employeeRecord = () => {
    axios
      .get("http://localhost:3000/auth/employee")
      .then((result) => {
        if (result.data.Status) {
          setEmployee(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };
  const salaryCount = () => {
    axios.get("http://localhost:3000/auth/salary_count").then((result) => {
      if (result.data.Status) {
        setSalaryTotal(result.data.Result[0].salaryOFEmp);
      } else {
        alert(result.data.Error);
      }
    });
  };
  const getCategory = () => {
    axios
      .get("http://localhost:3000/auth/category")
      .then((result) => {
        if (result.data.Status) {
          setCategory(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log("Error during fetching category: ", err));
  };

  const values = {
    adminTotal, employeeTotal, salaryTotal,
    admins, setAdmins, employee, setEmployee,
    category, setCategory,
  };

  return <EmpContext.Provider value={values}>{children}</EmpContext.Provider>;
};

export default EmpProvider;
