import React from 'react';
import { Asset } from '../types';
import { ImageIcon, Video } from 'lucide-react';

interface AssetGalleryProps {
  assets: Asset[];
}

export const AssetGallery: React.FC<AssetGalleryProps> = ({ assets }) => {
  if (assets.length === 0) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <ImageIcon size={48} className="mb-4 opacity-50" />
            <p>No assets generated yet.</p>
            <p className="text-sm mt-2">Use the Creative Studio to generate concept art or ads.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[600px] pr-2">
      {[...assets].reverse().map((asset) => (
        <div key={asset.id} className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden group relative">
          <div className="aspect-video bg-black flex items-center justify-center relative">
            {asset.type === 'IMAGE' ? (
              <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
            ) : (
              <video src={asset.url} controls className="w-full h-full" />
            )}
            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono flex items-center">
                {asset.type === 'VIDEO' ? <Video size={12} className="mr-1" /> : <ImageIcon size={12} className="mr-1" />}
                {asset.type}
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs text-slate-400 line-clamp-2" title={asset.prompt}>
              "{asset.prompt}"
            </p>
            <div className="mt-2 text-[10px] text-slate-600 font-mono">
                {new Date(asset.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};