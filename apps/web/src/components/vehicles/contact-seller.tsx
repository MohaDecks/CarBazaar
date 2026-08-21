"use client";

import { useState } from "react";
import type { Vehicle } from "@car-marketplace/types";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";

interface ContactSellerProps {
  vehicle: Vehicle;
}

export function ContactSeller({ vehicle }: ContactSellerProps) {
  const { user, accessToken } = useAuthStore();
  const [message, setMessage] = useState(
    `Hello, is this ${vehicle.title} still available?`
  );
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const sellerId =
    typeof vehicle.sellerId === "object" && vehicle.sellerId
      ? (vehicle.sellerId as { _id: string })._id
      : typeof vehicle.seller === "object" && vehicle.seller
        ? vehicle.seller._id
        : String(vehicle.sellerId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) {
      window.location.href = `/login?redirect=/cars/${vehicle.slug}`;
      return;
    }
    setStatus("sending");
    try {
      await api.sendMessage(accessToken, {
        receiverId: sellerId,
        content: message,
        vehicleId: vehicle._id,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const sellerName =
    vehicle.seller?.firstName ??
    (typeof vehicle.sellerId === "object" &&
    vehicle.sellerId &&
    "firstName" in vehicle.sellerId
      ? (vehicle.sellerId as { firstName: string }).firstName
      : "Seller");

  return (
    <section className="border border-gray-200 bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Contact Seller</h2>
      <p className="mt-1 text-sm text-gray-500">{sellerName}</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          required
        />
        <Button type="submit" className="w-full" disabled={status === "sending"}>
          {status === "sending"
            ? "Sending…"
            : status === "sent"
              ? "Message sent"
              : user
                ? "Send Message"
                : "Sign in to Message"}
        </Button>
        {status === "error" && (
          <p className="text-xs text-semantic-error">
            Could not send message. Please try again.
          </p>
        )}
      </form>
    </section>
  );
}
