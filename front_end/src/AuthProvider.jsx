import { useEffect, useMemo, useState } from "react";
import { apiRequest, getToken, saveToken } from "./api";
import { AuthContext } from "./authContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    apiRequest("/auth/me")
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => {
        saveToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(endpoint, credentials) {
    const result = await apiRequest(endpoint, {
      method: "POST",
      body: credentials,
    });
    saveToken(result.token);
    setUser(result.user);
    return result.user;
  }

  async function updateProfile(profile) {
    const result = await apiRequest("/auth/me", {
      method: "PUT",
      body: profile,
    });
    setUser(result.user);
    return result.user;
  }

  function logout() {
    saveToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    loading,
    login: (credentials) => authenticate("/auth/login", credentials),
    register: (credentials) => authenticate("/auth/register", credentials),
    updateProfile,
    logout,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
