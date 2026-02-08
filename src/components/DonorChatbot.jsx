import { useEffect, useRef, useState } from "react";
import { apiPost } from "../api/client";

// Réponses offline stables pour démo (quand backend down)
function offlineAnswer(text) {
  const q = (text || "").toLowerCase();

  if (q.includes("urgent")) {
    return "Les cas urgents sont marqués URGENT / TRES_URGENT. Va sur Catalogue → filtre Urgence, ou dis-moi : “Ariana urgent médical” pour 3 recommandations.";
  }
  if (q.includes("cha9a9a") || q.includes("donner") || q.includes("don")) {
    return "Pour donner via Cha9a9a : ouvre un cas → clique “Soutenir maintenant” → Cha9a9a → valide. Tu peux aussi partager le lien du cas.";
  }
  if (q.includes("vérifier") || q.includes("verifier")) {
    return "Un cas est vérifié via documents + contact + cohérence des infos. L’admin peut demander plus d’infos avant d’approuver.";
  }
  if (q.includes("bénévole") || q.includes("benevole")) {
    return "Pour devenir bénévole : ouvre la page Association → inscris-toi → choisis ta zone (ex: Ariana) + disponibilité. L’équipe te contacte.";
  }
  if (q.includes("stat")) {
    return "Je peux afficher : total cas, urgents, approuvés, et tendances. (En mode démo, ces stats viennent de données simulées.)";
  }
  if (q.includes("ariana") || q.includes("universelle")) {
    return "Universelle Ariana : association humanitaire locale/régionale. Elle centralise des cas sociaux urgents et facilite le don transparent via Cha9a9a.";
  }
  return "Je peux aider : urgences, comment donner, bénévolat, vérification, Ariana. Essaie : “Quels cas sont urgents ?”";
}

/**
 * Chatbot SoliCare – conseiller donateur
 * - appelle /api/ai/chat si disponible
 * - fallback offline si backend indisponible (zéro “Failed to fetch” devant jury)
 */
export default function DonorChatbot() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Salam / Bonjour ! Je suis l’assistant SoliCare. Posez vos questions (don, urgences, bénévolat, vérification…).",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text) {
    const t = (text ?? input).trim();
    if (!t || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: t }]);
    setLoading(true);

    try {
      // ✅ backend AI
      const r = await apiPost("/api/ai/chat", { message: t });
      const answer = r?.answer || r?.data?.answer;

      if (!answer) throw new Error("Réponse AI vide");
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch (e) {
      // ✅ fallback offline
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Serveur AI indisponible. Mode démo activé ✅" },
        { role: "assistant", text: offlineAnswer(t) },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const quick = [
    "Quels cas sont urgents ?",
    "Comment donner via Cha9a9a ?",
    "Comment vérifier un cas ?",
    "Comment devenir bénévole ?",
    "Infos sur Universelle Ariana",
    "Donne des statistiques",
  ];

  return (
    <div className="rounded-3xl border bg-white dark:bg-slate-950 dark:border-slate-800 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between gap-3 p-4 border-b dark:border-slate-800">
        <div>
          <div className="font-semibold">💬 Chatbot SoliCare</div>
          <div className="text-xs text-slate-500">Conseiller donateur • réponses instantanées</div>
        </div>
        <button
          className="rounded-xl border px-3 py-2 text-sm dark:border-slate-800"
          onClick={() => setOpen((x) => !x)}
          type="button"
        >
          {open ? "Réduire" : "Ouvrir"}
        </button>
      </div>

      {open ? (
        <>
          <div className="h-72 overflow-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm " +
                    (m.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-50")
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-4 border-t dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap gap-2">
              {quick.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border px-3 py-1 text-xs dark:border-slate-800"
                  disabled={loading}
                  type="button"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                placeholder="Écrivez votre question…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <button
                onClick={() => send()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                disabled={loading}
                type="button"
              >
                {loading ? "..." : "Envoyer"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
