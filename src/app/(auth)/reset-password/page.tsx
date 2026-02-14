"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-jollof-surface rounded-2xl p-8 border border-jollof-border text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-jollof-text-muted mb-6">
          We&apos;ve sent a password reset link to{" "}
          <span className="text-jollof-text font-medium">{email}</span>
        </p>
        <Link
          href="/login"
          className="text-jollof-amber hover:text-jollof-amber-light inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-jollof-surface rounded-2xl p-8 border border-jollof-border">
      <div className="text-center mb-6">
        <KeyRound size={32} className="text-jollof-amber mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-jollof-text-muted text-sm mt-1">
          Enter your email to receive a reset link
        </p>
      </div>

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-jollof-amber hover:text-jollof-amber-light text-sm inline-flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
