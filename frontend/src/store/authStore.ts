import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUser = localStorage.getItem('chips_erp_user');
  const storedToken = localStorage.getItem('chips_erp_token');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    setAuth: (user, token) => {
      localStorage.setItem('chips_erp_user', JSON.stringify(user));
      localStorage.setItem('chips_erp_token', token);
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('chips_erp_user');
      localStorage.removeItem('chips_erp_token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
