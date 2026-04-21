import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";

import ChatContainer from "../components/ChatContainer";
// HomePage.jsx
const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200 overflow-hidden">
      <div className="flex items-center justify-center pt-20 px-4 h-full">
        <div className="bg-base-100 rounded-lg w-full shadow-cl h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
          {!selectedUser ? <Sidebar /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
