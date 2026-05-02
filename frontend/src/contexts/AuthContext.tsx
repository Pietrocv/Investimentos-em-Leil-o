import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
type User = { id: string; name: string; email: string };
type Auth = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => void };
const AuthContext = createContext<Auth>({} as Auth);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/auth/me").then(r => setUser(r.data)).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false)); }, []);
  async function login(email: string, password: string) { const { data } = await api.post("/auth/login", { email, password }); localStorage.setItem("token", data.token); setUser(data.user); }
  async function register(name: string, email: string, password: string) { const { data } = await api.post("/auth/register", { name, email, password }); localStorage.setItem("token", data.token); setUser(data.user); }
  function logout() { localStorage.removeItem("token"); setUser(null); }
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
