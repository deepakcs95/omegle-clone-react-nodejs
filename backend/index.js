import { Server } from "socket.io";
import UserManager from "./Manager/UserManager.js";

const io = new Server({
  cors: {
    origin: "*",
  },
});

const userManager = new UserManager();

io.on("connection", (socket) => {
  console.log("user is connected ", socket.id);
  socket.on("test", () => {
    socket.emit("socket", socket.id);
    userManager.addUser("newUser", socket);
  });
});

io.listen(3000);

console.log("io is running");
