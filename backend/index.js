import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("user is connected ", socket);
});

io.listen(3000);
