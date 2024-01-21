import { useEffect, useRef, useState } from "react";
import Room from "./Room";
import Modal from "./Modal";

const Home = () => {
  const [name, setName] = useState("");
  const [hasMedia, setMedia] = useState(false);
  const [join, setJoin] = useState(false);
  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [localStream, setStream] = useState(null);
  const videoRef = useRef(null);
  const modelRef = useRef(null);

  const getCameraPersmission = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      console.log("Please allow permission to use camera and microphone");
      modelRef.current?.showModal();
      return;
    }

    const video = stream.getVideoTracks()[0];
    const audio = stream.getAudioTracks()[0];

    setAudioTrack(audio);
    setVideoTrack(video);

    if (!videoRef.current) return;

    videoRef.current.srcObject = new MediaStream([video]);

    setMedia(true);
    setStream(stream);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (name.length > 0 && hasMedia) {
        setJoin(true);
      }
    }
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCameraPersmission();
    }
  }, [videoRef]);

  if (!join) {
    return (
      <>
        <div className=" flex  flex-col items-center  gap-3   ">
          <video
            className="aspect-video   min-h-[400px] rounded-lg"
            ref={videoRef}
            autoPlay
          ></video>
          <input
            className="input input-bordered input-info w-full max-w-xs"
            type="text"
            placeholder="Please enter your name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e)}
          />
          <button
            disabled={!name.length > 0 && hasMedia}
            className="btn btn-outline btn-primary px-8"
            onClick={(e) => setJoin(true)}
          >
            Join
          </button>
        </div>
        <Modal ref={modelRef} />
      </>
    );
  }
  return (
    <Room
      localName={name}
      localStream={localStream}
      localAudioTrack={audioTrack}
      localVideoTrack={videoTrack}
    />
  );
};
export default Home;
