import express from "express";
import con from "../utils/db.js";
import fs from "fs";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();

router.get("/detail/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee where id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false });
    return res.json(result);
  });
});

router.get("/detail/by-name/:name", (req, res) => {
  const name = req.params.name;
  const sql = "SELECT * FROM employee where LOWER(name) = LOWER(?)";

  con.query(sql, [name], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log("Found:", result[0]);
    return res.json(result[0]);
  });
});

router.get("/tasks/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM tasks where employee_id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

router.post("/add_task", (req, res) => {
  const { employee_id, text, completed } = req.body;
  const sql =
    "INSERT INTO tasks (employee_id, text, completed) VALUES (?, ?, ?)";

  con.query(sql, [employee_id, text, completed], (err, result) => {
    if (err) {
      console.error("Error inserting task:", err);
      return res.json({ Status: false, Error: err });
    }
    return res.json({ Status: true, Result: result });
  });
});

//-------------------------------------------------------
//-----------------------------------------------
//Check-in button's SS feature api
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Absolute path to .venv Python interpreter
const pythonExecutable = path.join(
  __dirname,
  "../../.venv/Scripts/pythonw.exe"
);

const scriptPath = path.join(__dirname, "../../SS_uploader/uploader.py");

let pythonProcess = null;

router.post("/start-sems", (req, res) => {
  try {
    if (pythonProcess) {
      return res
        .status(400)
        .json({ Status: false, message: "Script is already running" });
    }
    // Create/update the config file with employee info and token
    const config = {
      id: req.id, // From verifyUser middleware
      token: req.cookies.token, // The JWT token
    };

    // Write the config file
    const configPath = path.join(
      __dirname,
      "..",
      "..",
      "SS_uploader",
      "sems_config.json"
    );
    console.log("Writing config to:", configPath);

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log("Config file written successfully");
    } catch (writeError) {
      console.error("Error writing config file:", writeError);
      return res.status(500).json({
        Status: false,
        error: "Failed to write config file",
      });
    }

    pythonProcess = spawn(pythonExecutable, [scriptPath], {
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
      windowsHide: true,
    });

    pythonProcess.unref(); // Let it run independently

    pythonProcess.stdout.on("data", (data) => {
      console.log(`📤 Python STDOUT: ${data.toString()}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(` Python STDERR: ${data.toString()}`);
    });

    res.status(200).json({
      Status: true,
      message: "Screeshot moniotring script started in background.",
    });
  } catch (err) {
    console.error("Failed to launch script:", err);
    res.status(500).json({ Status: false, error: "Script launch failed." });
  }
});

router.post("/stop-sems", (req, res) => {
  if (!pythonProcess) {
    return res
      .status(400)
      .json({ Status: false, message: "No script is currently running" });
  }

  try {
    process.kill(pythonProcess.pid); // Kill the process
    pythonProcess = null;
    res.status(200).json({ Status: true, message: "Python script stopped." });
    console.log("🔴 SM is stopped");
  } catch (err) {
    console.error("Failed to stop script:", err);
    res.status(500).json({ Status: false, error: "Failed to stop script" });
  }
});

//check-in button's usb and printScreen detection
let printScreenProcess = null;
const printScreenScriptPath = path.join(
  __dirname,
  "../../SS_uploader/printScreen.py"
);

router.post("/start-printScreenDetection", (req, res) => {
  try {
    if (printScreenProcess) {
      console.log("⚠️ PrintScreen detection script is already running.");
      return res
        .status(400)
        .json({ Status: false, message: "Script already running" });
    }

    console.log("🚀 Launching PrintScreen Detection script...");

    printScreenProcess = spawn(pythonExecutable, [printScreenScriptPath], {
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
      windowsHide: true,
    });

    printScreenProcess.unref();

    printScreenProcess.stdout.on("data", (data) => {
      console.log(`🟢 PrintScreen STDOUT: ${data.toString().trim()}`);
    });

    printScreenProcess.stderr.on("data", (data) => {
      console.error(`🔴 PrintScreen STDERR: ${data.toString().trim()}`);
    });

    printScreenProcess.on("exit", (code) => {
      console.log(`🔴 PrintScreen script exited with code: ${code}`);
      printScreenProcess = null;
    });

    res.status(200).json({
      Status: true,
      message: "🚀 PrintScreen detection script started.",
    });
  } catch (err) {
    console.error("❌ Failed to launch PrintScreen script:", err);
    res.status(500).json({ Status: false, error: "Script launch failed" });
  }
});

router.post("/stop-printScreenDetection", (req, res) => {
  if (!printScreenProcess) {
    return res
      .status(400)
      .json({ Status: false, message: "No script is currently running" });
  }

  try {
    process.kill(printScreenProcess.pid); // Kill the process
    printScreenProcess = null;
    res.status(200).json({
      Status: true,
      message: "Print screen detection script stopped.",
    });
  } catch (err) {
    console.error("Failed to stop Print Screen Detection script:", err);
    res.status(500).json({
      Status: false,
      error: "Failed to Print Screen Detection script",
    });
  }
});

const usbScriptPath = path.join(__dirname, "../../SS_uploader/usb_detect.py");

let usbProcess = null;

router.post("/start-usb", (req, res) => {
  try {
    if (usbProcess) {
      return res
        .status(400)
        .json({ Status: false, message: "USB script already running" });
    }

    usbProcess = spawn(pythonExecutable, [usbScriptPath], {
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
      windowsHide: true,
    });

    usbProcess.unref();

    usbProcess.stdout.on("data", (data) => {
      console.log(`📤 USB STDOUT: ${data.toString()}`);
    });

    usbProcess.stderr.on("data", (data) => {
      console.error(`USB STDERR: ${data.toString()}`);
    });

    res.status(200).json({ Status: true, message: "USB script started" });
  } catch (err) {
    console.error("Error starting USB script:", err);
    res.status(500).json({ Status: false, error: "Script launch failed." });
  }
});

router.post("/stop-usb", (req, res) => {
  if (!usbProcess) {
    return res
      .status(400)
      .json({ Status: false, message: "No USB script running" });
  }

  try {
    process.kill(usbProcess.pid);
    usbProcess = null;
    res.status(200).json({ Status: true, message: "USB script stopped" });
    console.log("🔴 USB script stopped");
  } catch (err) {
    console.error("Failed to stop USB script:", err);
    res.status(500).json({ Status: false, error: "Failed to stop USB script" });
  }
});

router.post("/notify-suspicious", async (req, res) => {
  const { employee_id, event } = req.body;
  const timestamp = new Date();

  try {
    // Save to DB
    await con.query(
      "INSERT INTO notifications (employee_id, event, timestamp) VALUES (?, ?, ?)",
      [employee_id, event, timestamp]
    );

    // Emit to admin via socket
    const io = req.app.get("io");
    io.emit("suspicious-activity", {
      employee_id,
      event,
      timestamp,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Failed to log notification:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const ipDetectionScriptPath = path.join(
  __dirname,
  "../../SS_uploader/ipDetection.py"
);
let ipDetectionProcess = null;

router.post("/start-ipDetection", (req, res) => {
  try {
    if (ipDetectionProcess) {
      console.log("Ipdetection already running");
      return res
        .status(400)
        .json({
          Status: false,
          message: "ip detection script already running",
        });
    }
    ipDetectionProcess = spawn(pythonExecutable, [ipDetectionScriptPath], {
      stdio: ["ignore", "pipe", "pipe"],
      creationFlags: 0x08000000,
      windowsHide: true,
    });

    ipDetectionProcess.stdout.on("data", (data) => {
      console.log(`📤 IP STDOUT: ${data.toString()}`);
    });

    ipDetectionProcess.stderr.on("data", (data) => {
      console.error(`IP STDERR: ${data.toString()}`);
    });

    ipDetectionProcess.on("exit", (code) => {
      console.log(`🚪 IP Detection script exited with code ${code}`);
      ipDetectionProcess = null;
    });
    ipDetectionProcess.unref();

    res.json({ Status: true, message: "🟢IP detecion script is runing" });
  } catch (error) {
    console.log("Error in starting the Ip script: ", error);
    res.status(500).json({ Status: false, error: "Ip Script launch failed." });
  }
});

router.post("/stop-ipDetection", (req, res) => {
  if (!ipDetectionProcess) {
    return res
      .status(400)
      .json({ Status: false, message: "No IP Detection script is running" });
  }

  try {
    process.kill(ipDetectionProcess.pid);
    ipDetectionProcess = null;
    res
      .status(200)
      .json({ Status: true, message: "🔴 IP Detection script stopped" });
    console.log("🔴 IP Detection script stopped");
  } catch (err) {
    console.error("Failed to stop IP Detection script:", err);
    res
      .status(500)
      .json({ Status: false, error: "Failed to stop IP Detection script" });
  }
});


router.post("/heartbeat", (req, res) => {
  try {
    const { employee_id, script } = req.body;

    if (!employee_id || !script) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const timestamp = new Date().toISOString();

    // You could log this to DB or just keep in memory or cache (e.g., Redis)
    console.log(`[HEARTBEAT] ${script} from Employee ID ${employee_id} at ${timestamp}`);

    // Optional: Insert into a database if you want a log trail
    // con.query("INSERT INTO heartbeats (...) VALUES (...)", ...)

    return res.status(200).json({ success: true, timestamp });
  } catch (error) {
    console.error("💥 Heartbeat error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});



export { router as EmployeeRouter };
