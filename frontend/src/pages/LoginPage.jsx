import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, RotateCcw } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isRequestingRecovery, setIsRequestingRecovery] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn, requestAccountRecovery } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  const handleRecoveryRequest = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    
    setIsRequestingRecovery(true);
    try {
      await requestAccountRecovery(recoveryEmail);
      setShowRecoveryForm(false);
      setRecoveryEmail("");
    } catch (error) {
    } finally {
      setIsRequestingRecovery(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
      
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6 bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/60 animate-scale-in" style={{boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)'}}>
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-4 rounded-2xl shadow-xl">
                  <MessageSquare className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                CollabWell
              </h1>
              <div>
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-base-content/60 text-sm">Sign in to your account</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
            
            {/* Account Recovery Section */}
            <div className="mt-6 pt-6 border-t border-base-300">
              <p className="text-sm text-base-content/60 mb-3">
                Can't access your account?
              </p>
              
              {!showRecoveryForm ? (
                <button
                  onClick={() => setShowRecoveryForm(true)}
                  className="btn btn-outline btn-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Recover Account
                </button>
              ) : (
                <div className="space-y-3">
                  <form onSubmit={handleRecoveryRequest} className="space-y-3">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-sm">Email Address</span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered input-sm"
                        placeholder="Enter your email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm flex-1"
                        disabled={isRequestingRecovery}
                      >
                        {isRequestingRecovery ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Recovery Link"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRecoveryForm(false);
                          setRecoveryEmail("");
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                  
                  <div className="text-xs text-base-content/50">
                    <p>• For soft-deleted accounts only</p>
                    <p>• Recovery link expires in 24 hours</p>
                    <p>• Check your email for the recovery link</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={"Sign in to continue your conversations and catch up with your messages."}
      />
    </div>
  );
};
export default LoginPage;