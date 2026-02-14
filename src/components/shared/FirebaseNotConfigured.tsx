"use client";

import { AlertTriangle } from "lucide-react";

export function FirebaseNotConfigured() {
  return (
    <div className="bg-jollof-amber/10 border border-jollof-amber/30 rounded-lg p-4 mb-4 text-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-jollof-amber shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-jollof-amber mb-1">
            Firebase not configured
          </p>
          <p className="text-jollof-text-muted">
            Add your Firebase credentials to{" "}
            <code className="bg-jollof-bg px-1.5 py-0.5 rounded text-xs">
              .env.local
            </code>{" "}
            to enable authentication. See{" "}
            <code className="bg-jollof-bg px-1.5 py-0.5 rounded text-xs">
              .env.local.example
            </code>{" "}
            for the required keys.
          </p>
        </div>
      </div>
    </div>
  );
}
