import express from "express";
import { createServer } from "http"; // Only import createServer
import { Server } from "socket.io"; // Import Server from socket.io, not http
import config from "./config/config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import sleepRoutes from "./routes/sleepRoutes";
import dietRoutes from "./routes/dietRoutes";
import goalsRoutes from "./routes/goalsRoutes";
import cookieParser from "cookie-parser";
import workoutRoutes from "./routes/workoutRoutes";
import trackerRoutes from "./routes/trackerRoutes";
import userDetailsRoutes from "./routes/userDetailsRoutes";
import locationRoutes from "./routes/locationRoutes";
import progressRoutes from "./routes/progressRoutes";
import foodSearchRoutes from "./routes/foodSearchRoutes";
import cors from "cors";
import socketHandler from "./chatbot/socketHandler"; // Fix the typo

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "https://nextrep.site",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Socket.IO setup with CORS configuration
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "https://nextrep.site",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cookieParser());

// Make io accessible in routes
app.set("io", io);

// Setup socket handlers
socketHandler(io);

config.setupSwagger(app);
app.use("/api", authRoutes);
app.use("/api", goalsRoutes);
app.use("/api", sleepRoutes);
app.use("/api", dietRoutes);
app.use("/api", workoutRoutes);
app.use("/api", trackerRoutes);
app.use("/api", userDetailsRoutes);
app.use("/api", progressRoutes);
app.use("/api", locationRoutes);
app.use("/api", foodSearchRoutes);
app.use(errorHandler);

app.get("/", (req, res) => {
  const mode = process.env.MODE || "development";
  const envBadge = mode === "production" ? "production" : "development";

  res.send(`<!DOCTYPE html>
        <html>
        <head>
            <title>NextRep</title>
            <meta charset="utf-8">
        </head>
            <body style="font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace;">
            <h1>NextRep</h1>
            <p>Version: 2.0.0 (Deployed to Production)</p>
            <p>© Danish Abbas & Momena Akhtar - 2025</p>
            <p><strong>Environment:</strong> ${envBadge}</p>
            <a href="/api/docs/">View API Documentation</a>
        </body>
        </html>`);
});

config.connectDB().then(() => {
  server.listen(config.port, () => {
    // Use server.listen instead of app.listen
    console.log(`[Server] Server running on http://localhost:${config.port}`);
    console.log(`[Socket] Socket.IO server initialized`);
  });
});

export { app, server, io };
