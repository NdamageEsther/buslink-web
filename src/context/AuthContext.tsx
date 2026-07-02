import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { LoginCredentials, RegisterData, User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('buslink_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('buslink_token');
    const savedUser = localStorage.getItem('buslink_user');
    if (token && savedUser) {
      setState({ user: JSON.parse(savedUser), token, isAuthenticated: true, isLoading: false });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  async function login(credentials: LoginCredentials): Promise<User> {
    const { token, user } = await authService.login(credentials);
    localStorage.setItem('buslink_token', token);
    localStorage.setItem('buslink_user', JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
    return user;
  }

  async function register(data: RegisterData): Promise<User> {
    const { token, user } = await authService.register(data);
    localStorage.setItem('buslink_token', token);
    localStorage.setItem('buslink_user', JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
    return user;
  }

  function logout() {
    localStorage.removeItem('buslink_token');
    localStorage.removeItem('buslink_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}