import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";

import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 ">
        <div className="bg-base-100 rounded-lg w-full shadow-cl  min-h-300 overflow-hidden">
          {!selectedUser ? <Sidebar /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};
export default HomePage;
