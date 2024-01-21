import { useCallback, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Peer from "peerjs";

const Room = ({ localName, localStream, localAudioTrack, localVideoTrack }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [lobby, setLobby] = useState(false);
  const [peerId, setPeerID] = useState("");
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteUserName, setRemoteName] = useState("");

  useEffect(() => {
    const socket = io("http://localhost:3000");

    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerID(id);
      console.log(id);
      socket.emit("join", { name: localName, peerId: id });
    });

    socket.on("user-joined-room", ({ roomId, name, peerId }) => {
      console.log("user-joined-room", roomId, name, peerId);
      setRemoteName(name);
      setLobby(true);
    });

    socket.on("call", ({ roomId, peerId }) => {
      console.log("user calling");

      const call = peer.call(peerId, localStream);
      call.on("stream", (stream) => {
        // Show stream in some video/canvas element.
        setRemoteStream(() => stream);
        setLobby(true);
        console.log("asnwered user stream", stream);
      });
    });

    peer.on("call", (call) => {
      call.answer(localStream); // Answer the call with an A/V stream.
      call.on("stream", (stream) => {
        // Show stream in some video/canvas element.
        console.log("called user stream ", stream.getVideoTracks());
        setRemoteStream(() => stream);
        setLobby(true);
      });
    });

    socket.on("rejoin", () => {
      console.log("REJOIN");
      socket.emit("join", { name: localName, peerId });
      setLobby(false);
      setRemoteStream(null);
      setRemoteName("");
    });
  }, [localName]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <>
      <div className=" lg:max-w-[70%]     grid grid-cols-2 ">
        <div className="grid place-items-center ">
          <video autoPlay ref={localVideoRef} />
          <p className="  p-3 rounded-sm bg-neutral  ">{localName}</p>
        </div>

        {lobby ? (
          <div className="grid place-items-center">
            <video className="    " autoPlay ref={remoteVideoRef} />
            <p className="   p-3 rounded-sm bg-neutral  ">{remoteUserName}</p>
          </div>
        ) : (
          <div className="relative relativew-[50%] h-[400px] flex flex-col items-center justify-center text-primary">
            <span className="block loading loading-infinity loading-lg "></span>
            <h1>waiting for user to join</h1>
          </div>
        )}
      </div>
      {/* {lobby ? (
        <button className="btn btn-primary " onClick={() => handleNextUser()}>
          Try Next User
        </button>
      ) : null} */}
    </>
  );
};
export default Room;
