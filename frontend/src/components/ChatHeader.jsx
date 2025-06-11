import { X, Phone, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { toast } from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { startCall } = useCallStore();
  const { authUser } = useAuthStore();

  // Add call button handlers
  const handleAudioCall = () => {
    if (!selectedUser || !onlineUsers.includes(selectedUser._id)) {
      toast.error("User is offline");
      return;
    }
    startCall(selectedUser._id, false); // false for audio-only call
  };

  const handleVideoCall = () => {
    if (!selectedUser || !onlineUsers.includes(selectedUser._id)) {
      toast.error("User is offline");
      return;
    }
    startCall(selectedUser._id, true); // true for video call
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAudioCall}
            className="btn btn-circle btn-sm"
            title="Audio Call"
            disabled={!onlineUsers.includes(selectedUser._id)}
          >
            <Phone size={18} />
          </button>
          
          <button
            onClick={handleVideoCall}
            className="btn btn-circle btn-sm"
            title="Video Call"
            disabled={!onlineUsers.includes(selectedUser._id)}
          >
            <Video size={18} />
          </button>
          
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;