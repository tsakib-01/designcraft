'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [form, setForm]         = useState({ email: '', username: '', password: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email is required';
    if (form.username.length < 3)  errs.username = 'Username must be at least 3 characters';
    if (form.password.length < 8)  errs.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) errs.password = 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) errs.password = 'Password must contain a number';
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      await register(form);
    } catch { /* handled */ }
  };

  return (
    <div className="bg-surface-100/60 backdrop-blur-xl rounded-2xl border border-surface-400/50 p-8 shadow-2xl">
      <h1 className="text-2xl font-display font-bold text-white mb-1">Create account</h1>
      <p className="text-gray-500 text-sm mb-8">Start designing for free</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
        />
        <Input
          label="Username"
          type="text"
          placeholder="cooldesigner"
          value={form.username}
          onChange={(e) => set('username', e.target.value)}
          error={errors.username}
          leftIcon={<User className="w-4 h-4" />}
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPwd ? 'text' : 'password'}
            placeholder="Min. 8 chars with uppercase & number"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
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
          Create Free Account
        </Button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
