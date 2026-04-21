import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-dvh bg-base-200 overflow-hidden flex flex-col">
      {/* Main content area - takes remaining height */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <div className="bg-base-100 rounded-lg w-full h-full max-h-full shadow-cl overflow-hidden flex flex-col">
          {!selectedUser ? <Sidebar /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;