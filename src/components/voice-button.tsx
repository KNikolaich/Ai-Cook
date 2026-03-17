"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useAppStore } from "@/src/lib/store";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (val: boolean) => void;
}

export function VoiceButton({ onTranscript, isListening, setIsListening }: VoiceButtonProps) {
  const { preferences } = useAppStore();
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "ru-RU";

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);

      setRecognition(recog);
    }
  }, [onTranscript, setIsListening]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  return (
    <button
      onClick={toggleListening}
      className={cn(
        "relative p-3 rounded-full transition-all",
        isListening ? "bg-red-500 text-white" : "bg-primary text-white hover:opacity-90"
      )}
    >
      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.3 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-red-500 rounded-full -z-10"
          />
        )}
      </AnimatePresence>
    </button>
  );
}

export function useSpeech() {
  const { preferences } = useAppStore();

  const speak = useCallback((text: string) => {
    if (!preferences.autoRead) return;
    
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU";
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, [preferences.autoRead]);

  return { speak };
}
