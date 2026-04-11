"use client";

import { useState, useEffect } from "react";
import { Settings, Loader2, Check } from "lucide-react";
import type { TakeawaySettings } from "@/types";

export default function AdminTakeawaySettingsPage() {
  const [settings, setSettings] = useState<TakeawaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [deliveryFee, setDeliveryFee] = useState("3.00");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [leadTimeHours, setLeadTimeHours] = useState("2");
  const [minimumOrder, setMinimumOrder] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/takeaway/settings");
        const data = await res.json();
        const s = data.settings as TakeawaySettings;
        setSettings(s);
        setDeliveryFee((s.deliveryFeePence / 100).toFixed(2));
        setDeliveryEnabled(s.deliveryEnabled);
        setPickupEnabled(s.pickupEnabled);
        setLeadTimeHours(String(s.leadTimeHours));
        setMinimumOrder(s.minimumOrderPence ? (s.minimumOrderPence / 100).toFixed(2) : "");
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const deliveryFeePence = Math.round(parseFloat(deliveryFee) * 100);
      const minimumOrderPence = minimumOrder ? Math.round(parseFloat(minimumOrder) * 100) : undefined;

      if (isNaN(deliveryFeePence) || deliveryFeePence < 0) {
        throw new Error("Please enter a valid delivery fee");
      }

      const res = await fetch("/api/takeaway/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryFeePence,
          deliveryEnabled,
          pickupEnabled,
          leadTimeHours: parseInt(leadTimeHours) || 2,
          minimumOrderPence,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSettings(data.settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text focus:border-jollof-amber focus:outline-none";

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings size={28} className="text-jollof-amber" />
        <div>
          <h1 className="text-2xl font-bold">Delivery Settings</h1>
          <p className="text-xs text-jollof-text-muted">
            Configure next day delivery and order settings
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-600/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm inline-flex items-center gap-2">
          <Check size={16} /> Settings saved successfully
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-jollof-amber animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-jollof-surface rounded-xl p-6 border border-jollof-border space-y-6 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">
              Delivery Fee (&pound;)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-jollof-text-muted mt-1">
              Added to delivery orders. Set to 0 for free delivery.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Lead Time (hours)
            </label>
            <input
              type="number"
              min="0"
              value={leadTimeHours}
              onChange={(e) => setLeadTimeHours(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-jollof-text-muted mt-1">
              Minimum hours between ordering and delivery
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Minimum Order (&pound;, optional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={minimumOrder}
              onChange={(e) => setMinimumOrder(e.target.value)}
              className={inputClass}
              placeholder="Leave empty for no minimum"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryEnabled}
                onChange={(e) => setDeliveryEnabled(e.target.checked)}
                className="accent-jollof-amber w-4 h-4"
              />
              <div>
                <p className="font-medium text-sm">Next day delivery enabled</p>
                <p className="text-xs text-jollof-text-muted">
                  Customers can place next day delivery orders
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Save Settings
          </button>
        </form>
      )}
    </div>
  );
}
