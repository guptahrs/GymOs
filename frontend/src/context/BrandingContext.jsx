import { createContext, useContext, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import API from "../api/client";
import { isAuthenticated } from "../utils/auth";

const defaultBranding = {
  branding_id: null,
  gym_name: "Gym SaaS",
  brand_name: "",
  logo_url: "",
  favicon_url: "",
  primary_color: "#3B82F6",
  accent_color: "#0F172A",
  theme_mode: "dark",
  can_customize: false,
};

const BrandingContext = createContext({
  branding: defaultBranding,
  resolvedTheme: "dark",
  refreshKey: 0,
});

function applyBranding(branding, resolvedTheme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolvedTheme);
  root.style.setProperty("--color-primary", branding.primary_color || "#3B82F6");
  if (resolvedTheme === "dark") {
    root.style.setProperty("--color-card", branding.accent_color || "#0F172A");
  } else {
    root.style.removeProperty("--color-card");
  }

  document.title = branding.brand_name || branding.gym_name || "Gym SaaS";

  let favicon = document.querySelector("link[rel='icon']");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  favicon.href = branding.favicon_url || "/favicon.svg";
}

function getResolvedTheme(themeMode) {
  if (themeMode === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return themeMode === "light" ? "light" : "dark";
}

export function BrandingProvider({ children }) {
  const gymId = localStorage.getItem("gym_id");
  const enabled = isAuthenticated() && Boolean(gymId);

  const { data } = useQuery(
    ["gym_branding", gymId],
    async () => {
      const res = await API.get("/gyms/branding/");
      return { ...defaultBranding, ...(res.data.data || {}) };
    },
    {
      enabled,
      staleTime: 5 * 60 * 1000,
    }
  );

  const branding = data || defaultBranding;
  const resolvedTheme = getResolvedTheme(branding.theme_mode);

  useEffect(() => {
    applyBranding(branding, resolvedTheme);
  }, [branding, resolvedTheme]);

  useEffect(() => {
    if (branding.theme_mode !== "system") {
      return undefined;
    }

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => applyBranding(branding, getResolvedTheme("system"));
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [branding]);

  const value = useMemo(
    () => ({
      branding,
      resolvedTheme,
    }),
    [branding, resolvedTheme]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
