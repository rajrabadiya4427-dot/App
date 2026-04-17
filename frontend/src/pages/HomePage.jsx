import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";

import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg w-full shadow-cl max-w-6xl h-[calc(100vh-8rem)] overflow-hidden">
          {!selectedUser ? <Sidebar /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};
export default HomePage;
