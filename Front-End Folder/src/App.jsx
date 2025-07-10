import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Home from "./Components/Home";
import Employee from "./Components/Employee";
import Category from "./Components/Category";
import Profile from "./Components/Profile";
import AddCategory from "./Components/AddCategory";
import AddEmployee from "./Components/AddEmployee";
import EditEmployee from "./Components/EditEmployee";
import Start from "./Components/Start";
import EmployeeLogin from "./Components/EmployeeLogin";

import EmployeeDashboard from "./Components/EmployeeDashboard";
import EmpHome from "./Components/emp/EmpHome";
import EmpTodo from "./Components/emp/EmpTodo";
import EmpAssignTasks from "./Components/emp/EmpAssignTasks";
import EmpAssign from "./Components/emp/EmpAssign";

import PrivateRoute from "./Components/PrivateRoute";
import ScreenMonitoring from "./Components/ScreenMonitoring";
import ScreenshotLogs from "./Components/ScreenshotLogs";

import USBAndPrintScreenPage from "./Components/USBAndPrintScreenPage";
import USBLogs from "./Components/USBLogs";
import PrintScreenLogs from "./Components/PrintScreenLogs";

import EmpProvider from "./Components/context/EmpProvider";
import EmpPrivateRoute from "./Components/emp/EmpPrivateRoute";
import Notifications from "./Components/Notifications";
import SocialMedia from "./Components/SocialMedia";
import SocialMediaLogs from "./Components/SocialMediaLogs";
import SocialMediaSS from "./Components/SocialMediaSS";

function App() {
  return (
    <BrowserRouter>
      <EmpProvider>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/adminlogin" element={<Login />} />
          <Route path="/employee_login" element={<EmployeeLogin />} />

          <Route
            path="/employee_detail/:id"
            element={
              <EmpPrivateRoute>
                <EmployeeDashboard />
              </EmpPrivateRoute>
            }
          >
            <Route index element={<EmpHome />} />
            <Route path="todolist" element={<EmpTodo />} />
            <Route path="profile" element={<Profile />} />
            <Route path="assigntasks" element={<EmpAssignTasks />} />
            <Route path="assign" element={<EmpAssign />} />
          </Route>

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="employee" element={<Employee />} />
            <Route path="category" element={<Category />} />
            <Route path="profile" element={<Profile />} />
            <Route path="add_category" element={<AddCategory />} />
            <Route path="add_employee" element={<AddEmployee />} />
            <Route path="edit_employee/:id" element={<EditEmployee />} />
            <Route path="screenMonitoring" element={<ScreenMonitoring />} />
            <Route path="notifications" element={<Notifications />} />
            <Route
              path="screenMonitoring/screenshot_logs/:id"
              element={<ScreenshotLogs />}
            />
            <Route
              path="usbAndPrintScreen"
              element={<USBAndPrintScreenPage />}
            />
            <Route
              path="usbAndPrintScreen/usb_logs/:id"
              element={<USBLogs />}
            />
            <Route
              path="usbAndPrintScreen/printScreen_logs/:id"
              element={<PrintScreenLogs />}
            />
            <Route
              path="socialMedia"
              element={<SocialMedia/>}
            />
            <Route
              path="socialMedia/socialMedia_logs/:id"
              element={<SocialMediaLogs/>}
            />
            <Route
              path="socialMedia/socialMedia_logs/:id/socialMediaSS"
              element={<SocialMediaSS/>}
            />
          </Route>
        </Routes>
      </EmpProvider>
    </BrowserRouter>
  );
}

export default App;
