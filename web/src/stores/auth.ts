import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/types";

type AuthState = {
  token: string | null;
  locale: Locale;
  setToken: (token: string | null) => void;
  setLocale: (locale: Locale) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      locale: "en",
      setToken: (token) => set({ token }),
      setLocale: (locale) => set({ locale }),
    }),
    { name: "share-party-auth" },
  ),
);

export const APP_HOME = "/parties";
