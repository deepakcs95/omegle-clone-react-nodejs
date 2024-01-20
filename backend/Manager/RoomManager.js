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

    const recieverSocket = room.user1.socket.id === senderSocketId.id ? room.user2 : room.user1;
    console.log("offer ", recieverSocket.name, recieverSocket.socket.id, senderSocketId.id);

    recieverSocket?.socket.emit("sdp-offer", { sdp, roomId });
  }
  onAnswer(roomId, sdp, senderSocketId) {
    const room = this.room.get(roomId);

    if (!room) return;

    const recieverSocket = room.user1.socket.id === senderSocketId.id ? room.user2 : room.user1;
    console.log("answer ", recieverSocket.name, recieverSocket.socket.id, senderSocketId.id);

    recieverSocket?.socket.emit("sdp-answer", { sdp, roomId });
  }
  onIceCandidates(roomId, candidate, type, senderSocketId) {
    const room = this.room.get(roomId);

    if (!room) return;

    const recieverSocket = room.user1.socket.id === senderSocketId.id ? room.user2 : room.user1;
    console.log("ice cand ", recieverSocket.name, recieverSocket.socket.id, senderSocketId.id);

    recieverSocket?.socket.emit("ice-candidate", { candidate, type, roomId });
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
