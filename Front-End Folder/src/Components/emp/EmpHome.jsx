import React, { useEffect, useState } from "react";

const EmpHome = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleToggle = async () => {
    if (!isWorking) {
      try {
        const startSemsResponse = await fetch(
          "http://localhost:3000/employee/start-sems",
          {
            method: "POST",
          }
        );
        const startSemsData = await startSemsResponse.json();
        console.log(startSemsData);

        const startUsb = await fetch(
          "http://localhost:3000/employee/start-usb",
          {
            method: "POST",
          }
        );
        const startUsbData = await startUsb.json();
        console.log(startUsbData);

        setStartTime(Date.now());

        const startPrintScreenResponse = await fetch(
          "http://localhost:3000/employee/start-printScreenDetection",
          {
            method: "POST",
          }
        );
        const startPrintScreenData = await startPrintScreenResponse.json();
        console.log(startPrintScreenData);
        const startIpDetectionResponse = await fetch(
          "http://localhost:3000/employee/start-ipDetection",
          {
            method: "POST",
          }
        );
        const startIpDetectionnData = await startIpDetectionResponse.json();
        console.log(startIpDetectionnData);
      } catch (err) {
        console.error("❌ Error in starting scripts:", err);
      }
    } else {

      await fetch("http://localhost:3000/employee/stop-sems", {
        method: "POST",
      });
      await fetch("http://localhost:3000/employee/stop-usb", {
        method: "POST",
      });
      await fetch("http://localhost:3000/employee/stop-ipDetection", {
        method: "POST",
      });
      await fetch("http://localhost:3000/employee/stop-printScreenDetection", {
        method: "POST",
      });
      console.log("✅ All scripts stopped");

      setStartTime(null);
      setElapsed(0);
    }
    setIsWorking(!isWorking);
  };

  useEffect(() => {
    let timer;
    if (isWorking && startTime) {
      timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWorking, startTime]);

  const cardStyle = {
    minHeight: "100px",
    backgroundColor: isWorking
      ? "rgb(12, 169, 4)"
      : "rgba(241, 241, 241, 0.61)",
    cursor: "pointer",
    transition: "0.3s ease",
  };
  return (
    <div className="container mt-4 ">
      <div className="row g-4 align-items-stretch">
        <div className="col-md-4 col-lg-3">
          <div
            className="card p-2  h-100 card-hover "
            style={{ minHeight: "100px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-box-arrow-in-right fs-4 text-primary"></i>
              <h5 className="card-title mb-0">Login Time</h5>
            </div>{" "}
            <p className="card-text">09:00 AM</p>
          </div>
        </div>

        <div className="col-md-4 col-lg-3">
          <div
            className="card p-2  h-100 card-hover"
            style={{ minHeight: "100px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-box-arrow-left
                  fs-4 text-primary"
              ></i>
              <h5 className="card-title mb-0">Logout Time</h5>
            </div>{" "}
            <p className="card-text">06:00 PM</p>
          </div>
        </div>

        <div className="col-md-4 col-lg-3">
          <div
            className="card p-2 h-100 card-hover"
            style={cardStyle}
            onClick={handleToggle}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i
                className={`bi ${
                  isWorking ? "bi-box-arrow-left" : "bi-box-arrow-in-right"
                } fs-4 text-primary`}
              ></i>
              <h5 className="card-title mb-0">
                {isWorking ? "Check-Out" : "Check-In"}
              </h5>
            </div>
            <p className="card-text">
              {isWorking ? (
                <>
                  ⏱ <strong>{formatTime(elapsed)}</strong>
                </>
              ) : (
                "Tap to start working"
              )}
            </p>
          </div>
        </div>

        <div className="col-md-4 col-lg-6">
          <div
            className="card  p-2  h-100 card-hover"
            style={{ minHeight: "100px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-clock-history
                 fs-4 text-primary"
              ></i>
              <h5 className="card-title mb-0">Total working hours</h5>
            </div>{" "}
            <p className="card-text">1420 hrs</p>
          </div>
        </div>

        <div className="col-md-4 col-lg-6">
          <div
            className="card  p-2  h-100 card-hover"
            style={{ minHeight: "100px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-calendar-check
                 fs-4 text-primary"
              ></i>
              <h5 className="card-title mb-0">Casual Leave taken</h5>
            </div>
            <p className="card-text">3 / 12</p>
          </div>
        </div>

        <div className="col-md-4 col-lg-3">
          <div
            className="card p-2  h-100 card-hover"
            style={{ minHeight: "100px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-briefcase
                   fs-4 text-primary"
              ></i>
              <h5 className="card-title mb-0">Total working days</h5>
            </div>{" "}
            <p className="card-text">178</p>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div
            className="card p-2  h-100 card-hover"
            style={{ minHeight: "100px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-list-task
                 fs-4 text-primary"
              ></i>
              <h5 className="card-title mb-0">Pending Tasks</h5>
            </div>{" "}
            <p className="card-text">5</p>
          </div>
        </div>
        <div className="col-md-4 col-lg-3">
          <div
            className="card p-2  h-100 card-hover"
            style={{ minHeight: "100px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-calendar-event
               fs-4 text-primary"
              ></i>
              <h5 className="card-title mb-0">Upcoming holidays</h5>
            </div>{" "}
            <p className="card-text">2</p>
          </div>
        </div>

        <div className="col-md-4 col-lg-3 ">
          <div
            className="card p-2  h-100 card-hover "
            style={{ minHeight: "100px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <i
                className="bi bi-graph-up
               fs-4 text-primary"
              ></i>
              <h5 className="card-title mb-0">Attendance percentage</h5>
            </div>
            <p className="card-text">96%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpHome;
