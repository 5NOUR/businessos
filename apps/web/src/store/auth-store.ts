import { create } from "zustand";

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  currentOrgId: string | null;
  setAuth: (data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setCurrentOrgId: (orgId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  currentOrgId: localStorage.getItem("currentOrgId"),

  setAuth: (data) => {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  },

  setCurrentOrgId: (orgId) => {
    localStorage.setItem("currentOrgId", orgId);
    set({ currentOrgId: orgId });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentOrgId");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      currentOrgId: null,
    });
  },
}));
