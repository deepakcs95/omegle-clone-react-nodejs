import RoomManager from "./RoomManager.js";

export default class UserManager {
  constructor() {
    this.users = [];
    this.queue = [];
    this.room = new RoomManager();
  }

  addUser(name, peerId, socket) {
    this.users.push({ name, peerId, socket });
    this.queue.push(socket.id);
    this.initHandlers(socket);
    this.clearQueue();
    console.log(this.queue);
  }

  clearQueue() {
    console.log("checking the queue lenght");
    console.log(this.queue.length);

    if (this.queue.length < 2) return;

    const id1 = this.queue.pop();
    const id2 = this.queue.pop();

    const user1 = this.users.find((a) => a.socket.id === id1);
    const user2 = this.users.find((a) => a.socket.id === id2);

    if (!user1 || !user2) return;

    console.log("creating room");

    this.room.createRoom(user1, user2);
    // this.clearQueue();
  }

  initHandlers(socket) {
    socket.on("disconnect", (reason) => {
      console.log("user is disconnect ", socket.id);
      this.room.onDisconnect(socket.id);
    });
    socket.on("roomId", (roomId) => {
      console.log("next user ", socket.id);

      this.room.onNextUser(socket.id);
    });
  }
}
