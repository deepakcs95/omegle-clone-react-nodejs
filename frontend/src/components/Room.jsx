import { useEffect, useState } from "react";
import io from "socket.io-client";

const Room = ({ localName, localAudioTrack, localVideoTrack }) => {
  const [pc, setPeerConnection] = useState(new RTCPeerConnection());

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.emit("join", { name: localName });

    socket.on("start-peerconnection", async ({ roomId, name }) => {
      console.log("start-peerconnection", roomId, name);

      // const pc = new RTCPeerConnection();

      if (localVideoTrack) {
        console.error("video tack");
        //  console.log(localVideoTrack);
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        console.error("audio tack");
        //  console.log(localAudioTrack);
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = (e) => {
        if (!e.candidate) {
          return;
        }
        console.log("sending ice candidate ", localName);
        socket.emit("add-ice-candidate", { candidate: e.candidate, roomId });
      };

      pc.onnegotiationneeded = async () => {
        console.log("negotiantion needed for ", localName);
        const sdp = await pc.createOffer();
        console.log("created sdp offer ", localName);
        pc.setLocalDescription(sdp);

        socket.emit("offer", { sdp, roomId });
      };

      setPeerConnection(() => pc);
    });

    socket.on("sdp-offer", async ({ sdp, roomId }) => {
      console.log("offer sdp recived ", localName);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(sdp);
      const answer = await pc.createAnswer();
      pc.setLocalDescription(answer);

      socket.emit("answer", { sdp: answer, roomId });
    });

    socket.on("sdp-answer", async ({ sdp, roomId }) => {
      console.log("answer sdp recived ", localName);
      setPeerConnection((peerConnection) => {
        peerConnection?.setRemoteDescription(sdp);
        return peerConnection;
      });
    });

    socket.on("ice-candidate", ({ candidate, roomId }) => {
      console.log("adding ice candidate ", candidate);
      setPeerConnection((peerConnection) => {
        peerConnection?.addIceCandidate(candidate);
        return peerConnection;
      });
    });
  }, []);

  return <div>Room</div>;
};
export default Room;
