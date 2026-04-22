// Centralized auth helpers
export function logout() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("gym_id");
    localStorage.removeItem("user");
  } catch (e) {
    // ignore
  }
}

export function isAuthenticated() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    if (token === "null" || token === "undefined" || token.trim() === "") return false;
    return true;
  } catch (e) {
    return false;
  }
}
