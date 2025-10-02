import { MessageSquare, Users, Zap, Heart } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:to-purple-900/50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
      
      <div className="max-w-lg text-center space-y-4 relative z-10 animate-scale-in">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            
            {/* Main logo container */}
            <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-4 rounded-2xl shadow-xl">
              <MessageSquare className="w-12 h-12 text-white animate-float" strokeWidth={2.5} />
            </div>
            
            {/* Decorative icons */}
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-pink-400 to-purple-400 p-1.5 rounded-full shadow-lg animate-bounce">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <div className="absolute -bottom-1 -left-1 bg-gradient-to-br from-indigo-400 to-purple-400 p-1.5 rounded-full shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
              <Heart className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            CollabWell
          </h1>
          <p className="text-xs font-semibold text-purple-500 tracking-wider uppercase">
            Where Teams Thrive Together
          </p>
        </div>

        {/* Illustration */}
        <div className="relative w-full max-w-xs mx-auto mb-3">
          <div className="relative">
            {/* Main illustration container */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 shadow-xl">
              {/* Chat bubbles illustration */}
              <div className="relative h-32">
                {/* Left bubble */}
                <div className="absolute left-0 top-0 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl rounded-bl-sm p-4 shadow-lg animate-slide-in-left max-w-[60%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-white/30"></div>
                    <div className="h-2 w-16 bg-white/40 rounded"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-24 bg-white/50 rounded"></div>
                    <div className="h-2 w-20 bg-white/40 rounded"></div>
                  </div>
                </div>
                
                {/* Right bubble */}
                <div className="absolute right-0 top-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl rounded-br-sm p-4 shadow-lg animate-slide-in-right max-w-[60%]">
                  <div className="flex items-center gap-2 mb-2 justify-end">
                    <div className="h-2 w-16 bg-white/40 rounded"></div>
                    <div className="w-6 h-6 rounded-full bg-white/30"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-28 bg-white/50 rounded ml-auto"></div>
                    <div className="h-2 w-20 bg-white/40 rounded ml-auto"></div>
                  </div>
                </div>
                
                {/* Bottom bubble */}
                <div className="absolute left-8 bottom-0 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl rounded-bl-sm p-3 shadow-lg animate-slide-in-left max-w-[50%]" style={{animationDelay: '0.3s'}}>
                  <div className="space-y-1">
                    <div className="h-2 w-20 bg-white/50 rounded"></div>
                    <div className="h-2 w-16 bg-white/40 rounded"></div>
                  </div>
                </div>
                
                {/* Floating emoji/icons */}
                <div className="absolute -top-2 right-4 text-2xl animate-bounce">💬</div>
                <div className="absolute top-8 -left-2 text-xl animate-bounce" style={{animationDelay: '0.5s'}}>✨</div>
                <div className="absolute bottom-2 right-8 text-xl animate-bounce" style={{animationDelay: '1s'}}>🚀</div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-60 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full opacity-60 blur-xl"></div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-base-content">Welcome Back! 👋</h2>
          <p className="text-sm text-base-content/70 leading-relaxed">
            Select a conversation from the sidebar to start chatting, or create a new workspace to collaborate with your team.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Chat</span>
          </div>
          <div className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Collaborate</span>
          </div>
          <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Grow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;