"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FirebaseNotConfigured } from "@/components/shared/FirebaseNotConfigured";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, configured } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/my-bookings");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-jollof-surface rounded-2xl p-8 border border-jollof-border">
      <div className="text-center mb-6">
        <LogIn size={32} className="text-jollof-amber mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-jollof-text-muted text-sm mt-1">
          Sign in to manage your bookings
        </p>
      </div>

      {!configured && <FirebaseNotConfigured />}

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-jollof-text-muted">
        <Link
          href="/reset-password"
          className="text-jollof-amber hover:text-jollof-amber-light"
        >
          Forgot password?
        </Link>
        <p className="mt-2">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-jollof-amber hover:text-jollof-amber-light"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
