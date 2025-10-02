import { MessageSquare, Users, Zap, Heart, Star, Sparkles } from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  const icons = [MessageSquare, Users, Zap, Heart, Star, Sparkles, MessageSquare, Users, Zap];
  const colors = [
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
    "from-indigo-400 to-indigo-600",
    "from-blue-400 to-blue-600",
    "from-purple-500 to-pink-500",
    "from-indigo-500 to-purple-500",
    "from-pink-500 to-purple-500",
    "from-blue-500 to-indigo-500",
    "from-purple-600 to-indigo-600",
  ];

  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 p-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>

      <div className="max-w-md text-center relative z-10">
        {/* Icon Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[...Array(9)].map((_, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className="aspect-square rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:scale-105 hover:bg-white/20 transition-all duration-300 cursor-pointer group animate-scale-in"
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <div className={`p-2 rounded-md bg-gradient-to-br ${colors[i]} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Text Content */}
        <div className="space-y-2 animate-slide-in-right">
          <h2 className="text-2xl font-black text-white drop-shadow-lg">
            {title}
          </h2>
          <p className="text-white/90 text-sm leading-relaxed drop-shadow">
            {subtitle}
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 pt-3">
            <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-white" />
              <span className="text-xs font-medium text-white">Real-time Chat</span>
            </div>
            <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-white" />
              <span className="text-xs font-medium text-white">Team Collaboration</span>
            </div>
            <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-white" />
              <span className="text-xs font-medium text-white">Lightning Fast</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;