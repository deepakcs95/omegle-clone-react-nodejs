import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const Room = ({ localName, localStream, localAudioTrack, localVideoTrack }) => {
  const [senderPC, setSenderPC] = useState(null);
  const [recieverPC, setRecieverPC] = useState(null);

  const [remoteUserName, setRemoteName] = useState("remote");
  const [remoteStream, setRemotStream] = useState(null);
  const [lobby, setLobby] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.emit("join", { name: localName });

    socket.on("lobby", () => {
      setLobby(false);
      setRecieverPC(null);
      setSenderPC(null);
      socket.emit("join", { name: localName });
    });

    socket.on("start-peerconnection", async ({ roomId, name }) => {
      console.log("start-peerconnection", roomId, name);

      const pc = new RTCPeerConnection();

      setSenderPC(pc);

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

    socket.on("sdp-offer", async ({ sdp, roomId, remoteName }) => {
      console.log("offer sdp recived ", localName);
      setRemoteName(remoteName);

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

      pc.onconnectionstatechange = (e) => {
        console.log("remote", e.currentTarget.connectionState);
        if (e.currentTarget.connectionState === "connected") {
          const stream = new MediaStream();
          pc.getTransceivers().forEach((tranceiver) => {
            stream.addTrack(tranceiver.receiver.track);
            if (tranceiver.receiver.track.kind === "audio") {
              console.log("remote audio");
            } else {
              console.log("remote video");
            }
          });
          console.log(stream);
          setRemotStream(stream);
          setLobby(true);
        }

        if (e.currentTarget.connectionState === "disconnected") {
          setLobby(false);
        }
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

  useEffect(() => {
    if (localVideoRef.current) {
      if (localStream) {
        localVideoRef.current.srcObject = new MediaStream([localStream.getVideoTracks()[0]]);
      }
    }
  }, [localVideoRef]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream]);

  return (
    <div className="w-full h-full flex items-center border">
      <div className="w-[50%] h-[400px] grid place-content-center">
        <video autoPlay ref={localVideoRef}></video>
        <p>{localName}</p>
      </div>
      {lobby ? (
        <div className="w-[50%] h-[400px] grid place-content-center">
          <video autoPlay ref={remoteVideoRef}></video>
          <span>{remoteUserName}</span>
        </div>
      ) : (
        <h1>waiting for user to join</h1>
      )}
    </div>
  );
};
export default Room;
