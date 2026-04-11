"use client";

import { useState } from "react";
import { UserPlus, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface PostPaymentRegisterProps {
  guestName?: string;
  guestEmail?: string;
  orderId: string;
  orderType: "booking" | "takeaway" | "gift";
}

export function PostPaymentRegister({
  guestName,
  guestEmail,
  orderId,
  orderType,
}: PostPaymentRegisterProps) {
  const { user, signUp } = useAuth();

  const [name, setName] = useState(guestName || "");
  const [email, setEmail] = useState(guestEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Already logged in or dismissed
  if (user || dismissed || success) {
    if (success) {
      return (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-sm">Account created!</p>
          <p className="text-xs text-jollof-text-muted mt-1">
            Your order has been linked to your new account.
          </p>
        </div>
      );
    }
    return null;
  }

  async function handleRegister() {
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setCreating(true);
    try {
      const firebaseUser = await signUp(email, password, name);

      // Link the order to the new account
      await fetch("/api/link-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderType,
          userId: firebaseUser.uid,
          userEmail: email,
        }),
      });

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else {
        setError(message);
      }
      setCreating(false);
    }
  }

  const emailInUse = error.includes("already exists");

  return (
    <div className="bg-jollof-bg rounded-xl p-5 border border-jollof-amber/30">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus size={18} className="text-jollof-amber" />
        <p className="font-semibold text-sm">Save your details for next time?</p>
      </div>
      <p className="text-xs text-jollof-text-muted mb-4">
        Create an account to view your orders and book faster next time.
      </p>

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-3 text-xs">
          {error}
          {emailInUse && (
            <Link
              href={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
              className="block mt-1 text-jollof-amber underline"
            >
              Sign in to link this order
            </Link>
          )}
        </div>
      )}

      <div className="space-y-3 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full bg-jollof-surface border border-jollof-border rounded-lg px-4 py-2.5 text-sm text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full bg-jollof-surface border border-jollof-border rounded-lg px-4 py-2.5 text-sm text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create password (min 6 characters)"
          className="w-full bg-jollof-surface border border-jollof-border rounded-lg px-4 py-2.5 text-sm text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="w-full bg-jollof-surface border border-jollof-border rounded-lg px-4 py-2.5 text-sm text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-jollof-text-muted hover:text-jollof-text transition-colors"
        >
          No thanks
        </button>
        <button
          onClick={handleRegister}
          disabled={creating}
          className="flex-1 bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {creating ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Creating...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </div>
  );
}
