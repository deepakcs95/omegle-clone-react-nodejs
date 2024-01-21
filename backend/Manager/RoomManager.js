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

    console.log(name1, name2);
    user1.socket.join(roomId);
    user2.socket.join(roomId);
    console.log(user1.peerId, user2.peerId);
    user1.socket.broadcast
      .to(roomId)
      .emit("user-joined-room", { roomId, name: user1.name, peerId: user1.peerId });
    user2.socket.broadcast
      .to(roomId)
      .emit("user-joined-room", { roomId, name: user2.name, peerId: user2.peerId });
    user2.socket.broadcast.to(roomId).emit("call", { roomId, peerId: user2.peerId });
  }

  onDisconnect(senderSocketId) {
    const roomId = this.findRoomIdByUser1SocketId(this.room, senderSocketId);
    const room = this.room.get(roomId);
    if (!room) return;

    const recieverSocket = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    this.room.delete(roomId);
    recieverSocket?.socket.emit("rejoin");
  }

  onNextUser(roomId) {
    const room = this.room.get(roomId);
    console.log(room);
    if (!room) return;
    console.log(room.user1.name, room.user2.name);
    room.user1.socket.to(roomId).emit("rejoin");
  }

  findRoomIdByUser1SocketId(map, targetSocketId) {
    for (const [roomId, users] of this.room.entries()) {
      if (
        (users.user1 && users.user1.socket && users.user1.socket.id === targetSocketId) ||
        (users.user2 && users.user1.socket && users.user2.socket.id === targetSocketId)
      ) {
        return roomId;
      }
    }
    // Return null or a specific value if no match is found
    return null;
  }

  generateRoomId() {
    return uuid();
  }
}
