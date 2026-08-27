// Authentication session persistence only. MongoDB-backed application data is
// always retrieved through API services and is never seeded in the browser.
const SESSION_KEY = "impacthub_user";

export const getSessionUser = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
};

export const setSessionUser = (user) => {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
};
