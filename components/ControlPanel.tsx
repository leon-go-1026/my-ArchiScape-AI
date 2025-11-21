import React, { useRef } from 'react';
import { LandscapeStyle, InteriorStyle, TimeOfDay, Season, GenerationSettings } from '../types';
import { Sun, Leaf, Palmtree, Type, Sparkles, Home, Armchair, ImagePlus, X } from 'lucide-react';

interface ControlPanelProps {
  settings: GenerationSettings;
  onSettingsChange: (newSettings: GenerationSettings) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  hasImage: boolean;
  referenceImage: string | null;
  onReferenceUpload: (base64: string | null) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  settings, 
  onSettingsChange, 
  isGenerating,
  onGenerate,
  hasImage,
  referenceImage,
  onReferenceUpload
}) => {

  const refFileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof GenerationSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleRefFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onReferenceUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      
      <div className="flex-1 overflow-y-auto space-y-6 px-1 pb-24 custom-scrollbar">
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

            {/* Reference Image Section */}
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" /> 参考图 (可选)
                  </h3>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">参考风格与色调</span>
               </div>
               
               {!referenceImage ? (
                 <div 
                   onClick={() => refFileInputRef.current?.click()}
                   className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-colors text-slate-400 hover:text-brand-600 h-32"
                 >
                    <ImagePlus className="w-6 h-6 opacity-50" />
                    <span className="text-xs">点击上传参考图片</span>
                 </div>
               ) : (
                 <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={referenceImage} alt="Reference" className="w-full h-32 object-cover opacity-90" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onReferenceUpload(null); }}
                          className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-red-500/80 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="absolute bottom-1 left-2 right-2 text-[10px] text-white/90 drop-shadow-md">
                       将应用此图的色调与植物
                    </div>
                 </div>
               )}
               <input 
                 type="file" 
                 ref={refFileInputRef} 
                 onChange={handleRefFileChange} 
                 accept="image/*" 
                 className="hidden" 
               />
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
      </div>

      {/* Fixed Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 pt-4 pb-0 bg-gradient-to-t from-white via-white to-transparent z-10">
        <button
          onClick={onGenerate}
          disabled={!hasImage || isGenerating}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
            !hasImage || isGenerating
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
              <span>{referenceImage ? '应用参考图生成' : '生成效果图'}</span>
            </>
          )}
        </button>
        {!hasImage && <p className="text-center text-xs text-slate-400 mt-2">请先上传图片</p>}
      </div>
    </div>
  );
};