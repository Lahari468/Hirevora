import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../services/authService.js";
import type { ApiResponse, LoginPayload, RegisterPayload, User } from "../types/index.js";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = "accessToken";

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "success" in value;
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, if a token is already stored, hydrate the session by
  // asking the backend who the current user is.
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const res = await authService.login(payload);
    if (!res.success || !res.data) {
      throw isApiResponse(res) ? res : new Error("Login failed");
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    const res = await authService.register(payload);
    if (!res.success || !res.data) {
      throw isApiResponse(res) ? res : new Error("Registration failed");
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
