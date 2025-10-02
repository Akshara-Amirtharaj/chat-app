
import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import RecoverAccountPage from "./pages/RecoverAccountPage";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";
import ChannelPage from "./pages/ChannelPage";
import BoardPage from "./pages/BoardPage";
import InvitesPage from "./pages/InvitesPage";
import ChallengesPage from "./pages/ChallengesPage";
import ChallengeDetailPage from "./pages/ChallengeDetailPage";
import FinancePage from "./pages/FinancePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Apply theme to document element on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/recover-account" element={<RecoverAccountPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/workspaces" element={authUser ? <WorkspaceDashboard /> : <Navigate to="/login" />} />
        <Route path="/workspaces/:id/channels/:channelId" element={authUser ? <ChannelPage /> : <Navigate to="/login" />} />
        <Route path="/workspaces/:id/board" element={authUser ? <BoardPage /> : <Navigate to="/login" />} />
        <Route path="/invites" element={authUser ? <InvitesPage /> : <Navigate to="/login" />} />
        <Route path="/challenges" element={authUser ? <ChallengesPage /> : <Navigate to="/login" />} />
        <Route path="/workspaces/:id/challenges" element={authUser ? <ChallengesPage /> : <Navigate to="/login" />} />
        <Route path="/challenges/:challengeId" element={authUser ? <ChallengeDetailPage /> : <Navigate to="/login" />} />
        <Route path="/workspaces/:id/finance" element={authUser ? <FinancePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </>
  );
};
export default App;

