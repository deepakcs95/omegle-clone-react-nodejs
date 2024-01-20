import { useEffect, useRef, useState } from "react";
import Room from "./Room";

const Home = () => {
  const [name, setName] = useState("");
  const [hasMedia, setMedia] = useState(false);
  const [join, setJoin] = useState(false);
  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const videoRef = useRef(null);

  const getCameraPersmission = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      console.log("Please allow permission to use camera and microphone");
      return;
    }

    const video = stream.getVideoTracks()[0];
    const audio = stream.getAudioTracks()[0];

    setAudioTrack(audio);
    setVideoTrack(video);

    if (!videoRef.current) return;

    videoRef.current.srcObject = new MediaStream([video]);

    setMedia(true);
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCameraPersmission();
    }
  }, [videoRef]);

  if (!join) {
    return (
      <div className="flex flex-col  items-center border">
        <video ref={videoRef} autoPlay></video>
        <input
          className="block w-[400px] p-3 border border-stone-950"
          type="text"
          onChange={(e) => setName(e.target.value)}
        />
        <button
          disabled={!name.length > 0 && hasMedia}
          className=" p-4 bg-red-800"
          onClick={(e) => setJoin(true)}
        >
          Join
        </button>
      </div>
    );
  }
  return <Room localName={name} localAudioTrack={audioTrack} localVideoTrack={videoTrack} />;
};
export default Home;
