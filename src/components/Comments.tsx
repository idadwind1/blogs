import Giscus, { type Theme } from "@giscus/react";
import { GISCUS } from "@/constants";
import { useEffect, useState } from "react";

export default function Comments({
  lightTheme = "catppuccin_latte",
  darkTheme = "catppuccin_frappe",
}: { lightTheme?: Theme; darkTheme?: Theme }) {
  const [theme, setTheme] = useState<string>(() => {
    const stored = localStorage.getItem("theme");
    return stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = ({ matches }: MediaQueryListEvent) => {
      setTheme(matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const themeBtn = document.querySelector("#theme-btn");
    const handler = () => {
      setTheme(prev => prev === "dark" ? "light" : "dark");
    };
    themeBtn?.addEventListener("click", handler);
    return () => themeBtn?.removeEventListener("click", handler);
  }, []);

  return (
    <div className="mt-8">
      <Giscus theme={theme === "light" ? lightTheme : darkTheme} {...GISCUS} />
    </div>
  );
}
