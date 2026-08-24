import { useEffect, useRef, useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { playPronunciation, isSpeechSupported } from "@/lib/audio";
import { cn } from "@/lib/utils";

/**
 * Audio button with visual feedback while playing.
 * `text` is the Hanzi to pronounce. `audioUrl` (optional) will be preferred
 * over TTS once real recordings are added.
 */
export const AudioButton = ({ text, audioUrl, label, testId }) => {
  const [state, setState] = useState("idle"); // idle | loading | playing
  const stopRef = useRef(null);

  // Stop any playback when the button unmounts (e.g., navigation).
  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current();
    };
  }, []);

  const handleClick = async () => {
    if (state === "playing") {
      if (stopRef.current) stopRef.current();
      setState("idle");
      return;
    }

    if (!audioUrl && !isSpeechSupported()) {
      toast.error("Audio tidak tersedia di perangkat ini", {
        description: "Peramban Anda tidak mendukung sintesis suara.",
      });
      return;
    }

    setState("loading");
    const controller = await playPronunciation({
      text,
      audioUrl,
      onStart: () => setState("playing"),
      onEnd: () => setState("idle"),
      onError: (err) => {
        setState("idle");
        if (err.message === "no-mandarin-voice") {
          toast.error("Audio tidak tersedia di perangkat ini", {
            description:
              "Suara Mandarin (zh-CN) belum terpasang. Coba peramban lain seperti Chrome atau Edge.",
          });
        } else if (err.message === "speech-not-supported") {
          toast.error("Audio tidak tersedia di perangkat ini", {
            description: "Peramban Anda tidak mendukung sintesis suara.",
          });
        } else {
          toast.error("Gagal memutar audio", {
            description: "Silakan coba lagi.",
          });
        }
      },
    });
    stopRef.current = controller.stop;
  };

  const isPlaying = state === "playing";
  const isLoading = state === "loading";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label || `Putar pelafalan ${text}`}
      aria-pressed={isPlaying}
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border transition-all duration-300",
        "px-4 py-2 text-sm font-body font-medium select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6B53]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFBF7]",
        isPlaying
          ? "bg-[#C87964] text-white border-[#C87964] shadow-[0_0_0_6px_rgba(200,121,100,0.15)]"
          : "bg-[#A3B19B]/10 text-[#4A6B53] border-[#A3B19B]/30 hover:bg-[#4A6B53] hover:text-white hover:border-[#4A6B53]"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Volume2
          className={cn("h-4 w-4", isPlaying && "animate-pulse")}
          aria-hidden="true"
        />
      )}
      <span>{isPlaying ? "Memutar…" : "Audio"}</span>
    </button>
  );
};

export default AudioButton;
