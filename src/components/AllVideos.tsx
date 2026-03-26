import React, { useState } from 'react';
import { Video, Playlist } from '../mockData';
import VideoCard from './VideoCard';

interface AllVideosProps {
  videos: Video[];
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, video: Video) => void;
}

const AllVideos: React.FC<AllVideosProps> = ({ videos, playlists, onAddToPlaylist }) => {
  const [selected, setSelected] = useState<{ [videoId: string]: boolean }>({});
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const handleAdd = (playlistId: string, video: Video) => {
    onAddToPlaylist(playlistId, video);
    setSelected((prev) => ({ ...prev, [video.id]: true }));
    setTimeout(() => setSelected((prev) => ({ ...prev, [video.id]: false })), 1000);
    setDropdownOpen(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="relative">
          <div className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer relative group">
            <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {video.duration || (video.type === 'Story' ? '24hr' : video.type === 'Photo' ? '照片' : '')}
            </div>
            <div className="p-4">
              <div className="font-semibold text-base mb-1 truncate">{video.title}</div>
              <div className="text-xs text-gray-500 mb-1 flex gap-2 items-center">
                {video.views} ・ {video.createdAt}
                {video.type && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-600 text-white text-xs font-bold">
                    {video.type === 'Video' ? '影片' : video.type === 'Story' ? '短影音' : '照片'}
                  </span>
                )}
              </div>
              <button
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                onClick={e => { e.stopPropagation(); setDropdownOpen(dropdownOpen === video.id ? null : video.id); }}
              >
                加入播放清單
              </button>
              {dropdownOpen === video.id && (
                <div className="absolute right-0 mt-2 min-w-[220px] bg-[#191919]/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl z-30 p-2">
                  {playlists.length === 0 ? (
                    <div className="px-4 py-3 text-zinc-500 text-[15px]">無播放清單</div>
                  ) : (
                    playlists.map(pl => (
                      <div
                        key={pl.id}
                        className="px-4 py-3 rounded-xl hover:bg-zinc-800/70 active:bg-zinc-800 cursor-pointer text-[15px] font-medium text-zinc-100 transition-colors"
                        onClick={e => { e.stopPropagation(); handleAdd(pl.id, video); }}
                      >
                        {pl.name}
                      </div>
                    ))
                  )}
                </div>
              )}
              {selected[video.id] && (
                <span className="ml-2 text-green-600 font-bold">✔</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllVideos; 