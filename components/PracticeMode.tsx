import React, { useState } from 'react';
import { generatePracticeScenario } from '../services/geminiService';
import { PracticeScenario } from '../types';
import { AudioButton } from './AudioButton';
import { Play, Loader2, RefreshCw } from 'lucide-react';

export const PracticeMode: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [scenario, setScenario] = useState<PracticeScenario | null>(null);
  const [loading, setLoading] = useState(false);

  const topics = [
    "Ordering coffee",
    "Job Interview introduction",
    "Talking to a doctor",
    "Asking for directions",
    "Explaining a project delay"
  ];

  const handleGenerate = async (selectedTopic: string) => {
    setLoading(true);
    setScenario(null);
    try {
      const result = await generatePracticeScenario(selectedTopic);
      setScenario(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Choose a Practice Scenario</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTopic(t);
                handleGenerate(t);
              }}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors text-sm font-medium"
            >
              {t}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Or type your own topic (e.g., 'Negotiating salary')..."
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => handleGenerate(topic)}
            disabled={!topic || loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            Start
          </button>
        </div>
      </div>

      {scenario && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
             <div>
               <h3 className="text-2xl font-bold">{scenario.scenarioTitle}</h3>
               <p className="text-slate-400 mt-2">{scenario.description}</p>
             </div>
             <button 
                onClick={() => handleGenerate(topic)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Regenerate"
             >
                <RefreshCw className="w-5 h-5 text-slate-400" />
             </button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {scenario.dialogue.map((line, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    idx % 2 === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {line.speaker.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{line.speaker}</span>
                      <AudioButton text={line.text} />
                    </div>
                    <p className="text-lg text-slate-800 leading-relaxed">{line.text}</p>
                    {line.note && (
                      <div className="inline-block bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full border border-amber-100 mt-2">
                        💡 {line.note}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};