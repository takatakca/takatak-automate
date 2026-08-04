import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, MicOff, Search } from "lucide-react";
import { resolveIntent, searchSuggestions, trackEvent, type IntentMatch } from "@/lib/serviceIntent";
import { GuidedAssistantPanel } from "./GuidedAssistantPanel";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => SpeechRecognitionLike) | null;
}

export function AiServiceSearch() {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [result, setResult] = useState<{ query: string; match: IntentMatch } | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setVoiceSupported(Boolean(getRecognitionCtor()));
    return () => recognitionRef.current?.stop();
  }, []);

  function go(value: string) {
    const text = value.trim();
    if (!text) return;
    const match = resolveIntent(text);
    trackEvent("home_ai_search", { query: text, intent: match.intent, destination: match.to });
    setHint(null);
    setResult({ query: text, match });
  }

  function toggleVoice() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new Ctor();
    recognitionRef.current = recognition;
    recognition.lang = "en-CA";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      setQuery(transcript);
      trackEvent("home_voice_search", { transcript });
      go(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      setHint("Voice input didn't work — type your request instead.");
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
    setHint("Listening…");
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(query);
        }}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card/90 p-2 shadow-[var(--shadow-card)] backdrop-blur"
      >
        <Search size={18} className="ml-2 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need? e.g. restaurant website, hosting, more leads"
          aria-label="Describe what you need"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors ${
              listening
                ? "border-primary/60 bg-primary/15 text-primary animate-pulse"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          Go <ArrowRight size={15} />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {searchSuggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => {
              setQuery(s.query);
              go(s.query);
            }}
            className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {s.label}
          </button>
        ))}
      </div>

      {hint && <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">{hint}</p>}
    </div>
  );
}
