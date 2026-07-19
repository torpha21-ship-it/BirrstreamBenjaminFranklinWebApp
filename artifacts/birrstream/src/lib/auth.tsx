import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { setAuthTokenGetter, useGetMe, getGetMeQueryKey, User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  if (import.meta.env.DEV) {
    const params = new URLSearchParams(window.location.search);
    const devToken = params.get("devtoken");
    if (devToken) localStorage.setItem("token", devToken);
  }
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("token"));
  }, []);

  const { data: me, isLoading: isMeLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (me) {
      setUser(me);
    }
    if (error) {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
    }
  }, [me, error]);

  const loginFn = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logoutFn = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login: loginFn, logout: logoutFn, isLoading: isMeLoading && !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}