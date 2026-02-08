import { useEffect, useState } from "react";

export default function AccessibilityToggle() {
  const [on, setOn] = useState(() => localStorage.getItem("a11y") === "1");

  useEffect(() => {
    localStorage.setItem("a11y", on ? "1" : "0");
    document.documentElement.classList.toggle("a11y", on);
  }, [on]);

  return (
    <button
      className="px-3 py-2 rounded-xl border font-semibold"
      onClick={() => setOn(v => !v)}
      aria-pressed={on}
      aria-label="Mode accessibilité"
      title="A11y"
    >
      A11y
    </button>
  );
}
