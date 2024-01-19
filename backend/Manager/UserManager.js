import RoomManager from "./RoomManager.js";

export default class UserManager {
  constructor() {
    this.users = [];
    this.queue = [];
    this.room = new RoomManager();
  }

  addUser(name, socket) {
    this.users.push({ name, socket });
    this.queue.push(socket.id);
    this.clearQueue();
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

    this.clearQueue();
  }
}
