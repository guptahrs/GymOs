// Centralized auth helpers
function decodeTokenPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;

    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token || token === "null" || token === "undefined") return true;

  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) return true;

  return Date.now() >= payload.exp * 1000;
}

export function logout() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("gym_id");
    localStorage.removeItem("user");
  } catch (e) {
    console.error("Error during logout:", e);
    // ignore
  }
}

export function isAuthenticated() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    if (token.trim() === "") return false;
    return !isTokenExpired(token);
  } catch (e) {
    return false;
  }
}
