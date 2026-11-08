import { RateLimiterMemory } from "rate-limiter-flexible";
import { shopperError } from "../lib/shopperError";
import { verifiedInternalIdentity } from "./internalIdentity";

/**
 * Gift card codes are bearer value (NAME-NAME-NNNN), so guesses are throttled per client IP and per
 * shopper session, never per cart: a fresh cart must not reset the count.
 */
const first = (value: unknown): string => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.split(",")[0].trim().replace(/^::ffff:/, "") : "";
};

/**
 * The end user's address. The storefront server reaches GraphQL over loopback with a signed identity,
 * which stands for the real visitor. Otherwise the first x-forwarded-for hop (set by Railway's proxy),
 * then x-real-ip, then the socket.
 */
export function guessClientKey(req: any, secret = String(process.env.SESSION_SECRET || ""), now = Date.now()): string {
  const headers = req?.headers || {};
  const socket = String(req?.socket?.remoteAddress || req?.connection?.remoteAddress || "").replace(/^::ffff:/, "");
  const internal = verifiedInternalIdentity(headers, socket, secret, now);
  if (internal) return internal;
  return first(headers["x-forwarded-for"]) || first(headers["x-real-ip"]) || socket || "unknown-client";
}

export function createGiftCardGuessLimiter(points = 10, duration = 900) {
  const byClient = new RateLimiterMemory({ points, duration, blockDuration: duration, keyPrefix: "gc-ip" });
  const bySession = new RateLimiterMemory({ points, duration, blockDuration: duration, keyPrefix: "gc-session" });
  return async function consume(req: any, session?: { itemId?: string | null } | null) {
    const sessionId = session?.itemId ? String(session.itemId) : "";
    try {
      await byClient.consume(guessClientKey(req));
      if (sessionId) await bySession.consume(sessionId);
    } catch {
      throw shopperError("Too many gift card attempts. Try again in 15 minutes.", "GIFT_CARD_RATE_LIMITED");
    }
  };
}

export const consumeGiftCardGuess = createGiftCardGuessLimiter();
