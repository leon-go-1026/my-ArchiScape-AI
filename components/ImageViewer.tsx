import React, { useState } from 'react';
import { Eye, EyeOff, Download, Maximize2 } from 'lucide-react';
import { UploadSection } from './UploadSection';

interface ImageViewerProps {
  originalImage: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
  onUpload: (base64: string) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  originalImage, 
  generatedImage, 
  isGenerating,
  onUpload
}) => {
  const [viewOriginal, setViewOriginal] = useState(false);

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `archiscape-render-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!originalImage) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="max-w-md w-full">
            <UploadSection onImageUpload={onUpload} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Main Image Display Area */}
      <div className="relative flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-xl group">
        
        {/* Images */}
        <div className="absolute inset-0 flex items-center justify-center">
           <img 
             src={originalImage} 
             alt="Original" 
             className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${generatedImage && !viewOriginal ? 'opacity-0' : 'opacity-100'}`}
           />
           
           {generatedImage && (
             <img 
               src={generatedImage} 
               alt="Generated" 
               className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${viewOriginal ? 'opacity-0' : 'opacity-100'}`}
             />
           )}
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/20 border-t-brand-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-white font-medium tracking-wide animate-pulse">正在绘制景观细节...</p>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex justify-between items-end">
                <div>
                    <h4 className="text-white font-semibold text-lg">
                        {generatedImage ? (viewOriginal ? '原始建筑' : '渲染效果') : '原始建筑'}
                    </h4>
                    <p className="text-slate-300 text-sm">
                        {generatedImage ? '按住按钮对比' : '等待生成...'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {generatedImage && (
                        <>
                            <button 
                                onMouseDown={() => setViewOriginal(true)}
                                onMouseUp={() => setViewOriginal(false)}
                                onMouseLeave={() => setViewOriginal(false)}
                                onTouchStart={() => setViewOriginal(true)}
                                onTouchEnd={() => setViewOriginal(false)}
                                className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
                                title="Hold to view original"
                            >
                                {viewOriginal ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                            <button 
                                onClick={handleDownload}
                                className="p-3 bg-brand-600 hover:bg-brand-500 rounded-full text-white transition-colors shadow-lg shadow-brand-500/20"
                                title="Download Result"
                            >
                                <Download size={20} />
                            </button>
                        </>
                    )}
                    {!isGenerating && (
                        <button 
                            onClick={() => onUpload('')} // Reset basically
                            className="p-3 bg-white/10 backdrop-blur-md hover:bg-red-500/80 rounded-full text-white transition-colors border border-white/10"
                            title="Remove Image"
                        >
                             <span className="font-bold text-sm px-1">重置</span>
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-xs font-medium text-white uppercase tracking-widest">
                {generatedImage && !viewOriginal ? 'AI Generated' : 'Original Source'}
            </span>
        </div>
      </div>
    </div>
  );
};
