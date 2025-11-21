import React, { useState, useEffect } from 'react';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { ControlPanel } from './components/ControlPanel';
import { ImageViewer } from './components/ImageViewer';
import { generateLandscape, analyzeArchitecture } from './services/geminiService';
import { AppState, GenerationSettings, LandscapeStyle, InteriorStyle, TimeOfDay, Season } from './types';

const DEFAULT_SETTINGS: GenerationSettings = {
  sceneType: 'exterior',
  style: LandscapeStyle.MODERN,
  interiorStyle: InteriorStyle.CREAM,
  time: TimeOfDay.SUNNY_NOON,
  season: Season.SUMMER,
  promptEnhancement: '',
};

export default function App() {
  const [state, setState] = useState<AppState>({
    originalImage: null,
    generatedImage: null,
    isGenerating: false,
    isAnalyzing: false,
    analysisResult: null,
    error: null,
    settings: DEFAULT_SETTINGS,
    activeTab: 'ai',
  });

  const handleImageUpload = (base64: string) => {
    if (base64 === '') {
         setState(prev => ({ 
           ...prev, 
           originalImage: null, 
           generatedImage: null, 
           error: null,
           analysisResult: null
         }));
    } else {
        setState(prev => ({ 
          ...prev, 
          originalImage: base64, 
          generatedImage: null, 
          error: null,
          analysisResult: null, // Reset previous analysis
          activeTab: 'ai'
        }));
    }
  };

  // Auto-analyze when image is uploaded
  useEffect(() => {
    const performAnalysis = async () => {
      if (state.originalImage && !state.analysisResult && !state.isAnalyzing) {
        setState(prev => ({ ...prev, isAnalyzing: true }));
        try {
          const result = await analyzeArchitecture(state.originalImage);
          setState(prev => ({ 
            ...prev, 
            isAnalyzing: false, 
            analysisResult: result,
            // Automatically select the first proposal
            settings: result.proposals[0]?.settings || prev.settings
          }));
        } catch (err: any) {
          console.error(err);
          // Check if it's a critical configuration error
          const isConfigError = err.message?.includes("API Key");
          
          setState(prev => ({ 
            ...prev, 
            isAnalyzing: false,
            // If it's an API key error, show it. Otherwise show generic analysis error.
            error: isConfigError ? err.message : "智能分析失败，已切换至手动模式。" 
          }));
        }
      }
    };

    performAnalysis();
  }, [state.originalImage]);

  const handleSettingsChange = (newSettings: GenerationSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }));
  };

  const handleTabChange = (tab: 'ai' | 'custom') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }

  const handleGenerate = async () => {
    if (!state.originalImage) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const resultImage = await generateLandscape(state.originalImage, state.settings);
      setState(prev => ({ 
        ...prev, 
        generatedImage: resultImage, 
        isGenerating: false 
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: err.message || "生成失败，请重试。" 
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-2 rounded-lg shadow-lg shadow-brand-500/20">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <div>
             <h1 className="font-bold text-xl tracking-tight text-slate-900">MY-ArchiScape <span className="text-brand-600">AI</span></h1>
             <p className="text-xs text-slate-500 font-medium">智能建筑景观生成器</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
             <Sparkles className="w-3 h-3 text-brand-500" />
             <span className="text-xs text-slate-600 font-medium">Powered by Gemini 2.5</span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Controls */}
        <aside className="w-96 bg-white border-r border-slate-200 flex flex-col z-20 overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-6 h-full">
            <ControlPanel 
              settings={state.settings}
              onSettingsChange={handleSettingsChange}
              isGenerating={state.isGenerating}
              isAnalyzing={state.isAnalyzing}
              analysisResult={state.analysisResult}
              onGenerate={handleGenerate}
              hasImage={!!state.originalImage}
              activeTab={state.activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        </aside>

        {/* Main Viewport */}
        <section className="flex-1 p-6 bg-slate-50 overflow-hidden relative">
           <div className="w-full h-full max-w-[1600px] mx-auto">
              <ImageViewer 
                originalImage={state.originalImage}
                generatedImage={state.generatedImage}
                isGenerating={state.isGenerating}
                onUpload={handleImageUpload}
              />
           </div>

           {/* Error Toast */}
           {state.error && (
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl shadow-xl shadow-red-500/10 flex items-center gap-3 animate-bounce-in z-50 max-w-xl w-full mx-4">
               <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
               <span className="font-medium text-sm break-all">{state.error}</span>
               <button 
                 onClick={() => setState(s => ({...s, error: null}))}
                 className="ml-auto text-red-400 hover:text-red-700 font-bold px-2"
               >
                 ×
               </button>
             </div>
           )}
        </section>

      </main>
    </div>
  );
}