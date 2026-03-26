import React from 'react';
import { Video } from '../mockData';

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
  onAddToPlaylist?: () => void;
  onRemoveFromPlaylist?: () => void;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onClick,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  showAddButton = false,
  showRemoveButton = false,
}) => {
  return (
    <div
      className="bg-[#232323] border border-white/5 rounded-2xl overflow-hidden cursor-pointer relative group active:scale-[0.98] transition-all duration-150 select-none"
      onClick={onClick}
    >
      {/* 縮圖區塊 */}
      <div className="relative overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
          {video.duration}
        </div>
        {showRemoveButton && (
          <button
            className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center z-10 transition-colors"
            onClick={e => { e.stopPropagation(); onRemoveFromPlaylist && onRemoveFromPlaylist(); }}
          >
            ×
          </button>
        )}
      </div>
      {/* 文字區塊 */}
      <div className="p-4">
        <div className="font-semibold text-[15px] text-zinc-100 group-hover:text-[#00D2BE] mb-1 truncate transition-colors duration-150">
          {video.title}
        </div>
        <div className="text-xs text-zinc-500 mb-1">{video.views} ・ {video.createdAt}</div>
        {showAddButton && (
          <button
            className="mt-2 px-3 py-1.5 bg-[#00D2BE] text-[#191919] rounded-lg hover:bg-[#00bfa6] text-xs font-semibold transition-colors"
            onClick={e => { e.stopPropagation(); onAddToPlaylist && onAddToPlaylist(); }}
          >
            加入播放清單
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCard; 