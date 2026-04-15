import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import "express-async-errors";

import authRoutes from "./routes/authRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import seed from "./seed.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
  transports: ["polling", "websocket"],
  allowRequest: (req, callback) => {
    callback(null, true);
  },
});

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/meditrack")
  .then(() => {
    console.log("MongoDB Connected");
    seed();
  })
  .catch(err => console.log("MongoDB Connection Error: ", err));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "MediTrack Pro API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join_dashboard", () => {
    socket.join("dashboard");
    console.log(`Socket ${socket.id} joined dashboard room`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const broadcastDashboardUpdate = async () => {
  try {
    const Hospital = mongoose.model("Hospital");
    const User = mongoose.model("User");
    const Ticket = mongoose.model("Ticket");

    const [totalUsers, activeAdmins, totalTickets, totalHospitals] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "admin", isActive: true }),
      Ticket.countDocuments(),
      Hospital.countDocuments(),
    ]);

    const stats = { totalUsers, activeAdmins, totalTickets, totalHospitals };
    io.to("dashboard").emit("dashboard_update", stats);
  } catch (error) {
    console.error("Broadcast error:", error);
  }
};

setInterval(broadcastDashboardUpdate, 30000);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

global.io = io;
export { io, broadcastDashboardUpdate };
