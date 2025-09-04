import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { login, resetPassword, onAuthStateChanged } from '../firebase/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setIsResetPassword(false);
      setResetSent(false);
    }
  }, [isOpen]);

  // Handle successful login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user: User | null) => {
      if (user && isOpen) {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');
        onClose();
        navigate(redirectTo);
      }
    });
    return () => unsubscribe();
  }, [isOpen, navigate, onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await login(email, password);
    
    if (error) {
      let errorMessage = 'Invalid credentials. Please try again.';
      
      if (error.includes('user-not-found') || error.includes('wrong-password')) {
        errorMessage = 'Invalid email or password.';
      } else if (error.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
      } else if (error.includes('user-disabled')) {
        errorMessage = 'This account has been disabled. Please contact support.';
      }
      
      setError(errorMessage);
      console.error('Login error:', error);
    }
    
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setIsLoading(true);

    const { success, error } = await resetPassword(email);
    
    if (success) {
      setResetSent(true);
    } else {
      setError('Failed to send reset email. Please try again.');
      console.error('Password reset error:', error);
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isResetPassword ? 'Reset Password' : 'Admin Login'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {resetSent ? (
            <div className="text-center py-6">
              <div className="text-green-600 mb-4">
                Password reset link sent to your email.
              </div>
              <button
                onClick={() => {
                  setResetSent(false);
                  setIsResetPassword(false);
                  setError('');
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={isResetPassword ? handleResetPassword : handleLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                {!isResetPassword && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : isResetPassword ? (
                      'Send Reset Link'
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPassword(!isResetPassword);
                      setError('');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    disabled={isLoading}
                  >
                    {isResetPassword ? 'Back to Login' : 'Forgot Password?'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
