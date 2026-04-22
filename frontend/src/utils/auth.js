// Utility to clear auth info on logout
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("gym_id");
}
