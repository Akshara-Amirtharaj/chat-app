import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

const RecoverAccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { recoverAccount, validateRecoveryToken } = useAuthStore();
  
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [isValidating, setIsValidating] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setIsValidating(false);
      setError('No recovery token provided');
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setIsValidating(true);
      const response = await validateRecoveryToken(token);
      setIsValid(true);
      setUserInfo(response.user);
      setError('');
    } catch (error) {
      setIsValid(false);
      setError(error.response?.data?.message || 'Invalid or expired recovery token');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRecover = async () => {
    try {
      setIsRecovering(true);
      await recoverAccount(token);
      // Redirect to login after successful recovery
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to recover account');
    } finally {
      setIsRecovering(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-base-content/70">Validating recovery token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full mx-4">
        <div className="bg-base-100 rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <button
              onClick={() => navigate('/login')}
              className="btn btn-ghost btn-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
            <h1 className="text-2xl font-bold">Account Recovery</h1>
            <p className="text-base-content/70 mt-2">
              Recover your soft-deleted account
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="alert alert-error mb-6">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Valid Token State */}
          {isValid && userInfo && (
            <div className="space-y-6">
              <div className="alert alert-success">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Account Found!</h3>
                  <p className="text-sm">
                    Account for <strong>{userInfo.fullName}</strong> ({userInfo.email}) 
                    can be recovered.
                  </p>
                </div>
              </div>

              <div className="bg-base-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Account Details:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {userInfo.fullName}</p>
                  <p><strong>Email:</strong> {userInfo.email}</p>
                  <p><strong>Deleted:</strong> {new Date(userInfo.deletedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-warning/20 border border-warning/30 rounded-lg p-4">
                <h3 className="font-semibold text-warning mb-2">Important:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Your account will be fully restored</li>
                  <li>• All your messages and data will be available</li>
                  <li>• You can log in immediately after recovery</li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>

              <button
                onClick={handleRecover}
                disabled={isRecovering}
                className="btn btn-primary w-full"
              >
                {isRecovering ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    Recovering Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Recover My Account
                  </>
                )}
              </button>
            </div>
          )}

          {/* No Token State */}
          {!token && (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Recovery Token</h2>
              <p className="text-base-content/70 mb-6">
                You need a valid recovery token to restore your account.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoverAccountPage;

