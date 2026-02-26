'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const errs: Record<string, string> = {};
    if (!email)    errs.email    = 'Email is required';
    if (!password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await login({ email, password });
    } catch { /* handled in hook */ }
  };

  return (
    <div className="bg-surface-100/60 backdrop-blur-xl rounded-2xl border border-surface-400/50 p-8 shadow-2xl">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
      <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 bottom-2.5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Create one free
        </Link>
      </p>

      {/* Demo credentials hint */}
      <div className="mt-4 p-3 rounded-lg bg-surface-200/50 border border-surface-400/30">
        <p className="text-xs text-gray-500 text-center">
          Demo: <span className="font-mono text-gray-400">admin@designcraft.com</span> / <span className="font-mono text-gray-400">Admin@123456</span>
        </p>
      </div>
    </div>
  );
}
