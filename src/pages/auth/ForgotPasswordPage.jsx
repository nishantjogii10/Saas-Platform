import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-500/20 mb-3">
            <Boxes className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-slate-400 text-xs mt-1">
            Simulate password recovery email instructions
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200/80">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Enter your account email below. In this frontend demo environment, a simulated password reset link will be generated.
              </p>

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya@spicegarden.com"
                icon={Mail}
                required
              />

              <Button type="submit" variant="brand" className="w-full mt-2">
                Send Reset Link
              </Button>

              <div className="flex items-center justify-between text-xs pt-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
                >
                  <span>← Home</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset Link Sent</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                If an account exists for <span className="font-semibold text-slate-800">{email}</span>, password reset instructions have been dispatched.
              </p>
              <Link to="/login" className="inline-block mt-6">
                <Button variant="secondary" size="sm">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

