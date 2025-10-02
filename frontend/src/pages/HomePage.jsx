import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="flex items-center justify-center pt-20 px-4 h-full relative z-10">
        <div className="bg-base-100 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-6xl h-[calc(100vh-8rem)] border-2 border-purple-200/50 overflow-hidden animate-scale-in" style={{boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)'}}>
          <div className="flex h-full">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;