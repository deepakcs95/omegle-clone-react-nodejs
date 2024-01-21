import { Server } from "socket.io";
import UserManager from "./Manager/UserManager.js";

const io = new Server({
  cors: {
    origin: "*",
  },
});

const userManager = new UserManager();

io.on("connection", (socket) => {
  console.log("a user is connected ");
  socket.on("join", ({ name, peerId }) => {
    userManager.addUser(name, peerId, socket);
  });
});

io.listen(3000);

console.log("io is running ,");
