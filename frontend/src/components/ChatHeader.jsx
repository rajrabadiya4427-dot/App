import { XCircleIcon, ImageIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState, useEffect } from "react";
const ChatHeader = () => {
  const { selectedUser, setSelectedUser, setWallpaper } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showWallpaper, setShowWallpaper] = useState(false);
  const { emitWallpaperChange } = useAuthStore();

  const wallpapers = [
    "/wallpapers/premium_photo-1670595337767-1af7ce73df5c.avif",
    "/wallpapers/360_F_202179808_o2YPAXShv0rdjQSso7mqOqSprYAvhKEM.jpg",
    "/wallpapers/chat-wallpaper-social-media-message-background-copy-space-for-a-text-vector.jpg",
    "/wallpapers/faces-smile-pattern-funny-cute-smiley-expression-emotion-chat-messenger-kid-cartoon-vector-seamless-wallpaper-145496058.webp",
    "/wallpapers/HD-wallpaper-chat-bubble-neon-icon-blue-background-neon-symbols-chat-bubble-neon-icons-chat-bubble-sign-computer-signs-chat-bubble-icon-computer-icons.jpg",
    "/wallpapers/cute-cat-couple-love-desktop-wallpaper-cover.jpg",
    "/wallpapers/29454.jpg",
    "/wallpapers/bHynNUp.webp",
    "/wallpapers/bluelit-soldiers-with-rifles-darkened-room_1282444-23989.avif",
    "/wallpapers/futuristic-soldier-with-helmet-night-with-copy-space-gaming-background_758367-159074.avif",
  ];

  useEffect(() => {
    const handleClickOutside = () => setShowWallpaper(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="p-2.5 border-b border-base-300 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowWallpaper(!showWallpaper);
            }}
          >
            <ImageIcon />
          </button>

          <button onClick={() => setSelectedUser(null)}>
            <XCircleIcon />
          </button>
        </div>

       {showWallpaper && (
  <div className="absolute min-h-50 right-3 top-14 z-50 bg-base-200 p-3 rounded-xl shadow-xl w-64">
    <div className="grid grid-cols-3 gap-2">
      {/* Default reset tile */}
      <div
        className="w-full h-16 rounded-lg cursor-pointer border-2 border-dashed border-base-content/30 flex items-center justify-center text-xs text-base-content/70 hover:bg-base-300 transition"
        onClick={() => {
          setWallpaper(null);
          localStorage.removeItem("chatWallpaper");
          emitWallpaperChange(null, selectedUser._id);
          setShowWallpaper(false);
        }}
      >
        Default
      </div>
      {wallpapers.map((img) => (
        <img
          key={img}
          src={img}
          className="w-full h-16 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
          onClick={() => {
            setWallpaper(img);
            emitWallpaperChange(img, selectedUser._id);
            setShowWallpaper(false);
          }}
        />
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
};
export default ChatHeader;
