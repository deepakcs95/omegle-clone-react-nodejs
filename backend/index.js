import UserManager from "./Manager/UserManager.js";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // ...
});

const userManager = new UserManager();

io.on("connection", (socket) => {
  console.log("a user is connected ");
  socket.on("join", ({ name, peerId }) => {
    userManager.addUser(name, peerId, socket);
  });
});

httpServer.listen(3000);
// io.listen(3000);

console.log("io is running on,", process.env.PORT);
