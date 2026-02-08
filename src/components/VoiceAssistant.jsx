import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Assistant vocal (front-only):
 * - Lit la page (ou une zone #main) via SpeechSynthesis
 * - Écoute commandes simples via SpeechRecognition (Chrome/Edge)
 * WCAG: boutons, aria, focus.
 */

function getPageText() {
  const main = document.querySelector("#main");
  const root = main || document.body;

  // Supprimer nav/footer et éléments non utiles si root = body
  const cloned = root.cloneNode(true);

  // Retire scripts/styles
  cloned.querySelectorAll("script, style, noscript").forEach((n) => n.remove());

  // Retire éléments cachés
  cloned.querySelectorAll("[aria-hidden='true'], [hidden]").forEach((n) => n.remove());

  // Retire nav/footer si on lit body
  if (!main) {
    cloned.querySelectorAll("nav, header, footer").forEach((n) => n.remove());
  }

  // Récupère texte visible
  const text = cloned.innerText || "";
  // Nettoyage
  return text.replace(/\s+/g, " ").trim();
}

export default function VoiceAssistant({ lang = "fr" }) {
  const [supportedTTS, setSupportedTTS] = useState(false);
  const [supportedASR, setSupportedASR] = useState(false);

  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);

  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const recognitionRef = useRef(null);
  const utterRef = useRef(null);

  // Best effort: choisir une voix correspondant à la langue
  const voice = useMemo(() => {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    // fr / ar
    const want = lang === "ar" ? ["ar", "ar-TN", "ar-SA"] : ["fr", "fr-FR"];
    return (
      voices.find((v) => want.some((w) => (v.lang || "").toLowerCase().startsWith(w))) ||
      voices.find((v) => (v.lang || "").toLowerCase().startsWith(lang)) ||
      voices[0] ||
      null
    );
  }, [lang]);

  useEffect(() => {
    setSupportedTTS(!!window.speechSynthesis && typeof SpeechSynthesisUtterance !== "undefined");

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupportedASR(!!SR);

    if (SR) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang === "ar" ? "ar-TN" : "fr-FR";

      rec.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const cmd = transcript.trim().toLowerCase();

        // Commandes simples (tu peux enrichir)
        if (cmd.includes("lire") || cmd.includes("read")) speakPage();
        if (cmd.includes("stop") || cmd.includes("arrête") || cmd.includes("pause")) stopSpeak();
        if (cmd.includes("plus vite")) setRate((r) => Math.min(1.3, r + 0.1));
        if (cmd.includes("moins vite")) setRate((r) => Math.max(0.8, r - 0.1));
        if (cmd.includes("mode accessibilité") || cmd.includes("a11y")) {
          document.documentElement.classList.toggle("a11y");
        }
      };

      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);

      recognitionRef.current = rec;
    }

    // iOS/Safari: les voix arrivent parfois async
    if (window.speechSynthesis?.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }

    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {}
      window.speechSynthesis?.cancel?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function speakPage() {
    if (!supportedTTS) return;
    stopSpeak();

    const text = getPageText();
    if (!text) return;

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ar" ? "ar-TN" : "fr-FR";
    u.rate = rate;
    u.pitch = pitch;
    u.volume = volume;
    if (voice) u.voice = voice;

    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);

    utterRef.current = u;
    window.speechSynthesis.speak(u);
  }

  function pauseSpeak() {
    if (!supportedTTS) return;
    if (window.speechSynthesis.speaking) window.speechSynthesis.pause();
  }

  function resumeSpeak() {
    if (!supportedTTS) return;
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
  }

  function stopSpeak() {
    if (!supportedTTS) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function toggleListening() {
    if (!supportedASR) return;

    if (!listening) {
      try {
        recognitionRef.current.lang = lang === "ar" ? "ar-TN" : "fr-FR";
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch {}
      setListening(false);
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">Assistant sonore</div>

        <div className="flex gap-2 flex-wrap">
          <button
            className="px-3 py-2 rounded-xl border font-semibold"
            onClick={speakPage}
            disabled={!supportedTTS}
            aria-disabled={!supportedTTS}
          >
            🔊 Lire la page
          </button>

          <button
            className="px-3 py-2 rounded-xl border"
            onClick={pauseSpeak}
            disabled={!supportedTTS}
          >
            ⏸ Pause
          </button>

          <button
            className="px-3 py-2 rounded-xl border"
            onClick={resumeSpeak}
            disabled={!supportedTTS}
          >
            ▶️ Reprendre
          </button>

          <button
            className="px-3 py-2 rounded-xl border"
            onClick={stopSpeak}
            disabled={!supportedTTS}
          >
            ⏹ Stop
          </button>

          <button
            className="px-3 py-2 rounded-xl border font-semibold"
            onClick={toggleListening}
            disabled={!supportedASR}
            aria-pressed={listening}
            title={!supportedASR ? "SpeechRecognition surtout Chrome/Edge" : "Commandes vocales"}
          >
            {listening ? "🎙️ Écoute ON" : "🎙️ Écouter"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="text-sm">
          Vitesse ({rate.toFixed(1)})
          <input
            className="w-full"
            type="range"
            min="0.8"
            max="1.3"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </label>

        <label className="text-sm">
          Ton ({pitch.toFixed(1)})
          <input
            className="w-full"
            type="range"
            min="0.8"
            max="1.2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
          />
        </label>

        <label className="text-sm">
          Volume ({volume.toFixed(1)})
          <input
            className="w-full"
            type="range"
            min="0.2"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="text-xs opacity-70">
        Commandes (si écoute dispo): “lire”, “stop”, “plus vite”, “moins vite”, “mode accessibilité”.
        {!supportedTTS ? " (TTS non supporté sur ce navigateur)" : ""}
        {!supportedASR ? " (Écoute: plutôt Chrome/Edge)" : ""}
      </div>

      {speaking ? <div className="text-sm">🔊 Lecture en cours…</div> : null}
    </div>
  );
}
