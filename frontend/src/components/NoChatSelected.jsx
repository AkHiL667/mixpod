import { MessageSquare } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useCallStore } from "../store/useCallStore";

function NoChatSelected() {
  const remoteVideoRef = useRef();
  const remoteAudioRef = useRef();
  const { peer, isVideoCall } = useCallStore();
  const [remoteStream, setRemoteStream] = useState(null);

  console.log(peer);

  useEffect(() => {
    if (!peer) return;
    peer.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
    });
  }, [peer]);

  useEffect(() => {
    if (isVideoCall && remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (!isVideoCall && remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isVideoCall]);

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce"
            >
              <MessageSquare className="w-8 h-8 text-primary " />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to MixPod</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>

        {isVideoCall ? (
          <video ref={remoteVideoRef} autoPlay playsInline />
        ) : (
          <audio ref={remoteAudioRef} autoPlay controls={false} />
        )}
      </div>
    </div>
  )
}

export default NoChatSelected