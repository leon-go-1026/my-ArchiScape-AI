import React from 'react';
import { LandscapeStyle, InteriorStyle, TimeOfDay, Season, GenerationSettings, AnalysisResult, Proposal } from '../types';
import { Settings2, Sun, Leaf, Palmtree, Type, Sparkles, Search, Home, Armchair } from 'lucide-react';

interface ControlPanelProps {
  settings: GenerationSettings;
  onSettingsChange: (newSettings: GenerationSettings) => void;
  isGenerating: boolean;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  onGenerate: () => void;
  hasImage: boolean;
  activeTab: 'ai' | 'custom';
  onTabChange: (tab: 'ai' | 'custom') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  settings, 
  onSettingsChange, 
  isGenerating,
  isAnalyzing,
  analysisResult,
  onGenerate,
  hasImage,
  activeTab,
  onTabChange
}) => {

  const handleChange = (key: keyof GenerationSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleProposalSelect = (proposal: Proposal) => {
    onSettingsChange(proposal.settings);
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Tabs */}
      <div className="flex mb-6 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => onTabChange('ai')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'ai' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" /> 智能推荐
        </button>
        <button
          onClick={() => onTabChange('custom')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'custom' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings2 className="w-4 h-4" /> 自定义参数
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-1 pb-24">
        
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fade-in">
            {!hasImage ? (
               <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                 <p className="text-sm">请上传图片以开始智能分析</p>
               </div>
            ) : isAnalyzing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-600 bg-brand-50 p-4 rounded-xl border border-brand-100">
                  <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                  <span className="font-medium text-sm">正在分析建筑风格...</span>
                </div>
                {[1,2,3].map(i => (
                  <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : analysisResult ? (
              <>
                <div className="bg-slate-900 text-slate-50 p-4 rounded-xl shadow-sm">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">识别结果</div>
                  <h3 className="font-bold text-lg">{analysisResult.architecturalStyle}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed opacity-80">{analysisResult.confidence}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" /> 推荐方案
                  </h4>
                  {analysisResult.proposals.map((proposal) => {
                    const isSelected = JSON.stringify(settings) === JSON.stringify(proposal.settings);
                    return (
                      <div 
                        key={proposal.id}
                        onClick={() => handleProposalSelect(proposal)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md group ${
                          isSelected 
                            ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-200' 
                            : 'border-slate-200 bg-white hover:border-brand-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className={`font-bold ${isSelected ? 'text-brand-700' : 'text-slate-800'}`}>
                            {proposal.title}
                          </h5>
                          {isSelected && <div className="w-2 h-2 bg-brand-500 rounded-full"></div>}
                        </div>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{proposal.rationale}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600">
                            {proposal.settings.season.split('(')[1].replace(')', '')}
                          </span>
                          <span className="text-[10px] px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600">
                            {proposal.settings.time.split('(')[1].replace(')', '')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Scene Type Selector */}
            <div className="bg-slate-100 p-1 rounded-lg flex">
               <button 
                 onClick={() => handleChange('sceneType', 'exterior')}
                 className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md flex items-center justify-center gap-2 transition-all ${
                   settings.sceneType === 'exterior' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                  <Home className="w-3 h-3" /> 室外 (Exterior)
               </button>
               <button 
                 onClick={() => handleChange('sceneType', 'interior')}
                 className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md flex items-center justify-center gap-2 transition-all ${
                   settings.sceneType === 'interior' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                  <Armchair className="w-3 h-3" /> 室内 (Interior)
               </button>
            </div>

            {/* Dynamic Style Section */}
            {settings.sceneType === 'exterior' ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Palmtree className="w-4 h-4" /> 景观风格
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(LandscapeStyle).map((style) => (
                    <button
                      key={style}
                      onClick={() => handleChange('style', style)}
                      className={`text-left px-4 py-3 rounded-lg text-sm transition-all border ${
                        settings.style === style 
                          ? 'bg-brand-50 border-brand-500 text-brand-700 font-medium shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {style.split('(')[1].replace(')', '')} <span className="opacity-60 text-xs block">{style.split('(')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Armchair className="w-4 h-4" /> 室内风格
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(InteriorStyle).map((style) => (
                    <button
                      key={style}
                      onClick={() => handleChange('interiorStyle', style)}
                      className={`text-left px-4 py-3 rounded-lg text-sm transition-all border ${
                        settings.interiorStyle === style 
                          ? 'bg-purple-50 border-purple-500 text-purple-700 font-medium shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {style.split('(')[1].replace(')', '')} <span className="opacity-60 text-xs block">{style.split('(')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sun className="w-4 h-4" /> 时间与氛围
              </h3>
              <select 
                value={settings.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
              >
                {Object.values(TimeOfDay).map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Leaf className="w-4 h-4" /> 季节
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(Season).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleChange('season', s)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-colors border ${
                      settings.season === s
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.split('(')[1].replace(')', '')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4" /> 补充描述 (可选)
              </h3>
              <textarea
                value={settings.promptEnhancement}
                onChange={(e) => handleChange('promptEnhancement', e.target.value)}
                placeholder={settings.sceneType === 'exterior' ? "例如：增加前景的人物，或者需要在左侧有一颗大榕树..." : "例如：使用丝绒沙发，大理石茶几，墙上挂抽象画..."}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none h-24"
              />
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 pt-4 pb-0 bg-gradient-to-t from-white via-white to-transparent z-10">
        <button
          onClick={onGenerate}
          disabled={!hasImage || isGenerating || isAnalyzing}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
            !hasImage || isGenerating || isAnalyzing
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 hover:shadow-brand-500/30'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>渲染中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>生成效果图</span>
            </>
          )}
        </button>
        {!hasImage && <p className="text-center text-xs text-slate-400 mt-2">请先上传图片</p>}
      </div>
    </div>
  );
};