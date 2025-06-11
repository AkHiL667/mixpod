import React, { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

const CallInterface = () => {
  const { stream, call, callAccepted, callEnded, endCall } = useCallStore();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Only show video elements if it's a video call
  const isVideoCall = call?.isVideo;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      <div className="flex-1 relative">
        {/* Remote Video - only show if it's a video call */}
        {isVideoCall && (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 w-48 h-36">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </>
        )}
        
        {/* Show audio call UI if it's an audio call */}
        {!isVideoCall && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-2">Audio Call</h2>
              <p>Call in progress...</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="p-4 flex justify-center gap-4">
        <button
          onClick={toggleMute}
          className="btn btn-circle"
        >
          {isMuted ? <MicOff /> : <Mic />}
        </button>
        
        {isVideoCall && (
          <button
            onClick={toggleVideo}
            className="btn btn-circle"
          >
            {isVideoOff ? <VideoOff /> : <Video />}
          </button>
        )}
        
        <button
          onClick={endCall}
          className="btn btn-circle bg-red-500 hover:bg-red-600"
        >
          <PhoneOff />
        </button>
      </div>
    </div>
  );
};

export default CallInterface;
