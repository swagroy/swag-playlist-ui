import React from 'react';
import { Playlist } from '../mockData';
import VideoCard from './VideoCard';

interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
  onRemoveVideo: (playlistId: string, videoId: string) => void;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlist, onBack, onRemoveVideo }) => {
  // 假設點擊影片會導到 /video/:id 頁面，這裡用 window.location.href 模擬
  const handleVideoClick = (videoId: string) => {
    window.location.href = `/video/${videoId}`;
  };

  return (
    <div className="px-8 pt-8 pb-12">
      <button className="mb-4 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white font-bold hover:bg-white/[0.07] transition-colors duration-150" onClick={onBack}>
        ← Back to Playlists
      </button>
      <div className="flex items-center gap-6 mb-6">
        <div className="w-64 h-36 bg-gray-200 rounded-lg overflow-hidden">
          {playlist.videos[0] ? (
            <img src={playlist.videos[0].thumbnail} alt={playlist.name} className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No Cover</div>
          )}
        </div>
        <div>
          <div className="text-2xl font-bold mb-1">{playlist.name}</div>
          <div className="text-gray-600 mb-2">{playlist.description}</div>
          <div className="text-sm text-gray-400">{playlist.videos.length} videos ・ Created {playlist.createdAt}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {playlist.videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => handleVideoClick(video.id)}
            showRemoveButton
            onRemoveFromPlaylist={() => onRemoveVideo(playlist.id, video.id)}
          />
        ))}
        {playlist.videos.length === 0 && (
          <div className="text-gray-400 col-span-2 text-center py-8">No videos in this playlist.</div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail; 