import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { UNAUTHORIZED_EVENT, authApi } from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "pulsepilot-auth";

function readStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { token: null, user: null };
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth);

  const persist = (nextState) => {
    setAuthState(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  };

  const login = async (payload) => {
    const response = await authApi.login(payload);
    persist({ token: response.access_token, user: response.user });
    return response;
  };

  const signup = async (payload) => {
    const response = await authApi.signup(payload);
    persist({ token: response.access_token, user: response.user });
    return response;
  };

  const logout = () => {
    setAuthState({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    if (!authState.token) {
      return undefined;
    }

    let isCancelled = false;

    authApi
      .me(authState.token)
      .then((user) => {
        if (!isCancelled) {
          persist({ token: authState.token, user });
        }
      })
      .catch((error) => {
        if (!isCancelled && error?.status === 401) {
          logout();
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [authState.token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token),
      login,
      signup,
      logout,
    }),
    [authState.token, authState.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
