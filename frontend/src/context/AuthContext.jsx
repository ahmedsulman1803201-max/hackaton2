import { useEffect, useState } from "react";
import { AuthContext } from "./authContextBase";
import { getSessionUser, setSessionUser } from "../services/storage";
import api, { getApiError } from "../services/api";


const toSafeUser = (user) => {
  const { password, ...safe } = user;
  void password;
  return safe;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = getSessionUser();
    return storedUser?.token ? storedUser : null;
  });
  const [initialToken] = useState(() => getSessionUser()?.token || "");

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const safe = { ...toSafeUser(data.data.user), token: data.data.token };
      setSessionUser(safe);
      setUser(safe);
      return safe;
    } catch (error) {
      throw new Error(getApiError(error, "Invalid email or password."), { cause: error });
    }
  };

  const signup = async ({ name, email, password }) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      const safe = { ...toSafeUser(data.data.user), token: data.data.token };
      setSessionUser(safe);
      setUser(safe);
      return safe;
    } catch (error) {
      throw new Error(getApiError(error, "Unable to create your account."), { cause: error });
    }
  };

  const logout = () => {
    setSessionUser(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { data } = await api.put("/auth/me", updates);
    const updated = { ...toSafeUser(data.data.user), token: user.token };
    setSessionUser(updated);
    setUser(updated);
    return updated;
  };

  const refreshUser = async () => {
    if (!user?.token) return null;
    try {
      const { data } = await api.get("/auth/me");
      const safe = { ...toSafeUser(data.data.user), token: user.token };
      setSessionUser(safe);
      setUser(safe);
      return safe;
    } catch {
      logout();
      return null;
    }
  };

  useEffect(() => {
    if (!initialToken) {
      if (getSessionUser()) setSessionUser(null);
      return;
    }
    queueMicrotask(async () => {
      try {
        const { data } = await api.get("/auth/me", { headers: { Authorization: `Bearer ${initialToken}` } });
        const safe = { ...toSafeUser(data.data.user), token: initialToken };
        setSessionUser(safe);
        setUser(safe);
      } catch {
        setSessionUser(null);
        setUser(null);
      }
    });
  }, [initialToken]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
