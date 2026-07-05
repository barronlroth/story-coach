"use client";

import { AlertCircle, Keyboard, LoaderCircle, Mic, Square } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { NudgeBubbles } from "@/components/NudgeBubbles";

export type VoiceRecorderStatus = "idle" | "recording" | "processing" | "error";

export type VoiceTranscriptMetadata = {
  provider?: string;
  source?: string;
  isMock?: boolean;
  warnings?: string[];
};

export type VoiceRecorderProps = {
  onTranscript: (transcript: string, metadata?: VoiceTranscriptMetadata) => void;
  prompt?: string;
  nudges?: string[];
  disabled?: boolean;
  className?: string;
  transcribeUrl?: string;
  allowMockTranscript?: boolean;
  initialTypedText?: string;
  typedFallbackLabel?: string;
  onError?: (message: string) => void;
};

type TranscribeResponse =
  | {
      ok: true;
      transcript: string;
      provider: string;
      source: string;
      isMock?: boolean;
      warnings?: string[];
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        hint?: string;
      };
    };

const PREFERRED_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

function pickAudioMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return undefined;
  }

  return PREFERRED_MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

function extensionForMimeType(mimeType: string) {
  if (mimeType.includes("mp4")) {
    return "m4a";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  return "webm";
}

function canUseMediaRecorder() {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}

export function VoiceRecorder({
  onTranscript,
  prompt = "Tell me about your drawing",
  nudges = [],
  disabled = false,
  className = "",
  transcribeUrl = "/api/transcribe",
  allowMockTranscript = false,
  initialTypedText = "",
  typedFallbackLabel = "Type it instead",
  onError,
}: VoiceRecorderProps) {
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const [typedText, setTypedText] = useState(initialTypedText);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeNudge, setActiveNudge] = useState<string>();
  const [recorderAvailable, setRecorderAvailable] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const typedFallbackId = useId();

  useEffect(() => {
    setRecorderAvailable(canUseMediaRecorder());
  }, []);

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.onstop = null;

        if (recorderRef.current.state === "recording") {
          recorderRef.current.stop();
        }
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const setError = (message: string) => {
    setErrorMessage(message);
    setStatus("error");
    onError?.(message);
  };

  const resetError = () => {
    if (status === "error") {
      setStatus("idle");
    }
    setErrorMessage("");
  };

  const handleTranscribeResponse = async (response: Response) => {
    let payload: TranscribeResponse;

    try {
      payload = (await response.json()) as TranscribeResponse;
    } catch {
      throw new Error("Story Coach could not read the transcript response.");
    }

    if (!response.ok || !payload.ok) {
      const message = payload.ok ? "Story Coach could not make a transcript." : payload.error.message;
      throw new Error(message);
    }

    const transcript = payload.transcript.trim();

    if (transcript.length === 0) {
      throw new Error("Story Coach heard silence. Try again or type the words.");
    }

    onTranscript(transcript, {
      provider: payload.provider,
      source: payload.source,
      isMock: payload.isMock,
      warnings: payload.warnings,
    });
    setStatus("idle");
    setErrorMessage("");
  };

  const submitFormData = async (formData: FormData) => {
    if (allowMockTranscript) {
      formData.set("mock", "true");
    }

    setStatus("processing");

    try {
      const response = await fetch(transcribeUrl, {
        method: "POST",
        body: formData,
      });
      await handleTranscribeResponse(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Story Coach could not make a transcript.");
    }
  };

  const submitAudio = async (blob: Blob) => {
    if (blob.size === 0) {
      setError("Story Coach did not catch any sound. Try again or type the words.");
      return;
    }

    const formData = new FormData();
    const mimeType = blob.type || "audio/webm";
    const extension = extensionForMimeType(mimeType);
    formData.append("audio", blob, `story-coach-audio.${extension}`);
    await submitFormData(formData);
  };

  const startRecording = async () => {
    if (disabled || status === "recording" || status === "processing") {
      return;
    }

    resetError();

    if (!recorderAvailable) {
      setError("This browser cannot record audio here. Type the words instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setError("Story Coach could not keep recording. Try again or type the words.");
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        void submitAudio(audioBlob);
      };

      recorder.start();
      setStatus("recording");
    } catch {
      setError("Story Coach needs microphone access. You can type the words instead.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") {
      setStatus("processing");
      recorderRef.current.stop();
    }
  };

  const submitTypedFallback = () => {
    const text = typedText.trim();

    if (text.length === 0) {
      setError("Type a few words first, then Story Coach can use them.");
      return;
    }

    const formData = new FormData();
    formData.set("text", text);
    void submitFormData(formData);
  };

  const handleNudgeSelect = (nudge: string) => {
    setActiveNudge(nudge);
    setTypedText((currentText) => {
      if (currentText.trim().length === 0) {
        return `${nudge} `;
      }

      return currentText;
    });
  };

  const isBusy = status === "recording" || status === "processing";
  const typedDisabled = disabled || status === "processing" || status === "recording";

  return (
    <section
      className={`rounded-[28px] border border-[var(--border-paper)] bg-white/70 p-5 shadow-[var(--shadow-paper)] ${className}`}
      aria-label="Voice description"
    >
      <div
        className={`rounded-[24px] p-5 text-center shadow-inner ${
          status === "recording" ? "bg-[rgba(239,131,111,0.22)]" : "bg-[var(--accent-sky)]"
        }`}
      >
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white text-[var(--accent-coral)] shadow-lg">
          {status === "processing" ? (
            <LoaderCircle size={54} strokeWidth={2.8} className="animate-spin" aria-hidden="true" />
          ) : status === "recording" ? (
            <Square size={46} strokeWidth={2.8} aria-hidden="true" />
          ) : (
            <Mic size={54} strokeWidth={2.8} aria-hidden="true" />
          )}
        </div>
        <p className="mt-5 text-2xl font-black" aria-live="polite">
          {status === "recording" ? "Listening..." : status === "processing" ? "Making words..." : prompt}
        </p>
        <p className="mx-auto mt-2 max-w-xs text-base font-semibold text-[rgba(47,42,34,0.72)]">
          {status === "recording"
            ? "Tap stop when you are done."
            : recorderAvailable
              ? "Tell it your way. We'll use your favorite parts."
              : "No microphone is available here, so typing is ready."}
        </p>

        <div className="mt-5 flex justify-center">
          {status === "recording" ? (
            <button
              type="button"
              onClick={stopRecording}
              disabled={disabled}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink-primary)] px-5 py-4 text-lg font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Square size={22} />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void startRecording()}
              disabled={disabled || status === "processing" || !recorderAvailable}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-sun)] px-5 py-4 text-lg font-black text-[var(--ink-primary)] shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Mic size={22} />
              Start talking
            </button>
          )}
        </div>
      </div>

      <NudgeBubbles
        nudges={nudges}
        activeNudge={activeNudge}
        disabled={isBusy || disabled}
        className="mt-5"
        onSelect={handleNudgeSelect}
      />

      <div className="mt-5 rounded-[22px] border border-[var(--border-paper)] bg-[var(--surface-paper)] p-4">
        <label htmlFor={typedFallbackId} className="flex items-center gap-2 text-sm font-black uppercase text-[var(--ink-soft)]">
          <Keyboard size={17} />
          {typedFallbackLabel}
        </label>
        <textarea
          id={typedFallbackId}
          value={typedText}
          disabled={typedDisabled}
          onChange={(event) => {
            resetError();
            setTypedText(event.target.value);
          }}
          rows={3}
          placeholder="She is a tiny inventor with purple boots..."
          className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-[var(--border-paper)] bg-white px-4 py-3 text-base font-semibold text-[var(--ink-primary)] outline-none focus:border-[var(--accent-plum)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submitTypedFallback}
          disabled={typedDisabled || typedText.trim().length === 0}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ink-primary)] px-5 py-3 text-base font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Keyboard size={20} />
          Use typed words
        </button>
      </div>

      {status === "error" ? (
        <div
          className="mt-4 flex gap-2 rounded-2xl border border-[rgba(239,131,111,0.45)] bg-[rgba(239,131,111,0.12)] px-4 py-3 text-sm font-bold text-[var(--ink-primary)]"
          role="alert"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </section>
  );
}
