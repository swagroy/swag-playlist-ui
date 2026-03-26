import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Playlist } from '../mockData';
import CreatePlaylistModal from './CreatePlaylistModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { t } from '../locales';
import { FaRegTrashAlt } from 'react-icons/fa';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import AddIcon from '@mui/icons-material/Add';

interface PlaylistListProps {
  playlists: Playlist[];
  onSelect: (playlistId: string) => void;
  onCreate: (playlist: Playlist) => void;
  onDelete?: (playlistId: string) => void;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('/');
  return `${y}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
}

const PlaylistList: React.FC<PlaylistListProps> = ({ playlists, onSelect, onCreate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{top: number, left: number} | null>(null);
  const btnRefs = useRef<{[id: string]: HTMLButtonElement | null}>({});
  const [editModal, setEditModal] = useState<{open: boolean, playlist?: Playlist}>({open: false});
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [menuReady, setMenuReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreate = (name: string, description?: string, isPrivate?: boolean) => {
    const now = new Date();
    const createdAt = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    onCreate({
      id: 'p' + Date.now(),
      name,
      description,
      createdAt,
      videos: [],
      isPrivate: isPrivate ?? false,
    });
    setShowModal(false);
  };

  // 編輯播放清單
  const handleEdit = (name: string, description?: string, isPrivate?: boolean) => {
    if (!editModal.playlist) return;
    onCreate({
      ...editModal.playlist,
      name,
      description,
      isPrivate: isPrivate ?? editModal.playlist.isPrivate,
    });
    setEditModal({open: false});
  };

  // 刪除播放清單
  const handleDelete = (playlistId: string) => {
    setDeleteTargetId(playlistId);
    setMenuOpenId(null);
    setMenuPos(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId && onDelete) {
      onDelete(deleteTargetId);
    }
    setDeleteTargetId(null);
  };

  const handleCancelDelete = () => {
    setDeleteTargetId(null);
  };

  // 手機版底部抽屜開啟時鎖定背景捲動
  useEffect(() => {
    if (!isDesktop && menuOpenId) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpenId, isDesktop]);

  // 桌機版：點擊外部關閉選單
  useEffect(() => {
    if (!menuOpenId || !isDesktop) return;
    const handleClick = (e: MouseEvent) => {
      const menu = document.getElementById(`playlist-menu-${menuOpenId}`);
      const btn = btnRefs.current[menuOpenId];
      if (menu && menu.contains(e.target as Node)) return;
      if (btn && btn.contains(e.target as Node)) return;
      setMenuOpenId(null);
      setMenuPos(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenId, isDesktop]);

  // 選單座標計算（含上/下翻轉邏輯）
  const MENU_OFFSET_Y = 8;
  useEffect(() => {
    if (typeof menuOpenId === 'string' && btnRefs.current[menuOpenId] && menuReady) {
      const raf = requestAnimationFrame(() => {
        const rect = btnRefs.current[menuOpenId]?.getBoundingClientRect();
        if (rect) {
          if (isDesktop) {
            const menuWidth = 220;
            const menuHeight = 112; // 2 個選項的估算高度
            const screenWidth = window.innerWidth;
            let left = rect.right + window.scrollX - menuWidth;
            if (left < 8) left = 8;
            if (left + menuWidth > screenWidth - 8) left = screenWidth - menuWidth - 8;
            const spaceBelow = window.innerHeight - rect.bottom;
            const top = spaceBelow >= menuHeight + MENU_OFFSET_Y
              ? rect.bottom + window.scrollY + MENU_OFFSET_Y
              : rect.top + window.scrollY - menuHeight - MENU_OFFSET_Y;
            setMenuPos({ top, left });
          } else {
            // 手機版不使用 fixed popover，交由 bottom sheet 處理
            setMenuPos(null);
          }
        } else {
          setMenuPos({ top: 100, left: 100 });
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [menuOpenId, menuReady, isDesktop]);

  // 桌機版：捲動時自動關閉 Popover
  useEffect(() => {
    if (!menuOpenId || !isDesktop) return;
    const handleScroll = () => {
      setMenuOpenId(null);
      setMenuPos(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpenId, isDesktop]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* <div className="flex justify-end items-center mb-8 px-8 w-full">
        <button ...>+ Create Playlist</button>
      </div> */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 w-full px-4">
          {/* 插圖區塊 */}
          <div className="mb-6">
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="40" width="120" height="80" rx="16" fill="#23272A" stroke="#00D2BE" strokeWidth="3"/>
              <rect x="36" y="56" width="88" height="12" rx="6" fill="#00D2BE" fillOpacity="0.7"/>
              <rect x="36" y="76" width="60" height="10" rx="5" fill="#B0B0B0" fillOpacity="0.5"/>
              <rect x="36" y="92" width="40" height="10" rx="5" fill="#B0B0B0" fillOpacity="0.3"/>
              <circle cx="120" cy="97" r="7" fill="#00D2BE" fillOpacity="0.7"/>
              <circle cx="120" cy="97" r="3" fill="#fff"/>
            </svg>
          </div>
          <div className="text-xl md:text-2xl font-bold text-white mb-4 text-center px-4">還沒有播放清單？來建立你的第一份影片收藏吧！</div>
          <button
            className="bg-[#00D2BE] text-[#191919] px-8 py-4 rounded-xl text-xl font-bold hover:bg-[#00bfa6] transition mb-2"
            onClick={() => setShowModal(true)}
          >
            {t('startCreatePlaylist')}
          </button>
        </div>
      ) : (
        <>
          {/* 只渲染桌機或手機卡片其中之一 */}
          {isDesktop ? (
            <div className="flex flex-wrap gap-6 px-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="w-80 bg-[#232323] border border-white/5 rounded-2xl hover:bg-[#2a2a2a] hover:border-white/10 cursor-pointer transition-all duration-200 overflow-hidden relative"
                  onClick={() => onSelect(playlist.id)}
                >
                  <div className="relative h-44 w-full bg-white/5">
                    {playlist.videos[0] ? (
                      <img
                        src={playlist.videos[0].thumbnail}
                        alt={playlist.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#B0B0B0]">No Cover</div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded flex items-center gap-1 z-10">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle">
                        <rect x="2" y="4" width="10" height="2" rx="1" fill="white"/>
                        <rect x="2" y="8" width="10" height="2" rx="1" fill="white"/>
                        <rect x="2" y="12" width="10" height="2" rx="1" fill="white"/>
                        <polygon points="15,6 19,10 15,14" fill="white"/>
                      </svg>
                      {playlist.videos.length} videos
                    </div>
                  </div>
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <div className="font-bold text-lg mb-1 text-white">{playlist.name}</div>
                      <div className="text-[#B0B0B0] text-sm mb-2">{playlist.description}</div>
                      <div className="text-xs text-[#B0B0B0]">{t('createdAt', { date: formatDate(playlist.createdAt) })}</div>
                    </div>
                    <div className="relative ml-2 mt-1">
                      <button
                        ref={el => {
                          btnRefs.current[playlist.id] = el;
                          if (el && menuOpenId === playlist.id) setMenuReady(true);
                        }}
                        className="p-0 border-0 flex items-center justify-center text-zinc-600 hover:text-zinc-200 transition-colors duration-150"
                        onClick={e => {
                          e.stopPropagation();
                          if (playlist.id === menuOpenId) {
                            setMenuOpenId(null);
                            setMenuPos(null);
                            setMenuReady(false);
                          } else {
                            setMenuReady(false);
                            setMenuOpenId(playlist.id);
                          }
                        }}
                      >
                        <MoreHorizontal size={20} className="text-inherit" strokeWidth={2} />
                      </button>
                      {menuOpenId === playlist.id && menuPos && ReactDOM.createPortal(
                        <div
                          id={`playlist-menu-${playlist.id}`}
                          className="z-[9999] bg-[#191919]/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl min-w-[220px] fixed p-2"
                          style={{ top: menuPos.top, left: menuPos.left }}
                        >
                          <button
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors duration-150 text-zinc-100 flex items-center gap-3 text-[15px] font-medium"
                            onClick={e => {
                              e.stopPropagation();
                              setEditModal({open: true, playlist});
                              setMenuOpenId(null); setMenuPos(null);
                            }}
                          >
                            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213l-4.182.545.545-4.182L16.862 4.487ZM15 6l3 3" /></svg>
                            編輯
                          </button>
                          <div className="my-1 h-px bg-white/10" />
                          <button
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors duration-150 text-red-400 flex items-center gap-3 text-[15px] font-medium"
                            onClick={e => { e.stopPropagation(); handleDelete(playlist.id); }}
                          >
                            <FaRegTrashAlt className="w-[18px] h-[18px] text-red-400 flex-shrink-0" />
                            刪除
                          </button>
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* 新增播放清單卡片 */}
              <div
                className="w-80 bg-transparent hover:bg-white/[0.03] rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden relative flex flex-col items-center justify-center border-2 border-dashed border-[#00D2BE]/60 hover:border-[#00D2BE] min-h-[292px] h-auto py-8"
                onClick={() => setShowModal(true)}
              >
                <div className="flex flex-col items-center">
                  <span className="text-4xl text-[#00D2BE] mb-2">➕</span>
                  <div className="text-lg font-bold text-white mb-1">新增播放清單</div>
                  <div className="text-sm text-[#B0B0B0]">開始建立你想看的影片集合！</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-3 pt-2 pb-20 w-full max-w-full overflow-x-hidden">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center bg-[#232323] border border-white/5 rounded-2xl mb-3 cursor-pointer transition-all duration-200 overflow-hidden relative w-full max-w-full min-w-0 hover:bg-[#2a2a2a] hover:border-white/10"
                  onClick={() => onSelect(playlist.id)}
                >
                  {/* 縮圖 */}
                  <div className="w-20 h-20 flex-shrink-0 bg-white/5 flex items-center justify-center overflow-hidden">
                    {playlist.videos[0] ? (
                      <img
                        src={playlist.videos[0].thumbnail}
                        alt={playlist.name}
                        className="object-cover w-full h-full rounded-l-lg max-w-full max-h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-[#B0B0B0] text-xs">No Cover</div>
                    )}
                  </div>
                  {/* 右側資訊 */}
                  <div className="flex-1 flex flex-col justify-center pl-3 py-2 min-w-0 max-w-full">
                    <div className="font-bold text-sm text-white mb-1 truncate max-w-full">{playlist.name}</div>
                    <div className="text-xs text-[#B0B0B0] mb-1 truncate max-w-full">{playlist.description}</div>
                    <div className="text-xs text-[#B0B0B0] truncate max-w-full">{playlist.videos.length} 部影片 ・ {t('createdAt', { date: formatDate(playlist.createdAt) })}</div>
                  </div>
                  {/* ...按鈕 */}
                  <div className="pr-3 flex flex-col items-end justify-center flex-shrink-0">
                    <button
                      className="p-2 border-0 flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors duration-150"
                      onClick={e => {
                        e.stopPropagation();
                        setMenuOpenId(playlist.id === menuOpenId ? null : playlist.id);
                      }}
                    >
                      <MoreHorizontal size={20} className="text-inherit" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}

              {/* 底部抽屜：放在 map 外，避免事件冒泡至卡片 onClick */}
              {(() => {
                const active = menuOpenId ? playlists.find(p => p.id === menuOpenId) : null;
                return (
                  <AnimatePresence>
                    {active && (
                      <>
                        {ReactDOM.createPortal(
                          <motion.div
                            className="fixed inset-0 z-[9998] bg-black/60"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.12 } }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMenuOpenId(null)}
                          />,
                          document.body
                        )}
                        {ReactDOM.createPortal(
                          <motion.div
                            className="fixed left-0 right-0 bottom-0 z-[9999] bg-[#191919]/95 backdrop-blur-xl border-t border-white/5 rounded-t-[28px] shadow-2xl"
                            initial={{ y: 200 }}
                            animate={{ y: 0 }}
                            exit={{ y: 200 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.12}
                            onDragEnd={(_, info) => {
                              if (info.offset.y > 80 || info.velocity.y > 600) setMenuOpenId(null);
                            }}
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="w-full flex justify-center pt-3 pb-2">
                              <div className="w-10 h-1 rounded-full bg-white/25" />
                            </div>
                            <div className="px-5 pt-1 pb-3 border-b border-white/5">
                              <p className="text-white font-semibold text-base truncate">{active.name}</p>
                              <p className="text-white/40 text-sm mt-0.5">{active.videos.length} 部影片</p>
                            </div>
                            <div className="p-2 pb-8">
                              <button
                                className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-zinc-100 text-[15px] font-medium hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors"
                                onClick={() => {
                                  setEditModal({ open: true, playlist: active });
                                  setMenuOpenId(null);
                                }}
                              >
                                <Pencil className="w-[18px] h-[18px] text-zinc-100/80 flex-shrink-0" />
                                編輯名稱與內容
                              </button>
                              <div className="my-1 h-px bg-white/10" />
                              <button
                                className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-red-400 text-[15px] font-medium hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors"
                                onClick={() => handleDelete(active.id)}
                              >
                                <Trash2 className="w-[18px] h-[18px] text-red-400 flex-shrink-0" />
                                刪除清單
                              </button>
                            </div>
                          </motion.div>,
                          document.body
                        )}
                      </>
                    )}
                  </AnimatePresence>
                );
              })()}

              {/* 浮動新增播放清單按鈕（FAB） */}
              <button
                className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-[#00D2BE] text-white flex items-center justify-center shadow-lg hover:bg-[#00bfa6] transition"
                onClick={() => setShowModal(true)}
                aria-label="新增播放清單"
                style={{ maxWidth: '100vw' }}
              >
                <AddIcon style={{ fontSize: 32 }} />
              </button>
            </div>
          )}
        </>
      )}
      <CreatePlaylistModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />
      <CreatePlaylistModal
        isOpen={editModal.open}
        onClose={() => setEditModal({open: false})}
        onCreate={handleEdit}
        initialName={editModal.playlist?.name}
        initialDescription={editModal.playlist?.description}
        mode="edit"
        initialIsPrivate={editModal.playlist?.isPrivate}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        description={
          deleteTargetId
            ? `確定要刪除「${playlists.find(pl => pl.id === deleteTargetId)?.name ?? ''}」嗎？`
            : ''
        }
      />
    </div>
  );
};

export default PlaylistList; 