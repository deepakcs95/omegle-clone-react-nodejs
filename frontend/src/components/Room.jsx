import { useEffect, useState } from "react";
import io from "socket.io-client";

const Room = ({ localName, localStream, localAudioTrack, localVideoTrack }) => {
  const [senderPC, setSenderPC] = useState(null);
  const [recieverPC, setRecieverPC] = useState(null);

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.emit("join", { name: localName });

    socket.on("start-peerconnection", async ({ roomId, name }) => {
      console.log("start-peerconnection", roomId, name);

      const pc = new RTCPeerConnection();

      setSenderPC(pc);
      // if (localVideoTrack) {
      //   console.error("video tack");
      //   //  console.log(localVideoTrack);
      //   pc.addTrack(localVideoTrack);
      // }
      // if (localAudioTrack) {
      //   console.error("audio tack");
      //   //  console.log(localAudioTrack);
      //   pc.addTrack(localAudioTrack);
      // }

      localStream.getTracks().forEach(function (track) {
        console.log(track);
        pc.addTrack(track, localStream);
      });

      pc.onicecandidate = (e) => {
        if (!e.candidate) {
          return;
        }
        console.log("sending ice candidate ", localName);
        socket.emit("add-ice-candidate", { candidate: e.candidate, roomId, type: "sender" });
      };

      pc.onnegotiationneeded = async () => {
        console.log("negotiantion needed for ", localName);
        const sdp = await pc.createOffer();
        console.log("created sdp offer ", localName);
        pc.setLocalDescription(sdp);

        socket.emit("offer", { sdp, roomId });
      };

      pc.onconnectionstatechange = (e) => console.log(e.currentTarget.connectionState);
    });

    socket.on("sdp-offer", async ({ sdp, roomId }) => {
      console.log("offer sdp recived ", localName);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(sdp);
      const answer = await pc.createAnswer();
      pc.setLocalDescription(answer);

      setRecieverPC(pc);
      socket.emit("answer", { sdp: answer, roomId });

      pc.onicecandidate = (e) => {
        if (!e.candidate) {
          return;
        }
        console.log("sending ice candidate ", localName);
        socket.emit("add-ice-candidate", { candidate: e.candidate, roomId, type: "receiver" });
      };

      pc.ontrack = (e) => {
        console.log("track recivived");
      };

      pc.onconnectionstatechange = (e) => {
        console.log("remote", e.currentTarget.connectionState);
        pc.getTransceivers().forEach((tranceiver) => {
          if (tranceiver.receiver.track.kind === "audio") {
            console.log("remote audio");
          } else {
            console.log("remote video");
          }
        });
      };
    });

    socket.on("sdp-answer", async ({ sdp, roomId }) => {
      console.log("answer sdp recived ", localName);
      setSenderPC((peerConnection) => {
        peerConnection?.setRemoteDescription(sdp);
        return peerConnection;
      });
    });

    socket.on("ice-candidate", ({ candidate, type, roomId }) => {
      console.log("adding ice candidate ", type);
      if (type === "sender") {
        setRecieverPC((peerConnection) => {
          peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
          return peerConnection;
        });
      } else {
        setSenderPC((peerConnection) => {
          peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
          return peerConnection;
        });
      }
    });
  }, [localName]);

  return <div>Room</div>;
};
export default Room;
