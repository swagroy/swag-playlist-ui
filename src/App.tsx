import React, { useState } from 'react';
import { playlistsMock, videosMock, Playlist, Video } from './mockData';
import PlaylistList from './components/PlaylistList';
import PlaylistContentPage from './components/PlaylistContentPage';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import { t } from './locales';

type View = 'playlists' | 'allVideos' | 'playlistDetail';

function App() {
  const [view, setView] = useState<View>('playlists');
  const [playlists, setPlaylists] = useState<Playlist[]>(playlistsMock);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const userName = '@pot0719'; // 這裡未來可由工程師串接

  // 切換到播放清單詳細頁
  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setView('playlistDetail');
  };

  // 新增或編輯播放清單
  const handleCreatePlaylist = (playlist: Playlist) => {
    setPlaylists((prev) => {
      const exists = prev.find((pl) => pl.id === playlist.id);
      if (exists) {
        return prev.map((pl) => pl.id === playlist.id ? { ...pl, ...playlist } : pl);
      } else {
        return [...prev, playlist];
      }
    });
  };

  // 新增影片到播放清單
  const handleAddVideoToPlaylist = (playlistId: string, video: Video) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId && !pl.videos.find((v) => v.id === video.id)
          ? { ...pl, videos: [...pl.videos, video] }
          : pl
      )
    );
  };

  // 從播放清單移除影片
  const handleRemoveVideoFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId
          ? { ...pl, videos: pl.videos.filter((v) => v.id !== videoId) }
          : pl
      )
    );
  };

  // 回到播放清單列表
  const handleBackToPlaylists = () => {
    setView('playlists');
    setSelectedPlaylistId(null);
  };

  // 刪除播放清單
  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
  };

  return (
    <div className="w-screen min-h-screen bg-[#191919] p-0 m-0 overflow-x-hidden">
      {/* 直接渲染內容，不要再包一層有 padding/margin 的 div */}
      {view === 'playlists' && (
          <div className="flex items-end justify-between ml-8 mr-8 mt-8 mb-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{t('myPlaylists')}</h1>
            <div className="text-sm text-[#B0B0B0]">共 {playlists.length} 個播放清單，共 {playlists.reduce((sum, pl) => sum + pl.videos.length, 0)} 部影片</div>
          </div>
        </div>
      )}
      {view === 'playlists' && (
        <PlaylistList
          playlists={playlists}
          onSelect={handleSelectPlaylist}
          onCreate={handleCreatePlaylist}
          onDelete={handleDeletePlaylist}
        />
      )}
      {view === 'playlistDetail' && selectedPlaylistId && (
        <PlaylistContentPage
          playlist={playlists.find((pl) => pl.id === selectedPlaylistId)!}
          onBack={handleBackToPlaylists}
          onEdit={handleCreatePlaylist}
          onDelete={handleDeletePlaylist}
        />
      )}
      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(name, description, isPrivate) => {
          const now = new Date();
          const createdAt = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
          handleCreatePlaylist({
            id: 'p' + Date.now(),
            name,
            description,
            createdAt,
            videos: [],
            isPrivate: isPrivate ?? false,
          });
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

export default App;
