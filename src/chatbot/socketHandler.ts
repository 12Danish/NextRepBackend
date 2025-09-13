import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";
import { getResp,clearUserHistory } from "./chatFunctions";
const socketHandler = (io: any) => {
  io.use((socket: Socket, next:any) => {
    try {
      // You can pass token via query params, headers, or cookies
      const token =
        socket.handshake.auth?.token || // recommended way
        socket.handshake.query?.token ||
        socket.handshake.headers?.cookie?.split("token=")[1];

      if (!token) {
        return next(new Error("No auth token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "sync");
      console.log("Socket user decoded:", decoded);

      // attach user to socket instance
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: any) => {
    console.log(`[Socket] Connected: ${socket.id}, user:`, socket.user);

    socket.on("userMessage", async (data: { message: string }) => {
      try {
        const userId = socket.user.id; // 👈 grab userId from token
        console.log(`[Socket] Message from ${userId}`);

        const aiResponse = await getResp(userId, data.message);

        socket.emit("aiResponse", {
          response: aiResponse,
      
        });
      } catch (error) {
        console.error(`[Socket] Error:`, error);
        socket.emit("aiError", { error: "Something went wrong" });
      }
    });

    socket.on("disconnect", (reason: string) => {
      console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
      clearUserHistory(socket.user.id)
    });
  });
};

export default socketHandler;
