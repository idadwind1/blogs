import { useEffect, useState } from "react";

export default function CCBadge() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);

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
    <a
      href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
      title="Except where otherwise noted, content on this site is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International"
      style={{ opacity: theme ? 1 : 0 }}
    >
      <img src={theme === "light" ? "/by-nc-sa-catppuccin-latte-pink.svg" : "/by-nc-sa-catppuccin-frappe-pink.svg"} />
    </a>
  );
}
