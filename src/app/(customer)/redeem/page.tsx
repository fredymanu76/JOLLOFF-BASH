"use client";

import { useState } from "react";
import { TicketCheck } from "lucide-react";

export default function RedeemPage() {
  const [code, setCode] = useState("");

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <TicketCheck size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">Redeem Gift Ticket</h1>
      </div>

      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border max-w-md">
        <p className="text-jollof-text-muted mb-6">
          Enter the gift code you received to claim your ticket.
        </p>

        <form className="flex flex-col gap-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Gift Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none font-mono tracking-wider"
              placeholder="GIFT-XXXXXX"
            />
          </div>

          <button
            type="submit"
            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors"
          >
            Redeem Ticket
          </button>
        </form>
      </div>
    </div>
  );
}
