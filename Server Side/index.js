import express from "express";
import cors from "cors";
import { AdminRouter } from "./Routes/AdminRoute.js";
import { AdminLogin } from "./Routes/AdminLogin.js";
import { EmployeeRouter } from "./Routes/EmployeeRoute.js";
import { EmployeeLogin } from "./Routes/EmployeeLogin.js";
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.set("io", io);

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  console.log("🔐 Token received:", token);

  if (token) {
    Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if (err) return res.json({ Status: false, Error: "Wrong Token" });
      req.id = decoded.id;
      req.role = decoded.role;
      next();
    });
  } else {
    return res.json({ Status: false, Error: "token Not autheticated" });
  }
};

app.get("/verify", verifyUser, (req, res) => {
  return res.json({ Status: true, role: req.role, id: req.id });
});

app.use("/adminAuth", AdminLogin);
app.use("/empAuth", EmployeeLogin);

app.use("/admin", verifyUser, AdminRouter);
app.use("/employee", verifyUser, EmployeeRouter);
app.use(express.static("Public"));

server.listen(3000, () => {
  console.log("Server is running at 3000");
});
