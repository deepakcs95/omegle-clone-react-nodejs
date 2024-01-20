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
    user1.socket.emit("start-peerconnection", { roomId, name: name2 });
    user2.socket.emit("start-peerconnection", { roomId, name: name1 });
  }

  onOffer(roomId, sdp, senderSocketId) {
    const room = this.room.get(roomId);

    if (!room) return;

    const recieverSocket = room.user1;

    recieverSocket?.socket.emit("sdp-offer", { sdp, roomId });
  }
  onAnswer(roomId, sdp, senderSocketId) {
    const room = this.room.get(roomId);

    if (!room) return;

    const recieverSocket = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    recieverSocket?.socket.emit("sdp-answer", { sdp, roomId });
  }
  onIceCandidates(roomId, candidate, senderSocketId) {
    const room = this.room.get(roomId);

    if (!room) return;

    const recieverSocket = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    recieverSocket?.socket.emit("ice-candidate", { candidate, roomId });
  }

  onNegotiationNeeded(roomId, senderSocketId) {
    const room = this.room.get(roomId);

    if (!room) return;

    room.user1?.socket.emit("send-offer", { roomId });
  }

  generateRoomId() {
    return uuid();
  }
}
