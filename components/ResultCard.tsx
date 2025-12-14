import React from 'react';
import { EnhancementResponse } from '../types';
import { AudioButton } from './AudioButton';
import { Check, Sparkles, BookOpen, Lightbulb, MessageCircle } from 'lucide-react';

interface ResultCardProps {
  data: EnhancementResponse;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in-up">
      {/* Header / Original */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <h3 className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Original (Tamil/Tanglish)</h3>
        <p className="text-2xl font-medium">{data.originalText}</p>
        <div className="mt-4 pt-4 border-t border-white/20">
           <h3 className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Literal Translation</h3>
           <p className="text-lg opacity-95 italic">"{data.literalTranslation}"</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Main Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                 <Check className="w-5 h-5" />
                 <span>Improved Version</span>
               </div>
               <AudioButton text={data.improvedVersion} />
             </div>
             <p className="text-lg text-emerald-900">{data.improvedVersion}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2 text-blue-800 font-semibold">
                 <Sparkles className="w-5 h-5" />
                 <span>Professional</span>
               </div>
               <AudioButton text={data.professionalVersion} />
             </div>
             <p className="text-lg text-blue-900">{data.professionalVersion}</p>
          </div>
        </div>

        {/* Explanation Grid */}
        <div className="grid md:grid-cols-3 gap-6">
           {/* Grammar */}
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <BookOpen className="w-4 h-4" />
                <h3>Grammar Notes</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {data.grammarNotes}
              </p>
           </div>

           {/* Cultural */}
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3>Cultural Context</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                {data.culturalContext}
              </p>
           </div>

           {/* Tips */}
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <MessageCircle className="w-4 h-4 text-rose-500" />
                <h3>Pro Tips</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                {data.conversationTips}
              </p>
           </div>
        </div>

        {/* Alternatives */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Other Ways to Say It</h3>
          <div className="flex flex-wrap gap-3">
            {data.alternatives.map((alt, idx) => (
              <div key={idx} className="group flex items-center gap-2 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200 px-4 py-2 rounded-full transition-all">
                <span className="text-slate-700">{alt}</span>
                <AudioButton text={alt} className="!bg-transparent !p-0 !text-slate-400 hover:!text-indigo-600" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
