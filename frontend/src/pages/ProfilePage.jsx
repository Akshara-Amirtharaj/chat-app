import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Trash2, Download, AlertTriangle } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, isDeletingAccount, deleteAccount, exportAccountData } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMode, setDeleteMode] = useState("soft");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    await deleteAccount(deletePassword, deleteMode);
    setShowDeleteModal(false);
    setDeletePassword("");
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>

          {/* Account Management Section */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4 text-red-400">Danger Zone</h2>
            <div className="space-y-4">
              {/* Export Data */}
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-medium">Export Account Data</h3>
                    <p className="text-sm text-base-content/70">Download all your messages and account information</p>
                  </div>
                </div>
                <button 
                  onClick={exportAccountData}
                  className="btn btn-outline btn-sm"
                >
                  Export Data
                </button>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <div>
                    <h3 className="font-medium text-red-400">Delete Account</h3>
                    <p className="text-sm text-base-content/70">Permanently delete your account and all data</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-error btn-sm"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Delete Account</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-base-content/70">
                This action cannot be undone. Please confirm your password to proceed.
              </p>
              
              {/* Delete Mode Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Delete Mode:</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="deleteMode"
                      value="soft"
                      checked={deleteMode === "soft"}
                      onChange={(e) => setDeleteMode(e.target.value)}
                      className="radio radio-sm"
                    />
                    <span className="text-sm">Soft Delete (30 days grace period)</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="deleteMode"
                      value="hard"
                      checked={deleteMode === "hard"}
                      onChange={(e) => setDeleteMode(e.target.value)}
                      className="radio radio-sm"
                    />
                    <span className="text-sm">Hard Delete (immediate)</span>
                  </label>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password:</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter your password"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                  }}
                  className="btn btn-outline flex-1"
                  disabled={isDeletingAccount}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-error flex-1"
                  disabled={!deletePassword || isDeletingAccount}
                >
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfilePage;