import React, { useState, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { tw } from '../../../utils/tw-merge';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium text-sm text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="font-medium text-sm text-gray-700">
                Password
              </label>
              <a
                href="#"
                className="text-sm text-[var(--color-avocado-600)] hover:text-[var(--color-avocado-500)]"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center mt-2 mb-4">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[var(--color-avocado-600)] focus:ring-[var(--color-avocado-500)] border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Signing in..."
          >
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href="#"
            className="font-medium text-[var(--color-avocado-600)] hover:text-[var(--color-avocado-500)]"
          >
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
