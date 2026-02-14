"use client";

import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="bg-jollof-surface rounded-2xl p-8 border border-jollof-border text-center">
      <MailCheck size={48} className="text-jollof-amber mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
      <p className="text-jollof-text-muted mb-6 max-w-sm mx-auto">
        We&apos;ve sent a verification email to your inbox. Please click the link in
        the email to activate your account.
      </p>
      <p className="text-jollof-text-muted text-sm mb-6">
        Didn&apos;t receive it? Check your spam folder or try signing in — you can
        resend the verification from there.
      </p>
      <Link
        href="/login"
        className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-6 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
      >
        Go to Sign In <ArrowRight size={16} />
      </Link>
    </div>
  );
}
