import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Mail,
  Lock,
  Building,
  User,
  ArrowRight,
  Loader2,
  LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthInputProps {
  icon: LucideIcon;
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}

const AuthInput = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  required = true,
}: AuthInputProps) => (
  <div className="relative group">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
    <input
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all hover:bg-zinc-100/50"
    />
  </div>
);

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              company_name: formData.companyName,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSuccess('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-200"
          >
            <MessageSquare size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold text-zinc-900">WholesaleAI</h1>
          <p className="text-zinc-500 mt-2">The intelligent CRM for manufacturers</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-8">
          <div className="flex gap-4 mb-8 p-1 bg-zinc-100 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                isLogin ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isLogin ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <AuthInput
                    icon={User}
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={updateField('fullName')}
                  />
                  <AuthInput
                    icon={Building}
                    type="text"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={updateField('companyName')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AuthInput
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={updateField('email')}
            />

            <AuthInput
              icon={Lock}
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={updateField('password')}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl"
              >
                {success}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
