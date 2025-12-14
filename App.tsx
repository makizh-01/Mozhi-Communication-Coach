import React, { useState, useRef } from 'react';
import { TargetLanguage, EnhancementResponse } from './types';
import { enhanceCommunication, transcribeAudio } from './services/geminiService';
import { blobToBase64 } from './services/audioUtils';
import { ResultCard } from './components/ResultCard';
import { PracticeMode } from './components/PracticeMode';
import { Languages, Mic, Send, Sparkles, BookOpen, GraduationCap, StopCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'translate' | 'practice'>('translate');
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState<TargetLanguage>(TargetLanguage.English);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EnhancementResponse | null>(null);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleEnhance = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const response = await enhanceCommunication(inputText, targetLang);
      setResult(response);
    } catch (error) {
      alert("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleEnhance();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop Recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setIsProcessingAudio(true);
      }
    } else {
      // Start Recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const base64 = await blobToBase64(blob);
            // Defaulting to audio/webm usually works for most browsers recording audio
            const transcription = await transcribeAudio(base64, 'audio/webm');
            
            // Append to existing text or replace if empty? Usually append is better for voice dictation.
            setInputText(prev => (prev ? prev + ' ' + transcription : transcription));
            
          } catch (error) {
            console.error(error);
            alert("Failed to transcribe audio.");
          } finally {
            setIsProcessingAudio(false);
            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Microphone access is required for voice input.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Mozhi
              </h1>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('translate')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'translate' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Translate & Learn
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'practice' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Practice Lab
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'translate' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                Convert Thoughts to Fluent Speech
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Type in Tamil or Tanglish (e.g., "Naan vara maaten"). We'll translate, correct grammar, and make it sound professional.
              </p>
            </div>

            {/* Input Section */}
            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-indigo-100 border border-slate-100 transition-shadow focus-within:shadow-2xl focus-within:shadow-indigo-200/50 focus-within:border-indigo-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                 <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">Input (Tamil)</span>
                 <select 
                   value={targetLang}
                   onChange={(e) => setTargetLang(e.target.value as TargetLanguage)}
                   className="text-sm font-medium bg-white border border-slate-100 rounded-lg px-2 py-1 text-slate-600 cursor-pointer hover:bg-slate-50 focus:ring-0"
                 >
                   {Object.values(TargetLanguage).map(lang => (
                     <option key={lang} value={lang}>To {lang}</option>
                   ))}
                 </select>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="E.g., Enaku inaiku leave venum, udambu sari illa..."
                className="w-full p-4 h-32 text-lg resize-none focus:outline-none placeholder:text-slate-300 rounded-b-2xl"
              />
              <div className="p-3 flex items-center justify-between bg-white rounded-xl m-2">
                
                {/* Voice Input Button */}
                <button
                  onClick={toggleRecording}
                  disabled={isProcessingAudio}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                    isRecording 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'border-transparent hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  {isProcessingAudio ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isRecording ? (
                     <StopCircle className="w-4 h-4 animate-pulse fill-red-600" />
                  ) : (
                     <Mic className="w-4 h-4" />
                  )}
                  <span className="text-xs font-semibold">
                    {isProcessingAudio ? 'Processing...' : isRecording ? 'Stop Recording' : 'Voice Input'}
                  </span>
                </button>

                <button
                  onClick={handleEnhance}
                  disabled={isLoading || !inputText.trim()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <span>Transform</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Features Hint */}
            {!result && !isLoading && (
              <div className="grid grid-cols-3 gap-4 text-center mt-12 opacity-50">
                <div className="p-4 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Professional Tone</span>
                </div>
                <div className="p-4 flex flex-col items-center gap-2">
                   <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Grammar Fixes</span>
                </div>
                <div className="p-4 flex flex-col items-center gap-2">
                   <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Cultural Tips</span>
                </div>
              </div>
            )}

            {/* Result Area */}
            {result && (
              <div className="mt-8">
                <ResultCard data={result} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <PracticeMode />
        )}
        
      </main>
    </div>
  );
};

export default App;
