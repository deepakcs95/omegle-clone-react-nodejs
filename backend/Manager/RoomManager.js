import { v4 as uuid } from "uuid";

export default class RoomManager {
  constructor() {
    this.room = new Map();
  }

  createRoom(user1, user2) {
    const roomId = this.generateRoomId();
    this.room.set(roomId, { user1, user2 });

    const name1 = user1.name;
    const name2 = user2.name;

    user1.socket.emit("send-offer", { roomId, name: name2 });
    user2.socket.emit("send-offer", { roomId, name: name1 });
  }

  generateRoomId() {
    return uuid();
  }
}
