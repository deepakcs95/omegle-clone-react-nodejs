import { v4 as uuid } from "uuid";

export default class RoomManager {
  constructor() {
    this.room = new Map();
  }

  createRoom(user1, user2) {
    const roomId = this.generateRoomId();
    this.room.set(roomId, { user1, user2 });

    user1.socket.emit("send-offer", roomId);
    user2.socket.emit("send-offer", roomId);
  }

  generateRoomId() {
    return uuid();
  }
}
