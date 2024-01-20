import { useEffect } from "react";
import io from "socket.io-client";

const Room = ({ name, localAudioTrack, localVideoTrack }) => {
  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.emit("join", { name });

    socket.on("send-offer", async ({ roomId, name }) => {
      console.log("sending offer", roomId, name);
    });
  }, []);

  return <div>Room</div>;
};
export default Room;
