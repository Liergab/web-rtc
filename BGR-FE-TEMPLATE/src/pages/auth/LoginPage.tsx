import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Handle success/error
      console.log('Login attempt with:', { email, password });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-center min-h-screen bg-[var(--color-vulcan-50)]">
      <div className="container-custom max-w-md">
        <div className="card p-8">
          <div className="flex-col-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-[var(--color-vulcan-500)] flex-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="heading-2">Welcome Back</h1>
            <p className="paragraph text-center">Sign in to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <div className="flex-between mb-1">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-[var(--color-vulcan-600)] hover:text-[var(--color-vulcan-500)]"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[var(--color-vulcan-600)] focus:ring-[var(--color-vulcan-500)] border-[var(--color-vulcan-300)] rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-[var(--color-vulcan-700)]"
              >
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full flex justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--color-vulcan-600)]">
              Don't have an account?{' '}
              <a
                href="#"
                className="text-[var(--color-vulcan-600)] hover:text-[var(--color-vulcan-500)]"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
