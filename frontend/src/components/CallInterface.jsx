import React, { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

const CallInterface = () => {
  const { 
    stream, 
    call, 
    callAccepted, 
    callEnded, 
    endCall,
    initializeMedia,
    answerCall,
    isVideo,
    callRinging,
    setCallRinging
  } = useCallStore();
  const { authUser } = useAuthStore();
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const remoteAudioRef = useRef();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Initialize media when component mounts
  useEffect(() => {
    if (!stream) {
      initializeMedia(call?.isVideo);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, initializeMedia, call?.isVideo]);

  // Set up local video
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
  const isCaller = call && authUser && call.from === authUser._id;

  // Callee: show Accept/Reject if callRinging and not accepted/ended and not the caller
  if (callRinging && !callAccepted && !callEnded && !isCaller) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
        <div className="text-white text-2xl mb-4">
          Incoming {call?.isVideo ? 'Video' : 'Audio'} Call
        </div>
        <div className="text-white text-xl mb-8">
          from {call?.name || 'Unknown'}
        </div>
        <div className="flex gap-4">
          <button
            className="btn btn-success btn-lg"
            onClick={() => {
              answerCall();
              setCallRinging(false);
            }}
          >
            <Phone className="mr-2" />
            Accept
          </button>
          <button
            className="btn btn-error btn-lg"
            onClick={() => {
              setCallRinging(false);
              endCall();
            }}
          >
            <PhoneOff className="mr-2" />
            Reject
          </button>
        </div>
      </div>
    );
  }

  // Caller: show 'Calling...' if not accepted and not ended
  if (isCaller && !callAccepted && !callEnded) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
        <div className="text-white text-2xl mb-4">
          Calling...
        </div>
        <div className="text-white text-xl mb-8">
          Waiting for the other user to accept the call.
        </div>
        <button
          className="btn btn-error btn-lg"
          onClick={endCall}
        >
          <PhoneOff className="mr-2" />
          Cancel
        </button>
      </div>
    );
  }

  console.log("CallInterface state:", { call, callRinging, callAccepted, callEnded, authUser });

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      <div className="flex-1 relative">
        {/* Remote Video - only show if it's a video call */}
        {isVideoCall && (
          <>
            <video
              id="remoteVideo"
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Local video preview */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
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
              <audio ref={remoteAudioRef} autoPlay />
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
