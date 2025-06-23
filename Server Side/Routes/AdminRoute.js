import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

const router = express.Router();

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ loginStatus: true });
    } else {
      return res.json({ loginStatus: false, Error: "wrong email or password" });
    }
  });
});


router.get("/category", (req, res) => {
  const sql = "SELECT * FROM category";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});


router.post("/add_category", (req, res) => {
  const sql = "INSERT INTO category (`name`) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true });
  });
});


// image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
});
// end imag eupload


router.post("/add_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO employee 
    (name,email,password, address, salary,image, category_id) 
    VALUES (?)`;
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    const values = [
      req.body.name,
      req.body.email,
      hash,
      req.body.address,
      req.body.salary,
      req.file.filename,
      req.body.category_id,
    ];
    con.query(sql, [values], (err, result) => {
      if (err) return res.json({ Status: false, Error: err });
      return res.json({ Status: true });
    });
  });
});


router.get("/employee", (req, res) => {
  const sql = "SELECT * FROM employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.put("/edit_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employee 
        set name = ?, email = ?, salary = ?, address = ?, category_id = ? 
        Where id = ?`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.category_id,
  ];
  con.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.delete("/delete_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "delete from employee where id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_count", (req, res) => {
  const sql = "select count(id) as admin from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee_count", (req, res) => {
  const sql = "select count(id) as employee from employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/salary_count", (req, res) => {
  const sql = "select sum(salary) as salaryOFEmp from employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_records", (req, res) => {
  const sql = "select * from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/log_screenshot", (req, res) => {
  const data = req.body;
  const sql = `INSERT INTO screenshot_logs (employee_id, filename, url,timestamp) VALUES (?,?,?,?)`;

  con.query(
    sql,
    [data.employee_id, data.filename, data.url, data.timestamp],
    (err, result) => {
      if (err) {
        console.error("Log insertion failed: ", err);
        return res.status(500).json("ERROR:", err);
      }
      res.json({ Status: true, message: "Log Saved", log_id: result.insertId });
    }
  );
});

router.get("/screenshot_logs/:id", (req, res) => {
  const emp_id = req.params.id;
  if (!emp_id)
    return res
      .status(400)
      .json({ Status: false, error: "Missing employee ID" });

  const sql = `SELECT * from screenshot_logs WHERE employee_id = ?  ORDER BY timestamp DESC`;
  con.query(sql, [emp_id], (err, result) => {
    if (err) {
      console.log("Fetching logs error: ", err);
      return res.status(500).json("Error: ", err.message);
    }
    res.json({ Status: true, data: result });
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

//PRINTSCREEN
router.post("/log_printScreen", (req, res) => {
  const data = req.body;
  const sql = `INSERT INTO printScreen_logs (employee_id, url, timestamp) VALUES (?,?,?)`;

  con.query(
    sql,
    [data.employee_id, data.url, data.timestamp],
    (err, result) => {
      if (err) {
        console.error("PrintScreen Log insertion failed: ", err);
        return res.status(500).json("ERROR:", err);
      }
      res.json({ Status: true, message: "PrintScreen Log Saved", log_id: result.insertId });
    }
  );
});


router.get("/printScreen_logs/:id", (req, res) => {
  const emp_id = req.params.id;
  if (!emp_id)
    return res
      .status(400)
      .json({ Status: false, error: "Missing employee ID" });

  const sql = `SELECT * from printScreen_logs WHERE employee_id = ?  ORDER BY timestamp DESC`;
  con.query(sql, [emp_id], (err, result) => {
    if (err) {
      console.log("Fetching PrintScreen logs error: ", err);
      return res.status(500).json("Error in fetching Printscreen logs: ", err.message);
    }
    res.json({ Status: true, data: result });
  });
});

//Usb detection
router.post("/log_usb", async (req, res) => {
  const { employee_id, event, timestamp } = req.body;
  try {
    await con.query(
      "INSERT INTO usb_logs (employee_id, event, timestamp) VALUES (?, ?, ?)",
      [employee_id, event, timestamp]
    );
    res.json({ status: true });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

router.get("/usb_logs/:id", async (req,res)=>{
  const id = req.params.id
  if (!id)
    return res
      .status(400)
      .json({ Status: false, error: "Missing employee ID" });

  const sql = `Select * from usb_logs WHERE employee_id = ?`
  
  con.query(sql, [id], (err, result) => {
    if (err) { 
      console.log("Fetching PrintScreen logs error: ", err);
      return res.status(500).json("Error in fetching Printscreen logs: ", err.message);
    }
    res.json({status:true ,data: result})
  });
})

//alert notifications
// GET all notifications
router.get("/notifications", async (req, res) => {
  const rows = await new Promise((resolve, reject) => {
  con.query(
    `SELECT n.id, n.employee_id, e.name AS employee_name, n.event, n.timestamp, n.seen
     FROM notifications n
     JOIN employee e ON n.employee_id = e.id
     ORDER BY n.timestamp DESC`,
    (err, result) => {
      if (err) return reject(err);
      resolve(result);
    }
  );
});
  res.json(rows);
});

// PATCH to mark all as seen
router.patch("/notifications/mark-seen", async (req, res) => {
  await con.query("UPDATE notifications SET seen = TRUE");
  res.json({ success: true });
});


export { router as adminRouter };
