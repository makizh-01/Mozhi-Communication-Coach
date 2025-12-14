import React, { useState, useRef, useCallback } from 'react';
import { Volume2, Loader2, StopCircle } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { decodeAudioData, decodeBase64 } from '../services/audioUtils';

interface AudioButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({ text, label, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get raw audio data (base64)
      const base64Audio = await generateSpeech(text);
      
      // 2. Initialize AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000
        });
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // 3. Decode
      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        ctx,
        24000,
        1
      );

      // 4. Play
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };

      sourceRef.current = source;
      source.start();
      setIsPlaying(true);

    } catch (error) {
      console.error("Failed to play audio", error);
      alert("Could not play audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={playAudio}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        isPlaying 
          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
      } ${className || ''}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <StopCircle className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      {label && <span>{label}</span>}
    </button>
  );
};
