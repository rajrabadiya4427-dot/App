import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useThemeStore } from "../store/useThemeStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { sendMessage } = useChatStore();
  const { theme } = useThemeStore();
  const [showEmoji, setShowEmoji] = useState(false);

  const darkThemes = [
    "dark",
    "synthwave",
    "halloween",
    "forest",
    "black",
    "luxury",
    "dracula",
    "business",
    "night",
    "coffee",
    "sunset",
    "dim",
  ];
  const isDark = darkThemes.includes(theme);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showEmoji]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    const messageText = text.trim();
    const messageImage = imagePreview;

    setText("");
    setImagePreview(null);
    setShowEmoji(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      await sendMessage({
        text: messageText,
        image: messageImage,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Message failed to send");
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 relative">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md text-sm"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Emoji Button & Picker Container */}
          <div className="relative flex items-center justify-center" ref={emojiPickerRef}>
            <button
              type="button"
              className={`btn btn-ghost btn-circle btn-sm sm:btn-md transition-colors ${
                showEmoji ? "text-amber-500 bg-base-200" : "text-zinc-400 hover:text-amber-400"
              }`}
              onClick={() => setShowEmoji((prev) => !prev)}
              title="Add emoji"
            >
              <Smile className="size-5 sm:size-6" />
            </button>

            {/* Emoji Picker Popup - Positioned right above the button, centered */}
            {showEmoji && (
              <div className="absolute bottom-full mb-3 right-[-40px] sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-50 w-[300px] sm:w-[350px] max-w-[calc(100vw-2rem)] shadow-2xl rounded-2xl overflow-hidden border border-base-300">
                <EmojiPicker
                  width="100%"
                  height={380}
                  theme={isDark ? Theme.DARK : Theme.LIGHT}
                  onEmojiClick={(emojiData) =>
                    setText((prev) => prev + emojiData.emoji)
                  }
                />
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Image Button */}
          <button
            type="button"
            className={`btn btn-ghost btn-circle btn-sm sm:btn-md ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
          >
            <Image className="size-5 sm:size-6" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="btn btn-primary btn-circle btn-sm sm:btn-md"
          disabled={!text.trim() && !imagePreview}
        >
          <Send className="size-5 sm:size-6" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;