import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      className="px-3 py-2 rounded-xl border"
      onClick={() => setDark(v => !v)}
      aria-label="Basculer thème"
      title="Thème"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
