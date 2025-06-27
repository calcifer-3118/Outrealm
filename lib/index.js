import { transitionTo } from "seamless-interdomain-transition";
import { ThirdPersonPlayer } from "./player/player";
const API_URL =
  "https://outrealm-backend-v8qoc9xl1-dheers-projects-1c99412e.vercel.app/api/state";

/**
 * Sends user state to backend and transitions to new domain.
 */
export async function createPortal(
  destinationUrl,
  userState = {},
  options = {}
) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userState),
    });

    if (!res.ok) throw new Error("Failed to store state");

    const { token } = await res.json();
    const fullUrl = `${destinationUrl}?portal=${token}`;
    transitionTo(fullUrl, options);
  } catch (err) {
    console.error("Portal transition failed:", err);
  }
}

/**
 * Fetches user state from backend using URL token.
 */
export async function receivePortalUserState() {
  const token = new URLSearchParams(window.location.search).get("portal");
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}?token=${token}`);
    if (!res.ok) throw new Error("Token invalid or expired");

    return await res.json();
  } catch (err) {
    console.warn("Failed to retrieve user state:", err);
    return null;
  }
}

export { ThirdPersonPlayer };
